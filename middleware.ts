import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { BASE_PATH } from "@/lib/base-path";

/**
 * `basePath: /kuafor` varken Next.js kök `/` için sayfa üretmez; tarayıcıda 404 olur.
 * Kök isteği uygulama köküne yönlendirir (`/kuafor/`).
 */
export function middleware(request: NextRequest) {
  if (!BASE_PATH) return NextResponse.next();
  const { pathname } = request.nextUrl;
  if (pathname === "/" || pathname === "") {
    const url = request.nextUrl.clone();
    url.pathname = `${BASE_PATH}/`;
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/",
};
