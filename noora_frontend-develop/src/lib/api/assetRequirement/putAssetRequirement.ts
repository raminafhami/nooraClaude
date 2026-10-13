import apiClient from "../client";

interface PutAssetRequirementProps {
  id: string;
  questionDescription?: string;
  paraNumber?: string;
  state?: boolean;
  conflict?: string;
  conflictDate?: string | null;
  description?: string;
}

export default async function PutAssetRequirement({
  id,
  questionDescription,
  paraNumber,
  state,
  description,
  conflict,
  conflictDate,
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
      conflictDate,
    },
  });

  return response;
}
