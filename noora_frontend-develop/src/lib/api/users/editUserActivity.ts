import apiClient from "../client";

interface EditUserActivityProps {
  isActive: boolean;
  userId: string;
}

export default async function editUserActivity({
  isActive,
  userId,
}: EditUserActivityProps) {
  let response;

  // Constructing the URL
  let link = `/users/${userId}`;

  response = await apiClient.put({
    url: link,
    body: {
      isActive,
    },
  });

  return response;
}
