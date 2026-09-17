import apiClient from "@/api/client";

export interface PostNotificationsById {
  id: string;
}

export default async function PostNotificationsById({
  id,
}: PostNotificationsById) {
  let response;
  let link = `/notifications/${id}/send`;

  response = await apiClient.post({
    url: link,
  });

  return response;
}
