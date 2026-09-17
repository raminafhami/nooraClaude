import apiClient from "../client";

interface DeleteProjectProps {
  id: string;
}

export default async function DeleteProject({ id }: DeleteProjectProps) {
  let response;
  let link = `project/${id}`;

  response = await apiClient.delete({
    url: link,
  });

  return response;
}
