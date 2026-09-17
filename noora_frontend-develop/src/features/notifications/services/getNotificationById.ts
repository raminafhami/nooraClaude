import apiClient from "@/api/client";

interface GetNotificationsProps {
  id: string;
}

export default async function GetNotificationsById({
  id,
}: GetNotificationsProps) {
  let response;
  let link = `notifications/${id}`;

  response = await apiClient.get({
    url: link,
  });

  return response;
}
