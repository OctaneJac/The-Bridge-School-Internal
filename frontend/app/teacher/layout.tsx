import { TeacherSidebar } from "@/components/nav/teacher/app-sidebar";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
  } from "@/components/ui/sidebar"
import { getAuthSession, getBranchId } from "@/lib/auth";
import { BranchProvider } from "@/contexts/branch-context";
import { getBranchById } from "@/lib/db/admin";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getAuthSession();
  const branchId = getBranchId(session);
  const branch = branchId ? await getBranchById(branchId) : null;

  return (
    <BranchProvider initialBranch={branch} initialBranchId={branch?.id || null}>
      <SidebarProvider>
        <TeacherSidebar branch={branch} />
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
