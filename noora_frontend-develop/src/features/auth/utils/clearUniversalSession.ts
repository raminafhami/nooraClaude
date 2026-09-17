import { ACCESS_TOKEN, REFRESH_TOKEN } from "../consts";
import { clearSession as clearClientSession } from "./clearSession";

function clearUniversalSession(): void {
  if (typeof window === "undefined") {
    const { cookies } = require("next/headers");
    cookies().delete(ACCESS_TOKEN);
    cookies().delete(REFRESH_TOKEN);
  } else {
    clearClientSession();
  }
}

export { clearUniversalSession };
