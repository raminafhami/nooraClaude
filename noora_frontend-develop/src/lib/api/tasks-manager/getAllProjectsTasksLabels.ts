import apiClient from "../client";

interface GetAllProjectsTasksLabelsProps {
  page: number;
  size: number;
  searchByName?: string;
}

export default async function GetAllProjectsTasksLabels({
  page,
  size,
  searchByName,
}: GetAllProjectsTasksLabelsProps) {
  let response;
  let link = `project-task-label?page=${page}&size=${size}${
    searchByName
      ? `&filters={"title": { "$regex": "${searchByName}", "$options": "i" }}`
      : ""
  }`;

  response = await apiClient.get({
    url: link,
  });

  return response;
}
