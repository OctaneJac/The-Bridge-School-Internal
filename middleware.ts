import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;
    
    // Strict role-based access control
    // Each role can ONLY access their own portal
    
    if (pathname.startsWith("/teacher")) {
      // Only teachers can access teacher routes
      if (token?.role !== "teacher") {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    }
    
    if (pathname.startsWith("/admin")) {
      // Only admins can access admin routes
      if (token?.role !== "admin") {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    }
    
    if (pathname.startsWith("/super_admin")) {
      // Only super_admins can access super_admin routes
      if (token?.role !== "super_admin") {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    }
    
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  }
);

// Protect all role-based routes
export const config = {
  matcher: ["/teacher/:path*", "/admin/:path*", "/super_admin/:path*"],
};
