import { decodeJwt } from "jose";
import { NextRequest, NextResponse } from "next/server";
import { CookieSetOptions } from "universal-cookie";

import { ACCESS_TOKEN, REFRESH_TOKEN } from "@/auth/consts";
import { AuthenticationTokens } from "@/auth/models/AuthenticationTokens";
import { refreshTokens } from "@/auth/services/refreshTokens";

const AUTH_PAGES = ["/login", "/register"];

const isAuthPage = (url: string) => AUTH_PAGES.includes(url);

export async function middleware(request: NextRequest) {
  const { nextUrl, cookies } = request;

  const response = NextResponse.next();

  const { value: accessToken } = cookies.get(ACCESS_TOKEN) ?? {
    value: undefined,
  };
  const { value: refreshToken } = cookies.get(REFRESH_TOKEN) ?? {
    value: undefined,
  };

  let isValidToken = !!accessToken;
  // if (!isValidToken && refreshToken) {
  //   try {
  //     const tokens = await refreshTokens({ refreshToken });

  //     setAuthenticationCookies(response, tokens);
  //     isValidToken = true;
  //   } catch (err: any) {
  //     console.error(err);
  //   }
  // }

  const isAuthPageRequested = isAuthPage(nextUrl.pathname);
  if (isAuthPageRequested) {
    if (isValidToken || refreshToken) {
      const response = NextResponse.redirect(
        new URL(`/dashboard`, request.nextUrl.origin),
      );

      return response;
    }

    return response;
  } else if (
    nextUrl.pathname.startsWith("/dashboard") &&
    !isValidToken &&
    !refreshToken
  ) {
    const searchParams = new URLSearchParams();
    searchParams.set("callbackUrl", nextUrl.href.replace(nextUrl.origin, ""));

    const response = NextResponse.redirect(
      new URL(`/login?${searchParams}`, request.nextUrl.origin),
    );

    return response;
  }

  if (!isValidToken && !refreshToken) {
    response.cookies.delete(ACCESS_TOKEN);
    response.cookies.delete(REFRESH_TOKEN);
  }

  return response;
}

function setAuthenticationCookies(
  response: NextResponse,
  { accessToken, refreshToken }: AuthenticationTokens,
) {
  const cookieOptions: CookieSetOptions = {
    httpOnly: false,
    path: "/",
    sameSite: "lax",
    secure: false,
  };

  const decodedAccessToken = decodeJwt(accessToken);
  const accessTokenOptions: CookieSetOptions = {
    ...cookieOptions,
    expires: decodedAccessToken.exp
      ? new Date(decodedAccessToken.exp * 1000)
      : undefined,
  };

  const decodedRefreshToken = decodeJwt(refreshToken);
  const refreshTokenOptions: CookieSetOptions = {
    ...cookieOptions,
    expires: decodedRefreshToken.exp
      ? new Date(decodedRefreshToken.exp * 1000)
      : undefined,
  };

  response.cookies.set(ACCESS_TOKEN, accessToken, accessTokenOptions);
  response.cookies.set(REFRESH_TOKEN, refreshToken, refreshTokenOptions);
}

export const config = {
  matcher: [
    {
      source: "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
      // missing: [
      //   { type: "header", key: "next-router-prefetch" },
      //   { type: "header", key: "purpose", value: "prefetch" },
      // ],
    },
  ],
};
