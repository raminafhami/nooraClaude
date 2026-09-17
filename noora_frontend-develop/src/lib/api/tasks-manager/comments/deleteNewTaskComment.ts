import apiClient from "@/api/client";

interface DeleteNewTaskCommentProps {
  id: string;
}

export default async function DeleteNewTaskComment({
  id,
}: DeleteNewTaskCommentProps) {
  let response;
  let link = `comments/${id}/`;

  response = await apiClient.delete({
    url: link,
  });

  return response;
}
