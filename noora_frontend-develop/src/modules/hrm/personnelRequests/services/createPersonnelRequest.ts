import apiClient from "@/api/client";

import { PersonnelRequestCreateModel } from "../models/personnelRequestCreateModel";

export async function createPersonnelRequest(
  data: PersonnelRequestCreateModel,
): Promise<boolean> {
  const response = await apiClient.post({
    url: "/personnel-request",
    body: data,
  });

  return response.success;
}
