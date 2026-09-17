import apiClient from "../client";

interface PutAssetRequirementProps {
  id: string;
  questionDescription?: string;
  paraNumber?: string;
  state?: boolean;
  conflict?: string;
  description?: string;
}

export default async function PutAssetRequirement({
  id,
  questionDescription,
  paraNumber,
  state,
  description,
  conflict,
}: PutAssetRequirementProps) {
  let response;
  let link = `asset-requirement/${id}`;

  response = await apiClient.put({
    url: link,
    body: {
      questionDescription,
      paraNumber,
      state,
      description,
      conflict,
    },
  });

  return response;
}
