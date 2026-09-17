import apiClient from "../client";

interface GetAssetRequirementProps {
  page: number;
  size: number;
  id?: string;
}

export default async function GetAssetRequirement({
  page,
  size,
  id,
}: GetAssetRequirementProps) {
  let response;
  let link = `asset-requirement?${page ? `page=${page}` : `page=${0}`}&${
    size ? `size=${size}` : `size=${10}`
  }&sort=${`{ "paraNumber": "asc" }`}${
    id ? `&filters={"auditId": "${id}"}` : ""
  }`;

  response = await apiClient.get({
    url: link,
  });

  return response;
}
