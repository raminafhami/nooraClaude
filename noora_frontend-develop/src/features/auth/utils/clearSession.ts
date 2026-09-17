import { Cookies } from "react-cookie";
import { CookieSetOptions } from "universal-cookie";

import { ACCESS_TOKEN, REFRESH_TOKEN } from "../consts";

function clearSession(): void {
  const cookies = new Cookies();

  const cookieOptions: CookieSetOptions = {
    expires: new Date(new Date().setSeconds(0)),
    httpOnly: false,
    path: "/",
    sameSite: "lax",
    secure: false,
  };

  cookies.set(ACCESS_TOKEN, undefined, cookieOptions);
  cookies.set(REFRESH_TOKEN, undefined, cookieOptions);
}

export { clearSession };
