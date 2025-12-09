'use client';

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
// import { authOptions } from "../api/auth/[...nextauth]/route";

export default async function Dashboard() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Welcome {session?.user?.name}</h1>
      <p>This is a protected dashboard page.</p>
    </div>
  );
}
