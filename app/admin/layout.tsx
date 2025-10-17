import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Check if user is authenticated
  if (!session) {
    redirect("/login");
  }

  // Check if user has admin role only
  const userRole = (session.user as any)?.role;
  if (userRole !== "admin") {
    redirect("/unauthorized");
  }

  return <>{children}</>;
}
