import apiClient from "../client";

interface DeleteAssetRequirementFileProps {
  id: string;
}

export default async function DeleteAssetRequirementFile({
  id,
}: DeleteAssetRequirementFileProps) {
  let response;
  let link = `asset-requirement/file/${id}`;

  response = await apiClient.delete({
    url: link,
  });

  return response;
}
