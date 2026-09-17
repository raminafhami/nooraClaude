import apiClient from "../client";

interface GetInspectionFileByIdProps {
  fileId: string;
}

export default async function GetInspectionFileById({
  fileId,
}: GetInspectionFileByIdProps) {
  let response;
  let link = `files/inspection/${fileId}`;

  response = await apiClient.send({
    url: link,
    responseType: "blob",
  });

  return response;
}
