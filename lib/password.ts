/**
 * Utility functions for password hashing and verification
 * Use these when creating or updating users in your database
 */

import bcrypt from "bcryptjs";

/**
 * Hash a plain text password
 * @param password - The plain text password to hash
 * @returns Promise<string> - The hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Verify a password against a hash
 * @param password - The plain text password to verify
 * @param hashedPassword - The hashed password to compare against
 * @returns Promise<boolean> - True if password matches, false otherwise
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Example usage:
 * 
 * // When creating a user:
 * const hashedPassword = await hashPassword("userPassword123");
 * await db.user.create({
 *   email: "user@example.com",
 *   password: hashedPassword
 * });
 * 
 * // When verifying a password:
 * const isValid = await verifyPassword("userPassword123", user.password);
 * if (isValid) {
 *   // Password is correct
 * }
 */
