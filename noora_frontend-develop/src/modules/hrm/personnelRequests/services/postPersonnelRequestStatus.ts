import apiClient from "@/api/client";

import { PersonnelRequestCreateModel } from "../models/personnelRequestCreateModel";

interface PersonnelRequestCreateApiModel {
  personnelRequestIds: string[];
  status: "confirmed" | "rejected";
}

interface PersonnelRequestCreateApiReturn extends PersonnelRequestCreateModel {}

export async function postPersonnelRequestStatus(
  data: PersonnelRequestCreateApiModel,
): Promise<boolean> {
  const response = await apiClient.post<PersonnelRequestCreateApiReturn>({
    url: "personnel-request/confirm-or-reject-personnel-requests",
    body: data,
  });

  return response.success;
}
