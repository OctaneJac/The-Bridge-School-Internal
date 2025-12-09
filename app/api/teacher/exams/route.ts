import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createExam } from "@/lib/db/queries/teacher";

/**
 * POST /api/teacher/exams
 * Create a new exam for a course
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
    const { courseId, sessionId, name, maxMarks } = body;

    if (!courseId || !sessionId || !name || !maxMarks) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const exam = await createExam({
      courseId: parseInt(courseId),
      sessionId: parseInt(sessionId),
      name,
      maxMarks: parseInt(maxMarks),
    });

    return NextResponse.json({
      success: true,
      exam,
    });
  } catch (error) {
    console.error("Error creating exam:", error);
    return NextResponse.json(
      { error: "Failed to create exam" },
      { status: 500 }
    );
  }
}
