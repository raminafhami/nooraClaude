"use client";

import { useMemo } from "react";
import { useCookies } from "react-cookie";

import { ACCESS_TOKEN, REFRESH_TOKEN } from "../consts";
import { Session } from "../models/Session";

function useSession(): Session {
  const [cookies] = useCookies([ACCESS_TOKEN, REFRESH_TOKEN]);

  const accessToken: string | undefined = cookies[ACCESS_TOKEN] ?? undefined;
  const refreshToken: string | undefined = cookies[REFRESH_TOKEN] ?? undefined;

  const session: Session = useMemo(
    () => ({ accessToken, refreshToken }),
    [accessToken, refreshToken],
  );

  return session;
}

export { useSession };
