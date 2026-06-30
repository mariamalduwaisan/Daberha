import { NextResponse, type NextRequest } from "next/server";

// Edge-safe auth check: look for the Supabase session cookie without
// importing @supabase/ssr (which pulls in Node.js __dirname internals
// that crash on the Edge Runtime).
function hasSession(request: NextRequest): boolean {
  const projectRef = "uobqjsgkcoddqytnodff";
  const cookieName = `sb-${projectRef}-auth-token`;
  return (
    request.cookies.has(cookieName) ||
    request.cookies.has(`${cookieName}.0`) ||
    request.cookies.has(`${cookieName}.1`)
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const loggedIn = hasSession(request);

  // Unauthenticated user trying to access dashboard
  if (!loggedIn && pathname.startsWith("/dashboard")) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // Authenticated user visiting the sign-in page
  if (loggedIn && pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip static assets and API routes (API routes handle their own auth)
    "/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
