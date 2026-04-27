import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  matcher: ["/main-menu/:path*", "/settings/:path*", "/master/:path*", "/login", "/register"]
};
