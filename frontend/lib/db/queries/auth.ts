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
      first_name: users.first_name,
      last_name: users.last_name,
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
    first_name: user.first_name,
    last_name: user.last_name,
    branch_id: user.branch_id,
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
  role: "teacher" | "admin" | "super_admin",
  options?: {
    first_name?: string;
    last_name?: string;
  }
) {
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const newUser = await db
    .insert(users)
    .values({
      email,
      password: hashedPassword,
      role,
      first_name: options?.first_name,
      last_name: options?.last_name,
    })
    .returning({
      id: users.id,
      email: users.email,
      role: users.role,
      first_name: users.first_name,
      last_name: users.last_name,
      createdAt: users.createdAt,
    });
  
  return newUser[0];
}
