import apiClient from "@/api/client";
import { getUsers } from "@/identity/users/services/getUsers";

import { File, FileApi } from "../models/File";
import { FileType } from "../models/FileType";
import { parseFile } from "../utils/parseFiles";

interface GetInstanceFilesDto {
  instanceId: string;
  types?: string[];
}

interface GetInstanceFilesResponse {
  files: FileApi[];
}

async function getInstanceFiles(
  details: GetInstanceFilesDto,
  fileTypes: FileType[],
): Promise<File[]> {
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

  // fetch users (owners)
  const userIds = [...new Set(response.result.files.map((x) => x.owner))];
  const users = await getUsers({
    filters: { _id: userIds },
  });

  return parseFile(response.result.files, fileTypes, users);
}

export { getInstanceFiles };
