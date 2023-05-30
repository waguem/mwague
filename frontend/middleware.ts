import { NextRequest, NextResponse } from "next/server";
import accepLanguage from "accept-language";
import { fallbackLng, languages } from "@/app/i18n/settings";
accepLanguage.languages(languages);

export const config = {
  // matcher: '/:lng*'
  matcher: ["/((?!api|_next/static|_next/image|assets|favicon.ico|sw.js|fonts).*)"],
};

const cookieName = "i18next";

export function middleware(req: NextRequest) {
  let lng;
  if (req.cookies.has(cookieName)) {
    lng = accepLanguage.get(req.cookies.get(cookieName)?.value);
  }
  if (!lng) {
    lng = accepLanguage.get(req.headers.get("Accept-Language"));
  }
  // use fallback
  if (!lng) {
    lng = fallbackLng;
  }
  // Redirect if lng in path is not supported
  if (
    !languages.some((loc) => req.nextUrl.pathname.startsWith(`/${loc}`)) &&
    !req.nextUrl.pathname.startsWith("/_next") &&
    !req.nextUrl.pathname.startsWith("/fonts")
  ) {
    return NextResponse.redirect(new URL(`/${lng}${req.nextUrl.pathname}`, req.url));
  }
  if (req.headers.has("referer")) {
    const refererUrl = new URL(req.headers.get("referer") ?? "");
    const lngInReferer = languages.find((l) => refererUrl.pathname.startsWith(`/${l}`));
    const response = NextResponse.next();
    if (lngInReferer) {
      response.cookies.set(cookieName, lngInReferer);
    }
    return response;
  }
  return NextResponse.next();
}
