import apiClient from "@/api/client";

import { NotificationsPriority } from "../models/NotificationsPriority";

export interface PostNotificationsProps {
  title: string;
  description: string;
  category: string;
  priority: NotificationsPriority | "high" | "medium" | "low";
  users: string[];
  groups: string[];
  sendNotification: boolean;
}

export default async function PostNotifications({
  title,
  description,
  category,
  priority,
  users,
  groups,
  sendNotification,
}: PostNotificationsProps) {
  let response;
  let link = `/notifications`;

  response = await apiClient.post({
    url: link,
    body: {
      title,
      description,
      category,
      recipient: { users, groups },
      priority,
      sendNotification,
    },
  });

  return response;
}
