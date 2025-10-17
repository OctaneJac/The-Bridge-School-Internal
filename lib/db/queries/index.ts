/**
 * Central export file for all database queries
 * Import queries from here for better organization
 * 
 * Usage:
 * import { getUserByEmail, getAllTeachers } from '@/lib/db/queries'
 */

// Auth queries
export * from "./auth";

// Role-specific queries
export * from "./teacher";
export * from "./admin";
export * from "./super-admin";

// Re-export db instance for direct access if needed
export { db } from "../index";
