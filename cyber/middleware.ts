import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "sut_case";

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const path = url.pathname;

  // ล็อกเฉพาะเส้นทางตอนจบ
  const needGate = path.startsWith("/ending");
  if (!needGate) return NextResponse.next();

  const v = req.cookies.get(COOKIE_NAME)?.value;
  if (!v) {
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  try {
    const session = JSON.parse(v);
    const p = session?.progress;
    const ok = p?.A && p?.B && p?.C;

    if (!ok) {
      url.pathname = "/files";
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  } catch {
    url.pathname = "/";
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: ["/ending/:path*"],
};
