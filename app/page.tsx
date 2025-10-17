import { Button } from "@/components/ui/button";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getServerSession(authOptions);
  
  // If user is logged in, redirect to their appropriate portal
  if (session?.user) {
    const userRole = (session.user as any)?.role;
    
    if (userRole === "teacher") {
      redirect("/teacher");
    } else if (userRole === "admin") {
      redirect("/admin");
    } else if (userRole === "super_admin") {
      redirect("/super_admin");
    }
  }
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold tracking-tight">Welcome to The Bridge School Internal Portal</h1>
      <p className="mt-4 text-lg text-gray-600">
      </p>
      <Button className="mt-4"><a href="/login">Access your portal</a>
      </Button>
    </div>
  );
}
