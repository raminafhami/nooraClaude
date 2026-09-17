import apiClient from "../client";

interface GetPersonnelFormResultsProps {
  page: number;
  size: number;
}

export default async function GetPersonnelFormResults({
  page,
  size,
}: GetPersonnelFormResultsProps) {
  let response;
  let link = `forms/me/result?page=${page}&size=${size}`;

  response = await apiClient.get({
    url: link,
  });

  return response;
}
