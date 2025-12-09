import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { upsertGrade } from "@/lib/db/queries/teacher";

/**
 * POST /api/teacher/grades
 * Update or create a grade for a student
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userRole = (session.user as any).role;

    if (userRole !== "teacher") {
      return NextResponse.json(
        { error: "Access denied. Teacher role required." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { examId, studentId, marksObtained } = body;

    if (!examId || !studentId || marksObtained === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const grade = await upsertGrade({
      examId: parseInt(examId),
      studentId: parseInt(studentId),
      marksObtained: parseInt(marksObtained),
    });

    return NextResponse.json({
      success: true,
      grade,
    });
  } catch (error) {
    console.error("Error updating grade:", error);
    return NextResponse.json(
      { error: "Failed to update grade" },
      { status: 500 }
    );
  }
}
