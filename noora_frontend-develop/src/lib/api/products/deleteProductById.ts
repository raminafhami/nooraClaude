import apiClient from "../client";

interface DeleteProductByIdProps {
  id: string;
}

export default async function DeleteProductById({
  id,
}: DeleteProductByIdProps) {
  let response;
  let link = `products/${id}`;

  response = await apiClient.delete({
    url: link,
  });

  return response;
}
