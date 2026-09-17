import apiClient from "../client";

interface GetProjectByIdProps {
  id: string;
}

export default async function GetProjectById({ id }: GetProjectByIdProps) {
  let response;
  let link = `project/${id}/`;

  response = await apiClient.get({
    url: link,
  });

  return response;
}
