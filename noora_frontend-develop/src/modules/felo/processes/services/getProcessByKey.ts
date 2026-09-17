import apiClient from "@/api/client";

import { Process, ProcessApi } from "../models";
import parseProcess from "../utils/parseProcess";

export default async function getProcessByKey(
  key: string,
  version?: number,
): Promise<Process | null> {
  const searchParams = new URLSearchParams();

  if (version) {
    searchParams.append("version", version.toString());
  }

  const response = await apiClient.get<ProcessApi>({
    url: `/process-definitions/key/${key}${
      searchParams.size ? `?${searchParams.toString()}` : ""
    }`,
  });

  return parseProcess(response.result);
}
