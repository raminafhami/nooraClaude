import apiClient from "@/api/client";

interface PostNewTaskCommentProps {
  text: string;
  projectTaskId: string;
}

export default async function PostNewTaskComment({
  text,
  projectTaskId,
}: PostNewTaskCommentProps) {
  let response;
  let link = `comments/`;

  response = await apiClient.post({
    url: link,
    body: { text, projectTaskId },
  });

  return response;
}
