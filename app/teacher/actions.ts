"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { 
  getCourseStudentsWithGrades, 
  getTeacherCourseById,
  createExam,
  upsertGrade 
} from "@/lib/db/queries/teacher";

/**
 * Server action to fetch course data with students and grades
 */
export async function fetchCourseData(courseId: number) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    throw new Error("Unauthorized");
  }

  const userId = (session.user as any).id;
  const userRole = (session.user as any).role;

  if (userRole !== "teacher") {
    throw new Error("Access denied. Teacher role required.");
  }

  const [courseInfo, data] = await Promise.all([
    getTeacherCourseById(userId, courseId),
    getCourseStudentsWithGrades(userId, courseId)
  ]);

  return {
    courseInfo,
    ...data,
  };
}

/**
 * Server action to create a new exam
 */
export async function createExamAction({
  courseId,
  sessionId,
  name,
  maxMarks,
  examDate,
}: {
  courseId: number;
  sessionId: number;
  name: string;
  maxMarks: number;
  examDate?: string;
}) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    throw new Error("Unauthorized");
  }

  const userRole = (session.user as any).role;

  if (userRole !== "teacher") {
    throw new Error("Access denied. Teacher role required.");
  }

  const exam = await createExam({
    courseId,
    sessionId,
    name,
    maxMarks,
    examDate,
  });

  return exam;
}

/**
 * Server action to update or create grades
 */
export async function saveGradesAction(
  grades: Array<{ examId: number; studentId: number; marksObtained: number }>
) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    throw new Error("Unauthorized");
  }

  const userRole = (session.user as any).role;

  if (userRole !== "teacher") {
    throw new Error("Access denied. Teacher role required.");
  }

  const results = await Promise.all(
    grades.map((grade) =>
      upsertGrade({
        examId: grade.examId,
        studentId: grade.studentId,
        marksObtained: grade.marksObtained,
      })
    )
  );

  return results;
}

/**
 * Server action to fetch teacher courses
 */
export async function fetchTeacherCourses() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    throw new Error("Unauthorized");
  }

  const userId = (session.user as any).id;
  const userRole = (session.user as any).role;

  if (userRole !== "teacher") {
    throw new Error("Access denied. Teacher role required.");
  }

  const { getTeacherCourses } = await import("@/lib/db/queries/teacher");
  const courses = await getTeacherCourses(userId);

  return courses;
}
