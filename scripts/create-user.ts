/**
 * Script to create a test user in the database
 * Run with: npx tsx scripts/create-user.ts
 */

import { db } from "../lib/db";
import { users } from "../lib/db/schema";
import { hashPassword } from "../lib/password";

async function createUser(email: string, password: string, role: "teacher" | "admin" | "super_admin") {
  try {
    console.log(`Creating user: ${email} with role: ${role}`);
    
    const hashedPassword = await hashPassword(password);
    
    await db.insert(users).values({
      email,
      password: hashedPassword,
      role,
    });
    
    console.log("✅ User created successfully!");
  } catch (error) {
    console.error("❌ Error creating user:", error);
  }
  
  process.exit(0);
}

// Example usage - modify these values:
createUser("teacher@example.com", "password123", "teacher");
