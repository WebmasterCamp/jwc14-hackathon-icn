import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = [
  "/",
  "/login",
  "/register",
  "/register/customer",
  "/register/provider",
  "/product",
  "/providers",
];

const authRoutes = [
  "/login",
  "/register",
  "/register/customer",
  "/register/provider",
];

export async function middleware(req: NextRequest) {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;

  // API routes and static files are always accessible
  if (pathname.startsWith("/api") || pathname.startsWith("/_next")) {
    return NextResponse.next();
  }

  // Optimistic auth check: we only look for the presence of the session cookie,
  // not its validity. This middleware is a UX gate (redirecting logged-out users
  // away from the dashboard and logged-in users away from the auth pages). Actual
  // access control is enforced server-side via `auth()` in each dashboard layout
  // and API route, which verify the JWT and the user's role. Do not treat the
  // presence of this cookie as proof of a valid session.
  const sessionToken = req.cookies.get("authjs.session-token")?.value ||
                       req.cookies.get("__Secure-authjs.session-token")?.value;

  const isLoggedIn = !!sessionToken;

  // Check if route is auth route (sign-in, sign-up)
  const isAuthRoute = authRoutes.some((route) => pathname === route);

  // Check protected app routes. The provider console lives at /provider (outside
  // /dashboard); like the dashboard it requires a session. Match it exactly /
  // with a trailing slash so the public "/providers" listing isn't caught.
  // Role/is_provider enforcement happens server-side in each layout via auth().
  const isProviderConsole =
    pathname === "/provider" || pathname.startsWith("/provider/");
  const isProtected = pathname.startsWith("/dashboard") || isProviderConsole;

  // If user is logged in and trying to access auth routes, send them to the
  // neutral /dashboard entry point, which routes by role server-side. (Redirecting
  // straight to /dashboard/customer here would loop for admins/providers, since
  // that layout bounces non-customers back to /login.)
  if (isLoggedIn && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  // If not logged in and trying to access protected routes
  if (!isLoggedIn && isProtected) {
    const callbackUrl = encodeURIComponent(pathname);
    return NextResponse.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images|fonts).*)"],
};
