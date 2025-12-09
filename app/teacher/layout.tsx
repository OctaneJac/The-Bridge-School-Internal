import { TeacherSidebar } from "@/components/nav/teacher/app-sidebar";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
  } from "@/components/ui/sidebar"
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserBranch } from "@/lib/db/queries/admin";
import { BranchProvider } from "@/contexts/branch-context";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  
  // Get teacher's branch
  const userBranch = userId ? await getUserBranch(userId) : null;

  return (
    <BranchProvider initialBranch={userBranch || null} initialBranchId={userBranch?.id || null}>
      <SidebarProvider>
        <TeacherSidebar branch={userBranch} />
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
