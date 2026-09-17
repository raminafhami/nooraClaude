import apiClient from "@/api/client";

import { GroupedExpertisesApi } from "../models/GroupedExpertisesApi";

export async function getGroupedExpertises(
  personnelId: string,
  jobId: string,
): Promise<GroupedExpertisesApi> {
  const response = await apiClient.get<GroupedExpertisesApi>({
    url: `/personnel/${personnelId}/jobs/${jobId}/expertises`,
  });

  return response.result;
}
