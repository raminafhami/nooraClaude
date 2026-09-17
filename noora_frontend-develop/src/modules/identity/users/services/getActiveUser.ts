import apiClient from "@/api/client";

import { User, UserApi } from "../models/User";
import parseUser from "../utils/parseUser";

export default async function getActiveUser(): Promise<User> {
  const response = await apiClient.get<UserApi>({
    url: "users/active",
  });

  return parseUser(response.result);
}
