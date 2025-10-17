# Quick Setup Summary

## ✅ What's Been Set Up

1. **NextAuth** - Credentials-based authentication
2. **Drizzle ORM** - PostgreSQL database integration
3. **Role-Based Access** - Teacher route protection
4. **Login Page** - `/login` with email/password
5. **Protected Route** - `/teacher` (requires teacher role)

## 🚀 Quick Start

### 1. Set up your database connection

Create `.env.local` in the root:
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here-use-openssl-rand-base64-32
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
```

### 2. Create a test user

Option A - Using the script:
```bash
# Edit scripts/create-user.ts with your desired user details
npx tsx scripts/create-user.ts
```

Option B - Direct SQL:
```sql
-- Replace the hash with a bcrypt hash of your password
INSERT INTO "User" (email, password, role) VALUES 
('teacher@test.com', '$2a$10$YourBcryptHashHere', 'teacher');
```

Option C - Generate hash programmatically:
```bash
# In node/tsx REPL
npx tsx
> import { hashPassword } from './lib/password'
> await hashPassword('your-password')
```

### 3. Start the dev server
```bash
npm run dev
```

### 4. Test it!
1. Go to `http://localhost:3000/teacher` → Redirects to login
2. Login with your test user
3. If role is 'teacher', 'admin', or 'super_admin' → Access granted ✅
4. Otherwise → Redirected to `/unauthorized` ❌

## 📁 Key Files

- `lib/db/schema.ts` - Database schema (User table)
- `lib/db/index.ts` - Drizzle instance
- `lib/auth.ts` - NextAuth config with Drizzle query
- `middleware.ts` - Role-based route protection
- `app/login/page.tsx` - Login form
- `app/teacher/page.tsx` - Protected teacher page
- `scripts/create-user.ts` - Helper to create users

## 🔐 User Roles

Your database supports these roles:
- `teacher` - Can access `/teacher` routes
- `admin` - Can access `/teacher` routes (and admin routes if you add them)
- `super_admin` - Can access `/teacher` routes (and all routes)

## 📝 Common Tasks

### Create a new user
```bash
npx tsx scripts/create-user.ts
```

### View your database (Drizzle Studio)
```bash
npx drizzle-kit studio
```

### Generate hash for a password
```typescript
import { hashPassword } from '@/lib/password';
const hash = await hashPassword('mypassword');
```

## 🛠️ Troubleshooting

**Can't connect to database?**
- Check DATABASE_URL in `.env.local`
- Ensure PostgreSQL is running

**Access denied after login?**
- Check user's role in database
- Role must be exactly: 'teacher', 'admin', or 'super_admin'

**TypeScript errors?**
- Run `npm install` to ensure all deps are installed
- Restart TS server in VS Code

## 📖 Full Documentation

- See `NEXTAUTH_SETUP.md` for NextAuth details
- See `DRIZZLE_SETUP.md` for Drizzle ORM details
