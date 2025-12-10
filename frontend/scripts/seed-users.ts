#!/usr/bin/env tsx
/**
 * Seed script to create test users for development
 * 
 * Usage:
 *   npx tsx scripts/seed-users.ts
 * 
 * Or add to package.json:
 *   "seed:users": "tsx scripts/seed-users.ts"
 */

import { createUser, getUserByEmail } from "../lib/db/queries";

const TEST_USERS = [
  {
    email: "teacher@test.com",
    password: "teacher123",
    role: "teacher" as const,
    firstName: "John",
    lastName: "Teacher",
  },
  {
    email: "admin@test.com",
    password: "admin123",
    role: "admin" as const,
    firstName: "Jane",
    lastName: "Admin",
  },
];

async function seedUsers() {
  console.log("🌱 Starting user seed...\n");

  for (const userData of TEST_USERS) {
    try {
      // Check if user already exists
      const existingUser = await getUserByEmail(userData.email);
      
      if (existingUser) {
        console.log(`⚠️  User ${userData.email} already exists. Skipping...`);
        continue;
      }

      // Create user
      const user = await createUser(
        userData.email,
        userData.password,
        userData.role,
        {
          first_name: userData.firstName,
          last_name: userData.lastName,
        }
      );

      console.log(`✅ Created ${userData.role} user:`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Password: ${userData.password}`);
      console.log(`   Role: ${user.role}\n`);
    } catch (error) {
      console.error(`❌ Error creating user ${userData.email}:`, error);
      if (error instanceof Error) {
        console.error(`   ${error.message}\n`);
      }
    }
  }

  console.log("✨ User seeding completed!");
  console.log("\n📝 Test Credentials:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Teacher:");
  console.log("  Email: teacher@test.com");
  console.log("  Password: teacher123");
  console.log("\nAdmin:");
  console.log("  Email: admin@test.com");
  console.log("  Password: admin123");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

// Run the seed function
seedUsers()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });

