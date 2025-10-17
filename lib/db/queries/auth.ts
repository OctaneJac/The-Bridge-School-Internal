/**
 * Authentication-related database queries
 * Handles user authentication, session management, and user lookups
 */

import { db } from "../index";
import { users } from "../schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

/**
 * Get user by email
 * Used for login authentication
 */
export async function getUserByEmail(email: string) {
  const user = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  
  return user[0] || null;
}

/**
 * Get user by ID
 * Used for session validation and user profile lookups
 */
export async function getUserById(id: string) {
  const user = await db
    .select({
      id: users.id,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, id))
    .limit(1);
  
  return user[0] || null;
}

/**
 * Verify user password
 * Compares plain password with hashed password from database
 */
export async function verifyUserPassword(email: string, password: string) {
  const user = await getUserByEmail(email);
  
  if (!user) {
    return null;
  }
  
  const isValid = await bcrypt.compare(password, user.password);
  
  if (!isValid) {
    return null;
  }
  
  // Return user without password
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
}

/**
 * Create a new user
 * Password will be automatically hashed
 */
export async function createUser(
  email: string,
  password: string,
  role: "teacher" | "admin" | "super_admin"
) {
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const newUser = await db
    .insert(users)
    .values({
      email,
      password: hashedPassword,
      role,
    })
    .returning({
      id: users.id,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
    });
  
  return newUser[0];
}

/**
 * Update user password
 * New password will be automatically hashed
 */
export async function updateUserPassword(userId: string, newPassword: string) {
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  
  const updated = await db
    .update(users)
    .set({ password: hashedPassword })
    .where(eq(users.id, userId))
    .returning({
      id: users.id,
      email: users.email,
    });
  
  return updated[0];
}

/**
 * Update user role
 * Only admins and super_admins should call this
 */
export async function updateUserRole(
  userId: string,
  newRole: "teacher" | "admin" | "super_admin"
) {
  const updated = await db
    .update(users)
    .set({ role: newRole })
    .where(eq(users.id, userId))
    .returning({
      id: users.id,
      email: users.email,
      role: users.role,
    });
  
  return updated[0];
}
