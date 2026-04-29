import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/main-menu/:path*",
    "/settings/:path*",
    "/master/:path*",
    "/purchase/:path*",
    "/warehouse/:path*",
    "/login",
    "/register"
  ]
};
