import apiClient from "@/api/client";

interface GetTaskCommentsByIdProps {
  id: string;
  page: number;
  size: number;
}

export default async function GetTaskCommentsById({
  id,
  page,
  size,
}: GetTaskCommentsByIdProps) {
  let response;
  let link = `comments?page=${page ? page : 0}&size=${
    size ? size : 10
  }&filters={"projectTaskId":"${id}"}&populate=createdBy`;

  response = await apiClient.get({
    url: link,
  });

  return response;
}
