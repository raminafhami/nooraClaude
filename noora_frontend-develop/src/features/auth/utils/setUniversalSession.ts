import { decodeJwt } from "jose";
import { Cookies } from "react-cookie";
import { CookieSetOptions } from "universal-cookie";

import { ACCESS_TOKEN, REFRESH_TOKEN } from "../consts";

function setUniversalSession({
  accessToken,
  refreshToken,
}: {
  accessToken: string;
  refreshToken: string;
}): void {
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

  if (typeof window === "undefined") {
    const { cookies } = require("next/headers");
    cookies().set(ACCESS_TOKEN, accessToken, accessTokenOptions);
    cookies().set(REFRESH_TOKEN, refreshToken, refreshTokenOptions);
  } else {
    const cookies = new Cookies();
    cookies.set(ACCESS_TOKEN, accessToken, accessTokenOptions);
    cookies.set(REFRESH_TOKEN, refreshToken, refreshTokenOptions);
  }
}

export default setUniversalSession;
