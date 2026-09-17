import apiClient from "../client";

interface GetInstanceFileProps {
  processInstanceId: string;
}

export default async function GetInstanceFile({
  processInstanceId,
}: GetInstanceFileProps) {
  let response;
  let link = `files/${processInstanceId}/documents?filters=${JSON.stringify({
    fieldNames: ["warehouse_receipt"],
  })}`;

  response = await apiClient.get({
    url: link,
  });

  return response;
}
