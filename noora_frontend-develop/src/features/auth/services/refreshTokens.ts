import apiClient from "@/api/client";

import { AuthenticationTokens } from "../models/AuthenticationTokens";

async function refreshTokens(
  details: RefreshTokensDto,
): Promise<AuthenticationTokens> {
  const data: RefreshTokensApi = {
    ...details,
  };

  const response = await apiClient.post<RefreshTokensResult>({
    url: "authentication/refresh-tokens",
    body: data,
  });

  return response.result;
}

interface RefreshTokensDto {
  refreshToken: string;
}

interface RefreshTokensApi {
  refreshToken: string;
}

interface RefreshTokensResult extends AuthenticationTokens {}

export { type RefreshTokensDto, refreshTokens };
