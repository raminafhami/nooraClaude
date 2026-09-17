import apiClient from "../client";

interface GetAllFormsProps {
  page: number;
  size: number;
  userId?: string;
}

export default async function GetAllForms({
  page,
  size,
  userId,
}: GetAllFormsProps) {
  let response;
  let link = `forms?page=${page}&size=${size}${
    userId ? `&filters={"evaluator":{"_id":"${userId}"}}` : ""
  }`;

  response = await apiClient.get({
    url: link,
  });

  return response;
}
