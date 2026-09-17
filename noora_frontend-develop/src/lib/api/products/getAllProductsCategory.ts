import apiClient from "../client";

interface GetAllProductsCategoryProps {
  page: number;
  size: number;
}

export default async function GetAllProductsCategory({
  page,
  size,
}: GetAllProductsCategoryProps) {
  let response;
  let link = `products-category?page=${page}&size=${size}`;

  response = await apiClient.get({
    url: link,
  });

  return response;
}
