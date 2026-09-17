import apiClient from "../client";

interface GetAllUserGroupsProps {
  page: number;
  size: number;
  searchByName?: string;
}

export default async function GetAllUserGroups({
  page,
  size,
  searchByName,
}: GetAllUserGroupsProps) {
  let response;
  let link = `/user-groups${page ? `?page=${page}` : `?page=${0}`}&${
    size ? `size=${size}` : `size=${999}`
  }${
    searchByName
      ? `&filters={"$or":[{"$expr":{"$regexMatch":{"input":{"$concat":["$title"," "]},"regex":"${searchByName}","options":"i"}}}]}`
      : ""
  }`;

  response = await apiClient.get({
    url: link,
  });

  return response;
}
