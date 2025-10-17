/**
 * Script to seed the database with example users
 * Run with: npx tsx scripts/seed-users.ts
 */

import { config } from "dotenv";

// Load environment variables from .env.local
config({ path: ".env.local" });

import { db } from "../lib/db";
import { users } from "../lib/db/schema";
import { hashPassword } from "../lib/password";

async function seedUsers() {
  try {
    console.log("🌱 Seeding database with example users...\n");

    const exampleUsers = [
      {
        email: "teacher@example.com",
        password: "teacher123",
        role: "teacher" as const,
      },
      {
        email: "admin@example.com",
        password: "admin123",
        role: "admin" as const,
      },
      {
        email: "superadmin@example.com",
        password: "superadmin123",
        role: "super_admin" as const,
      },
    ];

    for (const user of exampleUsers) {
      console.log(`Creating user: ${user.email} (${user.role})`);
      
      const hashedPassword = await hashPassword(user.password);
      
      await db.insert(users).values({
        email: user.email,
        password: hashedPassword,
        role: user.role,
      });
      
      console.log(`✅ Created: ${user.email}`);
    }

    console.log("\n🎉 All users created successfully!");
    console.log("\n📝 Login credentials:");
    console.log("━".repeat(50));
    exampleUsers.forEach((user) => {
      console.log(`Email: ${user.email}`);
      console.log(`Password: ${user.password}`);
      console.log(`Role: ${user.role}`);
      console.log("━".repeat(50));
    });
  } catch (error: any) {
    if (error.code === "23505") {
      console.error("❌ Error: One or more users already exist in the database");
    } else {
      console.error("❌ Error seeding users:", error);
    }
  }

  process.exit(0);
}

seedUsers();
