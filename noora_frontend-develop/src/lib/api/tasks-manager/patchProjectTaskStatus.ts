import apiClient from "../client";

interface PatchProjectTaskStatusProps {
  taskId: string;
  status: string;
}

export default async function PatchProjectTaskStatus({
  taskId,
  status,
}: PatchProjectTaskStatusProps) {
  let response;
  let link = `project-task/${taskId}/${status}`;

  response = await apiClient.patch({
    url: link,
  });

  return response;
}
