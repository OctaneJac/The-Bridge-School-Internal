import { db } from "../index";
import { users } from "../schema";
import { eq } from "drizzle-orm";

/**
 * Get all teachers
 * Returns list of users with 'teacher' role
 */
export async function getAllTeachers() {
  const teachers = await db
    .select({
      id: users.id,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.role, "teacher"));
  
  return teachers;
}

/**Get teacher by ID*/
export async function getTeacherById(teacherId: string) {
  const teacher = await db
    .select({
      id: users.id,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, teacherId))
    .limit(1);
  
  if (teacher[0]?.role !== "teacher") {
    return null;
  }
  
  return teacher[0];
}

/**
 * Get teacher profile
 * Returns detailed teacher information
 */
export async function getTeacherProfile(teacherId: string) {
  const teacher = await getTeacherById(teacherId);
  
  if (!teacher) {
    return null;
  }
  
  // Add additional teacher-specific data here
  // For example: classes, students, subjects, etc.
  
  return {
    ...teacher,
    // Add more fields as needed:
    // classes: await getTeacherClasses(teacherId),
    // students: await getTeacherStudents(teacherId),
  };
}

