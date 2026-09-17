import apiClient from "../client";

interface getProjectTaskByIdProps {
  id: string;
}

export default async function getProjectTaskById({
  id,
}: getProjectTaskByIdProps) {
  let response;
  let link = `project/`;

  response = await apiClient.get({
    url: link,
  });

  return response;
}
