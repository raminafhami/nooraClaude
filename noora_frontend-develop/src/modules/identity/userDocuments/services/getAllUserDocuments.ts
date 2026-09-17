import apiClient from "@/api/client";

interface GetAllUserDocumentsProps {
  page: number;
  size: number;
  userId?: string;
  key?: string;
}

export default async function GetAllUserDocuments({
  page,
  size,
  userId,
  key,
}: GetAllUserDocumentsProps) {
  let response;
  let link = `user-files?page=${page}&size=${size}${
    userId
      ? `&filters={"userId":"${userId}"${key ? `,"key":"${key}"` : ``}}`
      : ""
  }`;

  response = await apiClient.get({
    url: link,
  });

  return response.result.data;
}
