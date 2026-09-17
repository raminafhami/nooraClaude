import apiClient from "../client";

interface DeleteProductCategoryByIdProps {
  id: string;
}

export default async function DeleteProductCategoryById({
  id,
}: DeleteProductCategoryByIdProps) {
  let response;
  let link = `products-category/${id}`;

  response = await apiClient.delete({
    url: link,
  });

  return response;
}
