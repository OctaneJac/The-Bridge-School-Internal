/**
 * Admin-specific database queries
 * Add your admin-related database operations here
 */

import { db } from "../index";
import { users } from "../schema";
import { eq, or } from "drizzle-orm";

/**
 * Get all admins
 * Returns list of users with 'admin' role
 */
export async function getAllAdmins() {
  const admins = await db
    .select({
      id: users.id,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.role, "admin"));
  
  return admins;
}

/**
 * Get admin by ID
 */
export async function getAdminById(adminId: string) {
  const admin = await db
    .select({
      id: users.id,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, adminId))
    .limit(1);
  
  if (admin[0]?.role !== "admin" && admin[0]?.role !== "super_admin") {
    return null;
  }
  
  return admin[0];
}

/**
 * Get all users (admin function)
 * Admins can view all users in the system
 */
export async function getAllUsers() {
  const allUsers = await db
    .select({
      id: users.id,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(users);
  
  return allUsers;
}

/**
 * Get users by role (admin function)
 */
export async function getUsersByRole(role: "teacher" | "admin" | "super_admin") {
  const roleUsers = await db
    .select({
      id: users.id,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.role, role));
  
  return roleUsers;
}

/**
 * Get user statistics (admin function)
 * Returns count of users by role
 */
export async function getUserStatistics() {
  const allUsers = await getAllUsers();
  
  const stats = {
    total: allUsers.length,
    teachers: allUsers.filter(u => u.role === "teacher").length,
    admins: allUsers.filter(u => u.role === "admin").length,
    superAdmins: allUsers.filter(u => u.role === "super_admin").length,
  };
  
  return stats;
}

/**
 * Delete user (admin function)
 * Removes a user from the system
 */
export async function deleteUser(userId: string) {
  const deleted = await db
    .delete(users)
    .where(eq(users.id, userId))
    .returning({
      id: users.id,
      email: users.email,
    });
  
  return deleted[0];
}

// TODO: Add more admin-specific queries
// Examples:
// - manageSchoolSettings()
// - getSystemReports()
// - manageClasses()
// - assignTeachersToClasses()
// - viewAllStudentRecords()
// - generateReports()
