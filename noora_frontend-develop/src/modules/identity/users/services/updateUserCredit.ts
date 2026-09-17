import apiClient from "@/api/client";

import { PersonnelApi } from "../../../hrm/personnel/models/Personnel";
import { User, UserApi } from "../models/User";
import parseUser from "../utils/parseUser";

export interface CreditDetails {
  amount: number;
  isFixed: boolean;
}

export async function updateUserCredit(
  userId: string,
  details: CreditDetails,
): Promise<User> {
  const response = await apiClient.put<UserApi>({
    url: `/users/${userId}/credit`,
    body: details,
  });

  return parseUser(response.result);
}
