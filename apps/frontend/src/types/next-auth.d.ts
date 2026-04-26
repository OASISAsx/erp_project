import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken: string;
    user: {
      id: string;
      role: string;
      departmentId?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    role: string;
    departmentId?: string | null;
    accessToken: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    departmentId?: string | null;
    accessToken?: string;
  }
}
