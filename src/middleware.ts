import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = [
  "/",
  "/sign-in",
  "/sign-up",
  "/sign-up/provider",
  "/sign-up/customer",
  "/equipment",
  "/providers",
];

const authRoutes = ["/sign-in", "/sign-up", "/sign-up/provider", "/sign-up/customer"];

export async function middleware(req: NextRequest) {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;

  // API routes and static files are always accessible
  if (pathname.startsWith("/api") || pathname.startsWith("/_next")) {
    return NextResponse.next();
  }

  // Get session token from cookies
  const sessionToken = req.cookies.get("authjs.session-token")?.value ||
                       req.cookies.get("__Secure-authjs.session-token")?.value;

  const isLoggedIn = !!sessionToken;

  // Check if route is auth route (sign-in, sign-up)
  const isAuthRoute = authRoutes.some((route) => pathname === route);

  // Check dashboard routes
  const isDashboard = pathname.startsWith("/dashboard");

  // If user is logged in and trying to access auth routes, redirect to dashboard
  if (isLoggedIn && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard/customer", nextUrl));
  }

  // If not logged in and trying to access protected routes
  if (!isLoggedIn && isDashboard) {
    const callbackUrl = encodeURIComponent(pathname);
    return NextResponse.redirect(new URL(`/sign-in?callbackUrl=${callbackUrl}`, nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images|fonts).*)"],
};
