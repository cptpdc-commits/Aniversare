import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Rute accesibile fără autentificare.
const PUBLIC = ["/login", "/register", "/invitatie"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasSession = req.cookies.has("session");
  const isPublic = PUBLIC.some((p) => pathname === p || pathname.startsWith(p + "/"));

  if (!hasSession && !isPublic) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    if (pathname !== "/") url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  // Exclude _next, fișiere statice (cu extensie) și favicon.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|manifest|.*\\..*).*)"],
};
