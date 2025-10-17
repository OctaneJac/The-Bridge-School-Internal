/**
 * Teacher-specific database queries
 * Add your teacher-related database operations here
 */

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

/**
 * Get courses assigned to a teacher
 * Returns list of courses with session and branch information
 */
export async function getTeacherCourses(teacherId: string) {
  const { teacherCourses, courses, sessions, branches } = await import("../schema");
  
  const teacherCoursesData = await db
    .select({
      id: courses.id,
      name: courses.name,
      sessionName: sessions.name,
      sessionId: sessions.id,
      branchName: branches.name,
      branchId: branches.id,
      createdAt: courses.created_at,
    })
    .from(teacherCourses)
    .innerJoin(courses, eq(teacherCourses.course_id, courses.id))
    .leftJoin(sessions, eq(courses.session_id, sessions.id))
    .leftJoin(branches, eq(courses.branch_id, branches.id))
    .where(eq(teacherCourses.teacher_id, teacherId));
  
  return teacherCoursesData;
}

/**
 * Get course details for a teacher
 * Returns detailed information about a specific course
 */
export async function getTeacherCourseById(teacherId: string, courseId: number) {
  const { teacherCourses, courses, sessions, branches, classes, classCourses } = await import("../schema");
  const { and } = await import("drizzle-orm");
  
  const courseData = await db
    .select({
      id: courses.id,
      name: courses.name,
      sessionName: sessions.name,
      sessionId: sessions.id,
      branchName: branches.name,
      branchId: branches.id,
      className: classes.name,
      createdAt: courses.created_at,
      updatedAt: courses.updated_at,
    })
    .from(teacherCourses)
    .innerJoin(courses, eq(teacherCourses.course_id, courses.id))
    .leftJoin(sessions, eq(courses.session_id, sessions.id))
    .leftJoin(branches, eq(courses.branch_id, branches.id))
    .leftJoin(classCourses, eq(classCourses.course_id, courses.id))
    .leftJoin(classes, eq(classCourses.class_id, classes.id))
    .where(and(
      eq(teacherCourses.teacher_id, teacherId),
      eq(courses.id, courseId)
    ))
    .limit(1);
  
  return courseData[0] || null;
}

/**
 * Get students enrolled in a course with their exam grades
 * Returns list of students with their grades for all exams in the course
 */
export async function getCourseStudentsWithGrades(teacherId: string, courseId: number) {
  const { 
    students, 
    studentClasses, 
    classes, 
    classCourses,
    exams,
    grades,
    courses
  } = await import("../schema");
  const { and } = await import("drizzle-orm");

  // First verify the teacher has access to this course
  const { teacherCourses } = await import("../schema");
  const accessCheck = await db
    .select({ id: teacherCourses.id })
    .from(teacherCourses)
    .where(and(
      eq(teacherCourses.teacher_id, teacherId),
      eq(teacherCourses.course_id, courseId)
    ))
    .limit(1);

  if (accessCheck.length === 0) {
    throw new Error("Access denied to this course");
  }

  // Get all students in classes that have this course
  const studentsData = await db
    .select({
      studentId: students.id,
      studentName: students.name,
    })
    .from(students)
    .innerJoin(studentClasses, eq(students.id, studentClasses.student_id))
    .innerJoin(classes, eq(studentClasses.class_id, classes.id))
    .innerJoin(classCourses, eq(classes.id, classCourses.class_id))
    .where(eq(classCourses.course_id, courseId))
    .groupBy(students.id, students.name);

  // Get all exams for this course
  const examsData = await db
    .select({
      id: exams.id,
      name: exams.name,
      maxMarks: exams.max_marks,
      examDate: exams.exam_date,
    })
    .from(exams)
    .where(eq(exams.course_id, courseId));

  // Get all grades for this course
  const gradesData = await db
    .select({
      examId: grades.exam_id,
      studentId: grades.student_id,
      marksObtained: grades.marks_obtained,
      gradeId: grades.id,
    })
    .from(grades)
    .innerJoin(exams, eq(grades.exam_id, exams.id))
    .where(eq(exams.course_id, courseId));

  return {
    students: studentsData,
    exams: examsData,
    grades: gradesData,
  };
}

/**
 * Create a new exam for a course
 */
export async function createExam({
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
  const { exams } = await import("../schema");
  
  const [exam] = await db
    .insert(exams)
    .values({
      course_id: courseId,
      session_id: sessionId,
      name,
      max_marks: maxMarks,
      exam_date: examDate,
    })
    .returning();

  return exam;
}

/**
 * Update or create a grade for a student
 */
export async function upsertGrade({
  examId,
  studentId,
  marksObtained,
}: {
  examId: number;
  studentId: number;
  marksObtained: number;
}) {
  const { grades } = await import("../schema");
  const { and } = await import("drizzle-orm");

  // Check if grade already exists
  const existingGrade = await db
    .select({ id: grades.id })
    .from(grades)
    .where(and(
      eq(grades.exam_id, examId),
      eq(grades.student_id, studentId)
    ))
    .limit(1);

  if (existingGrade.length > 0) {
    // Update existing grade
    const [updated] = await db
      .update(grades)
      .set({ marks_obtained: marksObtained })
      .where(eq(grades.id, existingGrade[0].id))
      .returning();
    return updated;
  } else {
    // Insert new grade
    const [inserted] = await db
      .insert(grades)
      .values({
        exam_id: examId,
        student_id: studentId,
        marks_obtained: marksObtained,
      })
      .returning();
    return inserted;
  }
}

// TODO: Add more teacher-specific queries
// Examples:
// - getTeacherClasses(teacherId)
// - getTeacherSchedule(teacherId)
// - assignTeacherToClass(teacherId, classId)
// - removeTeacherFromClass(teacherId, classId)
