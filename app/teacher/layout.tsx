import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { getUserById } from "@/lib/db/queries";
import { TeacherSidebar } from "@/components/nav/teacher-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";

export default async function TeacherLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Check if user is authenticated
  if (!session) {
    redirect("/login");
  }

  // Check if user has teacher role only
  const userRole = (session.user as any)?.role;
  if (userRole !== "teacher") {
    redirect("/unauthorized");
  }

  // Get full user details from database
  const userId = (session.user as any)?.id;
  const user = await getUserById(userId);

  if (!user) {
    redirect("/login");
  }

  return (
    <SidebarProvider>
      <TeacherSidebar 
        user={{
          firstName: user.first_name || '',
          lastName: user.last_name || '',
          email: user.email,
        }}
      />
      <SidebarInset>
        <div className="absolute top-4 right-4 z-50">
          <AnimatedThemeToggler />
        </div>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
