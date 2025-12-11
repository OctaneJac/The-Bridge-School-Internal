import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { sql } from "@/lib/db";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
  first_name: string;
  last_name: string;
  branch_id: number;
}

/**
 * Authenticate user by email and password
 */
export async function authenticateUser(email: string, password: string): Promise<AuthenticatedUser> {
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  const users = await sql`
    SELECT 
      id,
      email,
      password,
      first_name,
      last_name,
      role,
      branch_id
    FROM "User"
    WHERE email = ${email}
    LIMIT 1
  `;

  if (users.length === 0) {
    throw new Error("Invalid email or password");
  }

  const user = users[0];
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    throw new Error("Invalid email or password");
  }

  // For super_admin: set branch_id to 1 in session token only (don't change database)
  // For admin/teacher: use their assigned branch_id from database
  const branchId = user.role === "super_admin" ? 1 : user.branch_id;

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    first_name: user.first_name,
    last_name: user.last_name,
    branch_id: branchId,
  };
}

/**
 * Get authenticated session with typed user
 */
export async function getAuthSession() {
  return await getServerSession(authOptions);
}

/**
 * Get user role from session
 */
export function getUserRole(session: any): string | null {
  return (session?.user as any)?.role || null;
}

/**
 * Get branch ID from session
 */
export function getBranchId(session: any): number | null {
  return (session?.user as any)?.branch_id || null;
}

/**
 * Get user ID from session
 */
export function getUserId(session: any): string | null {
  return (session?.user as any)?.id || null;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "user@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }
        const user = await authenticateUser(credentials.email, credentials.password);
        return {
          ...user,
          name: user.email,
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.first_name = (user as any).first_name;
        token.last_name = (user as any).last_name;
        token.branch_id = (user as any).branch_id;
      }
      if (trigger === "update" && session?.branch_id) {
        token.branch_id = session.branch_id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).first_name = token.first_name;
        (session.user as any).last_name = token.last_name;
        (session.user as any).branch_id = token.branch_id;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

