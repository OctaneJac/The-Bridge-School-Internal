import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    const user = await authenticateUser(email, password);

    return NextResponse.json(user);
  } catch (error: any) {
    const status = error.message.includes("required") ? 400 : 401;
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: status === 400 ? 400 : 500 }
    );
  }
}

