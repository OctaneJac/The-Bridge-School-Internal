import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role?: string;
      first_name?: string | null;
      last_name?: string | null;
      branch_id?: number | null;
    } & DefaultSession["user"];
  }

  interface User {
    role?: string;
    first_name?: string | null;
    last_name?: string | null;
    branch_id?: number | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role?: string;
    first_name?: string | null;
    last_name?: string | null;
    branch_id?: number | null;
  }
}
