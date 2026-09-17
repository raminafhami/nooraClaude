import { Cookies } from "react-cookie";

import { ACCESS_TOKEN, REFRESH_TOKEN } from "../consts";
import { Session } from "../models/Session";

function getSession(): Session {
  const cookies = new Cookies();

  const accessToken = cookies.get(ACCESS_TOKEN) ?? undefined;
  const refreshToken = cookies.get(REFRESH_TOKEN) ?? undefined;

  return { accessToken, refreshToken };
}

export { getSession };
