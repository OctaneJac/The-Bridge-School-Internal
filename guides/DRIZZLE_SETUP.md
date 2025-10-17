    # Drizzle ORM Setup Guide

## Overview
Drizzle ORM has been integrated into your project with a simple User table schema that supports role-based authentication.

## Files Created

### Database Configuration
- `lib/db/schema.ts` - Database schema definition for the User table
- `lib/db/index.ts` - Drizzle database instance
- `drizzle.config.ts` - Drizzle Kit configuration

### Updated Files
- `lib/auth.ts` - Updated to use Drizzle ORM for user queries
- `middleware.ts` - Updated with role-based access control (checks for 'teacher' role)
- `app/teacher/page.tsx` - Updated to display user role
- `app/unauthorized/page.tsx` - Created for access denied scenarios

## Database Schema

Your User table schema:
```typescript
{
  id: uuid (primary key, auto-generated)
  email: varchar(255) (unique, not null)
  password: varchar(255) (not null, bcrypt hashed)
  role: varchar(50) (not null) // 'teacher', 'admin', 'super_admin'
}
```

## Setup Instructions

### 1. Configure Database URL

Add your PostgreSQL database URL to `.env.local`:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
```

### 2. Generate Migration (Optional)

If you need to create the table:
```bash
npx drizzle-kit generate
npx drizzle-kit migrate
```

Or run the SQL directly:
```sql
CREATE TABLE "User" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" VARCHAR(255) NOT NULL UNIQUE,
  "password" VARCHAR(255) NOT NULL,
  "role" VARCHAR(50) NOT NULL
);
```

### 3. Insert Test Users

Create test users with hashed passwords:

```sql
-- Password: 'password123' (hashed with bcrypt)
INSERT INTO "User" (email, password, role) VALUES 
('teacher@example.com', '$2a$10$YourHashedPasswordHere', 'teacher'),
('admin@example.com', '$2a$10$YourHashedPasswordHere', 'admin');
```

To generate a hashed password, you can use the password utility:
```typescript
import { hashPassword } from './lib/password';
const hashed = await hashPassword('password123');
console.log(hashed);
```

## How Role-Based Access Works

### Teacher Route Protection

The middleware checks:
1. ✅ User must be authenticated (has valid session)
2. ✅ User must have role: `teacher`, `admin`, or `super_admin`
3. ❌ If not, redirects to `/unauthorized`

### Access Flow
```
User → /teacher → Middleware checks:
  ↓
  Is authenticated? → No → Redirect to /login
  ↓
  Has teacher/admin/super_admin role? → No → Redirect to /unauthorized
  ↓
  Yes → Allow access to /teacher
```

### Code Explanation

**Database Query (lib/auth.ts)**:
```typescript
async function getUserByEmail(email: string) {
  const user = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  return user[0] || null;
}
```

**Role Check (middleware.ts)**:
```typescript
if (req.nextUrl.pathname.startsWith("/teacher")) {
  if (token?.role !== "teacher" && 
      token?.role !== "admin" && 
      token?.role !== "super_admin") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }
}
```

## Testing

### 1. Start the development server:
```bash
npm run dev
```

### 2. Test Role-Based Access:

**As a Teacher:**
- Login with a user that has `role = 'teacher'`
- Access `/teacher` → ✅ Should work
- See role badge on dashboard

**As a Non-Teacher:**
- Login with a user that has a different role
- Access `/teacher` → ❌ Redirected to `/unauthorized`

**Without Login:**
- Access `/teacher` → ❌ Redirected to `/login`

## Extending the Setup

### Add More Roles

Update middleware to protect different routes:
```typescript
if (req.nextUrl.pathname.startsWith("/admin")) {
  if (token?.role !== "admin" && token?.role !== "super_admin") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }
}
```

### Add More Fields to User Table

Update `lib/db/schema.ts`:
```typescript
export const users = pgTable("User", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).notNull(),
  name: varchar("name", { length: 255 }), // New field
  createdAt: timestamp("created_at").defaultNow(), // New field
});
```

### Query Examples

**Get all teachers:**
```typescript
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const teachers = await db
  .select()
  .from(users)
  .where(eq(users.role, "teacher"));
```

**Update user role:**
```typescript
await db
  .update(users)
  .set({ role: "admin" })
  .where(eq(users.email, "user@example.com"));
```

**Create new user:**
```typescript
import { hashPassword } from "@/lib/password";

const hashedPassword = await hashPassword("password123");
await db.insert(users).values({
  email: "newteacher@example.com",
  password: hashedPassword,
  role: "teacher",
});
```

## Troubleshooting

### "Database query not implemented" error
- ✅ Fixed! The query is now implemented with Drizzle

### "Access Denied" when logging in as teacher
- Check the user's role in the database
- Ensure role is exactly "teacher", "admin", or "super_admin" (case-sensitive)
- Check middleware.ts is configured correctly

### Database connection errors
- Verify DATABASE_URL in `.env.local`
- Ensure PostgreSQL is running
- Check database credentials

### Role not showing up in session
- Check the JWT callback in `lib/auth.ts`
- Clear browser cookies and login again
- Verify the user has a role in the database

## Security Notes

1. **Passwords** - Always use bcrypt to hash passwords
2. **Roles** - Validate roles on the backend, not just frontend
3. **Session** - Uses JWT strategy (no database sessions)
4. **Environment** - Keep DATABASE_URL secret, never commit `.env.local`

## Drizzle Kit Commands

```bash
# Generate migration from schema
npx drizzle-kit generate

# Push schema to database (no migrations)
npx drizzle-kit push

# Open Drizzle Studio (database GUI)
npx drizzle-kit studio
```
