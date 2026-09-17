import apiClient from "../client";

interface GetSubContractorsProps {
  page: number;
  size: number;
  searchAttribute?: SearchAttributeProps;
}

interface SearchAttributeProps {
  name?: string;
}

export default async function GetSubContractorsProps({
  page,
  size,
  searchAttribute,
}: GetSubContractorsProps) {
  const link = `sub-contractor?page=${page}&size=${size}&filters={
    ${
      searchAttribute?.name
        ? `"name":{"$regex": "${searchAttribute.name}","$options": "i"}`
        : ""
    }}`;

  const response = await apiClient.get({ url: link });

  return response;
}
