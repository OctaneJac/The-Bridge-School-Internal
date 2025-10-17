import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

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

  // Check if user has teacher, admin, or super_admin role
  const userRole = (session.user as any)?.role;
  if (userRole !== "teacher" && userRole !== "admin" && userRole !== "super_admin") {
    redirect("/unauthorized");
  }

  return <>{children}</>;
}
