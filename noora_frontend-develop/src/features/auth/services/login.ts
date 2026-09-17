import apiClient from "@/api/client";

import { AuthenticationTokens } from "../models/AuthenticationTokens";

interface LoginDto {
  identity: string;
  password: string;
}

interface LoginApi {
  phoneNo: string;
  password: string;
}

interface LoginResponse {
  token: AuthenticationTokens;
}

async function login(details: LoginDto): Promise<AuthenticationTokens> {
  const data: LoginApi = {
    phoneNo: details.identity,
    password: details.password,
  };

  const response = await apiClient.post<LoginResponse>({
    url: "authentication/login",
    body: data,
  });

  return response.result.token;
}

export { type LoginDto, login };
