import { NotificationsPriority } from "./NotificationsPriority";

export interface Notifications {
  title: string;
  description: string;
  category: string;
  priority: NotificationsPriority;
  isPublished: boolean;
  createdBy: string;
  createdAt: string;
  modifiedAt: string;
  id: string;
}

// export interface Notifications {
//   id: string;
//   title: string;
//   description: string;
//   category: string;
//   recipient: {
//     users: string[];
//     groups: string[];
//   };
//   priority: NotificationsPriority;
//   isPublished: boolean;
//   createdBy: string | null;
//   createdAt: Date;
//   modifiedBy: string | null;
//   modifiedAt: Date | null;
// }
