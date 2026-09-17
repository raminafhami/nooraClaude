import apiClient from "@/api/client";

import { FileApi } from "../models/File";

async function getInstanceFile(fileId: string): Promise<Blob> {
  const response = await apiClient.send({
    url: `/files/${fileId}`,
    responseType: "blob",
  });

  return response;
}

export { getInstanceFile };
