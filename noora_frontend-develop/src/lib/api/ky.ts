import ky, { AfterResponseHook, BeforeRequestHook } from "ky";

import { refreshSession } from "@/auth/services/refreshSession";
import { clearUniversalSession } from "@/auth/utils/clearUniversalSession";
import getUniversalSession from "@/auth/utils/getUniversalSession";

const AUTH_ENDPOINTS = [
  "authentication/register",
  "authentication/login",
  "authentication/login-phone",
  "authentication/verify",
  "authentication/refresh-tokens",
];

async function refreshAccessToken(): Promise<string | null> {
  const { refreshToken } = getUniversalSession();

  if (!refreshToken) {
    return null;
  }

  try {
    // Shared with AuthProvider: the refresh token is rotated server-side, so
    // it must only be redeemed by one request at a time.
    const { accessToken } = await refreshSession(refreshToken);
    return accessToken;
  } catch {
    clearUniversalSession();
    return null;
  }
}

const beforeRequestHook: BeforeRequestHook = async (request) => {
  const { accessToken } = getUniversalSession();

  if (accessToken) {
    request.headers.set("Authorization", `Bearer ${accessToken}`);
  }
};

const afterResponseHook: AfterResponseHook = async (
  request,
  options,
  response,
) => {
  if (
    response.status === 401 &&
    AUTH_ENDPOINTS.every((x) => !request.url.endsWith(x))
  ) {
    const newAccessToken = await refreshAccessToken();
    if (newAccessToken) {
      request.headers.set("Authorization", `Bearer ${newAccessToken}`);
      return ky(request, options);
    }
  }
};

function getKy(baseURL?: string): typeof ky {
  return ky.create({
    prefixUrl: baseURL ?? "",
    timeout: 30000,
    hooks: {
      beforeRequest: [beforeRequestHook],
      afterResponse: [afterResponseHook],
    },
  });
}

export { getKy };
