import { AdminSidebar } from "@/components/nav/admin/app-sidebar";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
  } from "@/components/ui/sidebar"
import { getAuthSession, getUserRole, getBranchId } from "@/lib/auth";
import { BranchProvider } from "@/contexts/branch-context";
import { getBranchById, getAllBranches } from "@/lib/db/admin";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getAuthSession();
  const userRole = getUserRole(session);
  const sessionBranchId = getBranchId(session);
  
  let initialBranch = null;
  let allBranches: any[] = [];
  
  if (userRole === "super_admin") {
    allBranches = await getAllBranches();
    initialBranch = await getBranchById(sessionBranchId || 1);
  } else if (sessionBranchId) {
    initialBranch = await getBranchById(sessionBranchId);
  }

  return (
    <BranchProvider initialBranch={initialBranch || null} initialBranchId={initialBranch?.id || null}>
      <SidebarProvider>
        <AdminSidebar branch={initialBranch} allBranches={allBranches} userRole={userRole || undefined} />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </BranchProvider>
  );
}
