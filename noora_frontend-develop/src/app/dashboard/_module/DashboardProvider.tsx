import { PropsWithChildren, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import GetOwnSettings from "@/api/own-settings/getOwnSettings";
import { useSocket } from "@/socket/useSocket";
import { Header } from "@/ui/Header";
import { Loading } from "@/ui/Loader";
import { SidebarPage } from "@/ui/Sidebar";

import DashboardContext, {
	NotificationProps,
	UserSettingsProps,
} from "./DashboardContext";

const defaultSettings: UserSettingsProps = {
	dashboardCalendar: undefined,
	dashboardNotepad: undefined,
	dashboardNotificationCard: undefined,
	dashboardTicketsCard: undefined,
	internalPhoneNo: undefined,
	notificationSound: undefined,
	notificationProject: undefined,
	notificationSystemMessage: undefined,
	notificationTask: undefined,
	notificationTasks: undefined,
	notificationTicket: undefined,
	menuStyle: "third",
};

function DashboardProvider({ children }: PropsWithChildren) {
	const { notificationsSocket } = useSocket();

	const [notifications, setNotifications] = useState<NotificationProps[]>([]);
	const [unreadCount, setUnreadCount] = useState<number>(0);
	const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
	const [userAvatarChange, setUserAvatarChange] = useState<boolean>(false);

	const [userSettings, setUserSettings] =
		useState<UserSettingsProps>(defaultSettings);

	const [isLoading, setLoading] = useState<boolean>(true);

	const ctxValue = useMemo(
		() => ({
			notifications,
			setNotifications,
			unreadCount,
			setUnreadCount,
			setUserAvatarChange,
			userAvatarChange,
			userSettings,
			setUserSettings,
		}),
		[notifications, unreadCount, userAvatarChange, userSettings],
	);

	useEffect(() => {
		(async () => {
			try {
				setLoading(true);

				let res = await GetOwnSettings();

				if (res) {
					let settings = { ...defaultSettings };
					if (res.result?.value) {
						settings = { ...settings, ...res.result.value };
					}

					setUserSettings(settings);
					localStorage.setItem("userSettings", JSON.stringify(settings));
				}
			} catch {
				toast.error("دریافت تنظیمات با مشکل مواجه شد.");
			} finally {
				setLoading(false);
			}
		})();
	}, []);

	useEffect(() => {
		if (!notificationsSocket) return;

		const handleConnect = () => {
			notificationsSocket.emit("init");
		};

		const handleInit = (notifications: any) => {
			const sortedNotifications = [...notifications.data].sort((a, b) => {
				return (
					new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
				);
			});

			setUnreadCount(notifications.unreadCount);
			setNotifications(sortedNotifications);
		};

		notificationsSocket.on("connect", handleConnect);
		notificationsSocket.on("init", handleInit);

		return () => {
			notificationsSocket.off("connect", handleConnect);
			notificationsSocket.off("init", handleInit);
		};
	}, [notificationsSocket]);

	if (isLoading) {
		<div className="h-full w-full">
			<Loading
				className="h-full"
				horizontalPlacement="center"
				verticalPlacement="center"
				size="lg"
			/>
		</div>;
	}

	return (
		<DashboardContext.Provider value={ctxValue}>
			<Header />
			<div className="relative flex grow">
				<SidebarPage
					isMenuOpen={isMenuOpen}
					setIsMenuOpen={setIsMenuOpen}
					loading={isLoading}
				/>
				<div
					className={`${
						// userSettings?.menuStyle === "second" ||
						// userSettings?.menuStyle === "first"
						// 	? "ms-14"
						// 	: "mt-10"
						"mt-10"
					} w-[-webkit-fill-available] grow overflow-hidden px-3 sm:px-5 md:px-8 lg:px-10`}
				>
					{children}
				</div>
			</div>
		</DashboardContext.Provider>
	);
}

export { DashboardProvider };
