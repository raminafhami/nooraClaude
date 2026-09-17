import apiClient from "../client";

interface PostNewProductsCategoryProps {
  name: string;
}

export default async function PostNewProductsCategory({
  name,
}: PostNewProductsCategoryProps) {
  let response;
  let link = `products-category/`;

  response = await apiClient.post({
    url: link,
    body: {
      name,
    },
  });

  return response;
}
