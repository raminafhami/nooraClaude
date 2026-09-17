import apiClient from "../client";

interface DeleteProjectLabelProps {
  id: string;
}

export default async function DeleteProjectLabel({
  id,
}: DeleteProjectLabelProps) {
  let response;
  let link = `project-task-label/${id}`;

  response = await apiClient.delete({
    url: link,
  });

  return response;
}
