import apiClient from "@/api/client";

interface EditNewTaskCommentProps {
  text: string;
  id: string;
}

export default async function EditNewTaskComment({
  text,
  id,
}: EditNewTaskCommentProps) {
  let response;
  let link = `comments/${id}/`;

  response = await apiClient.put({
    url: link,
    body: { text },
  });

  return response;
}
