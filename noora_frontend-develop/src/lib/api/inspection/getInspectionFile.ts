import apiClient from "../client";

interface GetInspectionFileProps {
  processInstanceId: string;
}

export default async function GetInspectionFile({
  processInstanceId,
}: GetInspectionFileProps) {
  let response;
  let link = `files/inspection/${processInstanceId}/files`;

  response = await apiClient.get({
    url: link,
  });

  return response;
}
