import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secretString =
  process.env.JWT_SECRET ||
  process.env.GOOGLE_CLIENT_SECRET ||
  "qfind_jwt_secure_session_secret_2026_key_fallback";
const SECRET_KEY = new TextEncoder().encode(secretString);

const ADMIN_EMAILS = [
  "leonelmartin9808@gmail.com",
  process.env.NEXT_PUBLIC_ADMIN_EMAIL || "",
]
  .filter(Boolean)
  .map((e) => e.toLowerCase().trim());

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminRoute = pathname.startsWith("/admin") || pathname.startsWith("/crud");

  if (!isAdminRoute) {
    return NextResponse.next();
  }

  const token = request.cookies.get("qfind_session")?.value;

  if (!token) {
    const redirectUrl = new URL("/", request.url);
    redirectUrl.searchParams.set("access_denied", "unauthorized");
    return NextResponse.redirect(redirectUrl);
  }

  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    const email = (payload.email as string)?.toLowerCase().trim();
    const isAdmin = Boolean(payload.admin || (email && ADMIN_EMAILS.includes(email)));

    if (!isAdmin) {
      const redirectUrl = new URL("/", request.url);
      redirectUrl.searchParams.set("access_denied", "forbidden");
      return NextResponse.redirect(redirectUrl);
    }

    return NextResponse.next();
  } catch (err) {
    const redirectUrl = new URL("/", request.url);
    redirectUrl.searchParams.set("access_denied", "invalid_session");
    return NextResponse.redirect(redirectUrl);
  }
}

export const config = {
  matcher: ["/admin/:path*", "/crud/:path*"],
};
