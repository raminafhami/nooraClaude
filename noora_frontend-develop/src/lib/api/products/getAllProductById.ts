import apiClient from "../client";

interface GetAllProductByIdProps {
  id: string;
}

export default async function GetAllProductById({
  id,
}: GetAllProductByIdProps) {
  let response;
  let link = `products/${id}`;

  response = await apiClient.get({
    url: link,
  });

  return response;
}
