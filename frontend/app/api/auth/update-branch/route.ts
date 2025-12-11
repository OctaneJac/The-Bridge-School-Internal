import { NextRequest, NextResponse } from "next/server";
import { getAuthSession, getUserRole } from "@/lib/auth";
import { sql } from "@/lib/db";

/**
 * API route to validate branch switching for super_admin
 * This only validates the branch exists - the actual branch_id update
 * happens in the session token via NextAuth's update() function.
 * No database changes are made.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (getUserRole(session) !== "super_admin") {
      return NextResponse.json(
        { error: "Only super_admin can switch branches" },
        { status: 403 }
      );
    }

    const { branch_id } = await request.json();

    if (!branch_id || typeof branch_id !== "number") {
      return NextResponse.json(
        { error: "Valid branch_id is required" },
        { status: 400 }
      );
    }

    const branches = await sql`
      SELECT id FROM branches WHERE id = ${branch_id} LIMIT 1
    `;

    if (branches.length === 0) {
      return NextResponse.json(
        { error: "Branch not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, branch_id });
  } catch (error) {
    console.error("Error updating branch:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

