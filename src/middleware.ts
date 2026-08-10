import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE = "lellahi_admin_session";

async function isValidSession(token: string | undefined) {
  if (!token) return false;
  try {
    await jwtVerify(token, new TextEncoder().encode(process.env.AUTH_SECRET));
    return true;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isAdminArea = pathname.startsWith("/admin") && pathname !== "/admin/login";
  const isAdminApi = pathname.startsWith("/api/admin") && !pathname.startsWith("/api/admin/login");

  if (isAdminArea || isAdminApi) {
    const token = req.cookies.get(SESSION_COOKIE)?.value;
    const valid = await isValidSession(token);
    if (!valid) {
      if (isAdminApi) {
        return NextResponse.json({ error: "غیرمجاز" }, { status: 401 });
      }
      const loginUrl = new URL("/admin/login", req.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Logged-in admins hitting /admin/login get bounced to the dashboard
  if (pathname === "/admin/login") {
    const token = req.cookies.get(SESSION_COOKIE)?.value;
    if (await isValidSession(token)) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"]
};
