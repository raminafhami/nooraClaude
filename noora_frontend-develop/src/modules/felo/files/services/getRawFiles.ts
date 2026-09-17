import apiClient from "@/api/client";

import { FileApi } from "../models/File";

interface GetInstanceFilesDto {
  instanceId: string;
  types?: string[];
}

interface GetInstanceFilesResponse {
  files: FileApi[];
}

async function getInstanceRawFiles(
  details: GetInstanceFilesDto,
): Promise<FileApi[]> {
  const { instanceId, types } = details;

  const searchParams = new URLSearchParams();

  if (types && types.length) {
    searchParams.append("fieldNames", types.join(" "));
  }

  const response = await apiClient.get<GetInstanceFilesResponse>({
    url: `/files/${instanceId}/documents${
      searchParams.size ? `?${searchParams.toString()}` : ""
    }`,
  });

  return response.result.files;
}

export { getInstanceRawFiles };
