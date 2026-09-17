import apiClient from "@/api/client";

interface GetNotificationsProps {
  page: number;
  size: number;
}

export default async function GetNotifications({
  page,
  size,
}: GetNotificationsProps) {
  let response;
  let link = `notifications?page=${page}&size=${size}`;

  response = await apiClient.get({
    url: link,
  });

  return response.result.data;
}
