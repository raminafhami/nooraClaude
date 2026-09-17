import apiClient from "@/api/client";
import { GenericObject } from "@/ts/GenericObject";

import { User, UserApi } from "../models/User";
import parseUser from "../utils/parseUser";

async function getUserById(id: string, raw: true): Promise<UserApi>;

async function getUserById<TMetadata extends GenericObject = any>(
  id: string,
): Promise<User<TMetadata>>;

async function getUserById<TMetadata extends GenericObject = any>(
  id: string,
  raw?: true,
): Promise<User<TMetadata> | UserApi> {
  const response = await apiClient.get<UserApi>({
    url: `/users/${id}`,
  });

  if (raw) {
    return response.result;
  }

  return parseUser(response.result);
}

export default getUserById;
