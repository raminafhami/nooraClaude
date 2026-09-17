import apiClient from "../client";

interface GetAllProductsProps {
  page: number;
  size: number;
  searchByName?: string;
}

export default async function GetAllProducts({
  page,
  size,
  searchByName,
}: GetAllProductsProps) {
  let response;
  let link = `products?page=${page}&size=${size}${
    searchByName
      ? `&filters={"$or":[{"$expr":{"$regexMatch":{"input":{"$concat":["$name"," "]},"regex":"${searchByName}","options":"i"}}}]}`
      : ""
  }`;

  response = await apiClient.get({
    url: link,
  });

  return response;
}
