import apiClient from "../client";

interface PostProjectsTasksLabelProps {
  title: string;
}

export default async function PostProjectsTasksLabel({
  title,
}: PostProjectsTasksLabelProps) {
  let response;
  let link = `project-task-label`;

  response = await apiClient.post({
    url: link,
    body: {
      title,
    },
  });

  return response;
}
