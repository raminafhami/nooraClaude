import apiClient from "@/api/client";

interface GetNotificationsMessageListProps {
  page: number;
  size: number;
  sort?: object;
}

export default async function GetNotificationsMessageList({
  page,
  size,
  sort,
}: GetNotificationsMessageListProps) {
  let response;
  let link = `notifications/messages/list?page=${page}&size=${size}&sort=${JSON.stringify(
    sort,
  )}`;

  response = await apiClient.get({
    url: link,
  });

  return response.result;
}
