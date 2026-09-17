import apiClient from "../client";

interface GetAssetRequirementFileProps {
  fileId?: string;
}

export default async function GetAssetRequirementFile({
  fileId,
}: GetAssetRequirementFileProps) {
  let response;
  let link = `asset-requirement/${fileId}/show`;

  response = await apiClient.send({
    url: link,
    responseType: "blob",
  });

  return response;
}
