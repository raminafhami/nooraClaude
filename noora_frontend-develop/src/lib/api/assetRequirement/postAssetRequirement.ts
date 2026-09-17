import apiClient from "../client";

interface PostAssetRequirementProps {
  questionDescription: string;
  paraNumber?: string;
  state: boolean;
  parent: string | null;
  auditId: string;
}

export default async function PostAssetRequirement({
  questionDescription,
  paraNumber,
  state,
  parent,
  auditId,
}: PostAssetRequirementProps) {
  let response;
  let link = `asset-requirement`;

  response = await apiClient.post({
    url: link,
    body: {
      questionDescription,
      paraNumber,
      state,
      parent,
      auditId,
    },
  });

  return response;
}
