import apiClient from "@/api/client";

import { Workshift } from "../models/Workshift";

export async function getWorkshifts(): Promise<Workshift[]> {
  const response = await apiClient.get<Workshift[]>({
    url: "/working-time-regulations",
  });

  return response.result;
}
