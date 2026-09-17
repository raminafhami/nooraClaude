import apiClient from "../client";

interface DeleteFormByIdProps {
  id: string;
}

export default async function DeleteFormById({ id }: DeleteFormByIdProps) {
  let response;
  let link = `forms/${id}`;

  response = await apiClient.delete({
    url: link,
  });

  return response;
}
