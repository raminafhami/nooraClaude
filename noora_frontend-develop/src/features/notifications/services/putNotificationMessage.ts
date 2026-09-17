import apiClient from "@/api/client";

export interface PutNotificationsMessageByIdProps {
  id: string;
}

export default async function PutNotificationsMessageById({
  id,
}: PutNotificationsMessageByIdProps) {
  let response;
  let link = `/notifications/messages/${id}/seen`;

  response = await apiClient.put({
    url: link,
  });

  return response;
}
