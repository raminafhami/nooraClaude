import apiClient from "../client";

interface GetAllUsersProps {
  page: number;
  size: number;
  searchByName?: string;
  groupName?: string;
  isActive?: boolean;
  filters?: Record<string, any>;
  type?: string;
}

export default async function GetAllUsers({
  page,
  size,
  searchByName,
  groupName,
  filters,
  type,
  isActive = true, // default value set to true
}: GetAllUsersProps) {
  let response;

  // Constructing the filter
  const filter: Record<string, any> = {
    type: type ? type : { $ne: "system" },
    isActive: isActive, // Adding the isActive filter
  };

  if (searchByName) {
    filter.$or = [
      {
        $expr: {
          $regexMatch: {
            input: { $concat: ["$name", " ", "$lastname"] },
            regex: searchByName,
            options: "i",
          },
        },
      },
    ];
  }

  if (groupName) {
    filter.groups = groupName;
  }

  if (filters) {
    filter.$and = filters;
  }

  // Constructing the URL
  let link = `/users${page ? `?page=${page}` : `?page=${0}`}&${
    size ? `size=${size}` : `size=${999}`
  }&filters=${encodeURIComponent(JSON.stringify(filter))}`;

  response = await apiClient.get({
    url: link,
  });

  return response;
}
