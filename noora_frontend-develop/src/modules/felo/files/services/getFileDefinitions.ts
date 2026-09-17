import apiClient from "@/api/client";

import { FileDefinitions } from "../models/FileDefinition";

export async function getInstanceFileDefinitions(
  instanceId: string,
): Promise<FileDefinitions> {
  const response = await apiClient.get<FileDefinitions>({
    url: `/files/${instanceId}/documents-definition`,
  });

  return response.result;
}
