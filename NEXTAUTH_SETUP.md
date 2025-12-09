# NextAuth Setup Instructions

## Overview
NextAuth has been integrated into your Next.js project with credentials-based authentication. The teacher routes are protected and require authentication.

## Files Created/Modified

### 1. **Authentication Configuration**
- `lib/auth.ts` - NextAuth configuration with Credentials provider
- `app/api/auth/[...nextauth]/route.ts` - NextAuth API route handler
- `types/next-auth.d.ts` - TypeScript declarations for NextAuth

### 2. **Components**
- `components/auth-provider.tsx` - Client-side SessionProvider wrapper
- `app/layout.tsx` - Updated to use AuthProvider

### 3. **Pages**
- `app/login/page.tsx` - Login page with email/password form
- `app/teacher/page.tsx` - Protected teacher dashboard (example)

### 4. **Middleware**
- `middleware.ts` - Protects `/teacher/*` routes

## Setup Steps

### 1. Create Environment Variables
Create a `.env.local` file in the root directory:

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Database Configuration
DATABASE_URL=your-database-connection-string
```

**Generate a secure NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 2. Implement Database Query
In `lib/auth.ts`, you need to implement the `getUserByEmail` function to query your database:

```typescript
async function getUserByEmail(email: string): Promise<User | null> {
  // Example with Prisma:
  const user = await prisma.user.findUnique({
    where: { email }
  });
  return user;
  
  // Or with any other database library
  // const user = await db.query('SELECT * FROM User WHERE email = ?', [email]);
  // return user;
}
```

### 3. Database Schema
Ensure your User table has these fields:
- `id` (string/uuid)
- `email` (string, unique)
- `password` (string, hashed with bcrypt)
- `name` (optional string)
- `role` (optional string)

### 4. Password Hashing
Your passwords should be hashed using bcrypt. Example:
```typescript
import bcrypt from 'bcryptjs';

// When creating a user:
const hashedPassword = await bcrypt.hash(plainPassword, 10);
```

## How It Works

### Protected Routes
- All routes under `/teacher/*` are automatically protected by the middleware
- Unauthenticated users are redirected to `/login`
- After successful login, users are redirected back to their intended destination

### Login Flow
1. User visits `/login`
2. User enters email and password
3. Credentials are sent to NextAuth
4. NextAuth queries the database and verifies the password
5. If valid, a JWT session is created
6. User is redirected to the protected page

### Session Management
- Sessions are handled via JWT (no database sessions)
- Session data includes: id, email, name, and role
- Access session data in components:

**Server Components:**
```typescript
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const session = await getServerSession(authOptions);
```

**Client Components:**
```typescript
"use client";
import { useSession } from "next-auth/react";

const { data: session } = useSession();
```

### Sign Out
Add a sign-out button in your components:
```typescript
import { signOut } from "next-auth/react";

<button onClick={() => signOut()}>Sign Out</button>
```

## Testing

1. Start your development server:
```bash
npm run dev
```

2. Try accessing `/teacher` - you should be redirected to `/login`

3. Log in with credentials from your database

4. After successful login, you should see the teacher dashboard

## Troubleshooting

### "Database query not implemented" error
- Implement the `getUserByEmail` function in `lib/auth.ts`

### "Invalid password" error
- Ensure passwords in your database are hashed with bcrypt
- Verify the password format matches what bcrypt expects

### Redirect loop
- Check that `NEXTAUTH_URL` in `.env.local` matches your development URL
- Ensure `NEXTAUTH_SECRET` is set

### Session not persisting
- Clear your browser cookies and try again
- Verify the JWT callback is working correctly

## Additional Security Considerations

1. **NEXTAUTH_SECRET**: Use a strong, randomly generated secret in production
2. **HTTPS**: Use HTTPS in production (NextAuth requires it by default)
3. **Rate Limiting**: Consider adding rate limiting to the login endpoint
4. **Password Policy**: Enforce strong passwords when users are created
5. **Environment Variables**: Never commit `.env.local` to version control

## Extending the Setup

### Add More Protected Routes
Edit `middleware.ts` and update the matcher:
```typescript
export const config = {
  matcher: ["/teacher/:path*", "/admin/:path*", "/dashboard/:path*"],
};
```

### Add Role-Based Access Control
In the middleware or page components, check the user's role:
```typescript
const session = await getServerSession(authOptions);
if (session?.user?.role !== "teacher") {
  redirect("/unauthorized");
}
```

### Add More Authentication Providers
You can add OAuth providers (Google, GitHub, etc.) later by modifying `lib/auth.ts`.
