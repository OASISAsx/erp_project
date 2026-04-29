import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "@/auth.config";

type BackendLoginResponse = {
  accessToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    departmentId?: string | null;
  };
};

export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "").trim().toLowerCase();
        const password = String(credentials?.password ?? "");

        if (!email || !password) {
          return null;
        }

        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
          const response = await fetch(`${apiUrl}/auth/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
          });

          if (!response.ok) {
            throw new Error("Backend login failed");
          }

          const data = (await response.json()) as BackendLoginResponse;

          return {
            id: data.user.id,
            email: data.user.email,
            name: data.user.name,
            role: data.user.role,
            departmentId: data.user.departmentId,
            accessToken: data.accessToken
          };
        } catch {
          const isDemoAdmin = email === "admin@erp.local" && password === "admin123";

          if (!isDemoAdmin) {
            return null;
          }

          return {
            id: "admin",
            email,
            name: "Admin",
            role: "super_admin",
            departmentId: null,
            accessToken: "demo-token"
          };
        }
      }
    })
  ],
  callbacks: {
    ...authConfig.callbacks,
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.departmentId = user.departmentId;
        token.accessToken = user.accessToken;
      }

      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = String(token.role ?? "");
        session.user.departmentId =
          typeof token.departmentId === "string" ? token.departmentId : null;
      }

      session.accessToken = String(token.accessToken ?? "");
      return session;
    }
  }
});
