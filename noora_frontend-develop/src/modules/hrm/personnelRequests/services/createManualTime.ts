import apiClient from "@/api/client";

import { ManualTimeCreateModel } from "../models/manualTimeCreateModel";

export async function createManualTime(
  data: ManualTimeCreateModel,
): Promise<boolean> {
  const response = await apiClient.post({
    url: "/personnel-attendance/manual-time",
    body: data,
  });

  return response.success;
}
