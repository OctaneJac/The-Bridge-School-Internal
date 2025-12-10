import { AdminSidebar } from "@/components/nav/admin/app-sidebar";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
  } from "@/components/ui/sidebar"
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserBranch, getAllBranches } from "@/lib/db/queries/admin";
import { BranchProvider } from "@/contexts/branch-context";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  const userRole = (session?.user as any)?.role;
  
  // Get user's branch
  const userBranch = userId ? await getUserBranch(userId) : null;
  
  // For super_admin: fetch all branches and initialize with first branch if userBranch is null
  // For admin/teacher: use their assigned branch
  let initialBranch = userBranch;
  let allBranches: any[] = [];
  
  if (userRole === "super_admin") {
    allBranches = await getAllBranches();
    // If super_admin has no branch assigned, initialize with first branch from list
    if (!initialBranch && allBranches.length > 0) {
      initialBranch = allBranches[0];
    }
  }

  return (
    <BranchProvider initialBranch={initialBranch || null} initialBranchId={initialBranch?.id || null}>
      <SidebarProvider>
        <AdminSidebar branch={initialBranch} allBranches={allBranches} userRole={userRole} />
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
