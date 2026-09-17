import apiClient from "@/api/client";

export default async function PutAllNotificationsMessageSeen() {
  let response;
  let link = `/notifications/messages/seen`;

  response = await apiClient.put({
    url: link,
  });

  return response;
}
