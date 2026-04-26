import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  pages: {
    signIn: "/login"
  },
  session: {
    strategy: "jwt"
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = Boolean(auth?.user);
      const isProtectedRoute = nextUrl.pathname.startsWith("/main-menu");

      if (isProtectedRoute) {
        return isLoggedIn;
      }

      if (isLoggedIn && (nextUrl.pathname === "/login" || nextUrl.pathname === "/register")) {
        return Response.redirect(new URL("/main-menu", nextUrl));
      }

      return true;
    }
  },
  providers: []
} satisfies NextAuthConfig;
