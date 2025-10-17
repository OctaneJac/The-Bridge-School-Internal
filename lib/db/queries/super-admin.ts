/**
 * Super Admin-specific database queries
 * Add your super admin-related database operations here
 */

import { db } from "../index";
import { users } from "../schema";
import { sql } from "drizzle-orm";

/**
 * Get all super admins
 */
export async function getAllSuperAdmins() {
  const superAdmins = await db
    .select({
      id: users.id,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(sql`${users.role} = 'super_admin'`);
  
  return superAdmins;
}

/**
 * Get system-wide statistics (super admin function)
 * Returns comprehensive system statistics
 */
export async function getSystemStatistics() {
  const allUsers = await db
    .select({
      id: users.id,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(users);
  
  const stats = {
    users: {
      total: allUsers.length,
      teachers: allUsers.filter(u => u.role === "teacher").length,
      admins: allUsers.filter(u => u.role === "admin").length,
      superAdmins: allUsers.filter(u => u.role === "super_admin").length,
    },
    recentUsers: allUsers
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 5),
    // Add more system-wide stats as needed
  };
  
  return stats;
}

/**
 * Bulk delete users (super admin function)
 * Use with caution - deletes multiple users at once
 */
export async function bulkDeleteUsers(userIds: string[]) {
  const deleted = await db
    .delete(users)
    .where(sql`${users.id} = ANY(${userIds})`)
    .returning({
      id: users.id,
      email: users.email,
    });
  
  return deleted;
}

/**
 * Get database health status (super admin function)
 * Returns information about database connection and status
 */
export async function getDatabaseHealth() {
  try {
    const result = await db.execute(sql`SELECT NOW() as current_time`);
    return {
      status: "healthy",
      timestamp: new Date(),
      connected: true,
    };
  } catch (error) {
    return {
      status: "unhealthy",
      error: error instanceof Error ? error.message : "Unknown error",
      connected: false,
    };
  }
}

// TODO: Add more super admin-specific queries
// Examples:
// - manageSystemConfiguration()
// - viewAuditLogs()
// - backupDatabase()
// - restoreDatabase()
// - manageApiKeys()
// - systemMaintenance()
// - bulkOperations()
