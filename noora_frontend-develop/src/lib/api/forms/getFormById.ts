import apiClient from "../client";

interface GetFormByIdProps {
  id: string;
}

export default async function GetFormById({ id }: GetFormByIdProps) {
  let response;
  let link = `forms/${id}`;

  response = await apiClient.get({
    url: link,
  });

  return response;
}
