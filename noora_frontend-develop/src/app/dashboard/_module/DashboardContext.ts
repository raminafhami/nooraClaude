import { createContext, Dispatch, SetStateAction } from "react";

type NotificationProps = {
  title: string;
  description: string;
  category: string;
  priority: string;
  readedAt: string | null;
  userId: string;
  notificationId: string;
  createdAt: string;
  id: string;
};

type UserSettingsProps = {
  dashboardCalendar: "true" | "false" | undefined;
  dashboardNotificationCard: "true" | "false" | undefined;
  dashboardTicketsCard: "true" | "false" | undefined;
  dashboardNotepad: "true" | "false" | undefined;
  menuStyle: "first" | "second" | "third" | undefined;
  internalPhoneNo: "true" | "false" | undefined;
  notificationSound: "true" | "false" | undefined;
  notificationTicket: "true" | "false" | undefined;
  notificationProject: "true" | "false" | undefined;
  notificationTasks: "true" | "false" | undefined;
  notificationTask: "true" | "false" | undefined;
  notificationSystemMessage: "true" | "false" | undefined;
};

interface DashboardContextType {
  notifications: NotificationProps[];
  setNotifications: Dispatch<SetStateAction<NotificationProps[]>>;
  unreadCount: number;
  setUnreadCount: Dispatch<SetStateAction<number>>;
  userAvatarChange: boolean;
  setUserAvatarChange: Dispatch<SetStateAction<boolean>>;
  userSettings: UserSettingsProps;
  setUserSettings: Dispatch<SetStateAction<UserSettingsProps>>;
}

const DashboardContext = createContext<DashboardContextType>(
  {} as DashboardContextType
);

export type { NotificationProps, UserSettingsProps };
export default DashboardContext;
