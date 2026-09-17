import apiClient from "@/api/client";

interface FileUploadModel {
  instanceId: string;
  file: any;
  folder: string;
  fileTypes: string[];
}

interface FileUploadReturn {
  id: string;
  name: string;
  createAt: Date;
}

interface FileUploadApiReturn {
  id: string;
  name: string;
  createdAt: string;
}

export async function uploadInstanceFile(
  details: FileUploadModel,
): Promise<FileUploadReturn> {
  const data = new FormData();
  data.append("file", details.file);

  const response = await apiClient.post<FileUploadApiReturn[]>({
    url: `/files/${details.instanceId}/upload/${details.fileTypes.join(",")}/${
      details.folder
    }`,
    body: data,
    contentType: "multipart",
  });

  return (({ id, name, createdAt }) => ({
    id,
    createAt: new Date(createdAt),
    name,
  }))(response.result.at(0)!);
}
