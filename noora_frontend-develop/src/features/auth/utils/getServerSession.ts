import { ACCESS_TOKEN, REFRESH_TOKEN } from "../consts";
import { Session } from "../models/Session";

function getServerSession(): Session {
  const { cookies } = require("next/headers");
  const accessToken = cookies().get(ACCESS_TOKEN)?.value ?? undefined;
  const refreshToken = cookies().get(REFRESH_TOKEN)?.value ?? undefined;

  return { accessToken, refreshToken };
}

export { getServerSession };
