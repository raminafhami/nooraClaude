import apiClient from "../client";

interface DeleteAssetRequirementProps {
  id: string;
}

export default async function DeleteAssetRequirement({
  id,
}: DeleteAssetRequirementProps) {
  let response;
  let link = `asset-requirement/${id}`;

  response = await apiClient.delete({
    url: link,
  });

  return response;
}
