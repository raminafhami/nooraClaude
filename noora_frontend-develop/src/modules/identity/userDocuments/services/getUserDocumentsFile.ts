import apiClient from "@/api/client";

interface GetUserDocumentsFileProps {
  fileId: string;
}

export default async function GetUserDocumentsFile({
  fileId,
}: GetUserDocumentsFileProps) {
  let response;
  let link = `user-files/${fileId}/file`;

  response = await apiClient.send({
    method: "get",
    url: link,
    responseType: "blob",
  });

  return response;
}
