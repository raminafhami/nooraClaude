"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { FaEye } from "react-icons/fa";
import {
  FaBell,
  FaComments,
  FaCreditCard,
  FaGear,
  FaHouse,
} from "react-icons/fa6";
import { IoMdRefresh } from "react-icons/io";

import DashboardContext, { NotificationProps } from "@/app/dashboard/_module/DashboardContext";
import logo from "@/assets/images/dashboard-logo.svg";
import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import { DynamicLink } from "@/components/ui/dynamic-link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getEmails } from "@/emails/services/getEmails";
import { InstanceStatus } from "@/felo/instances/enums/InstanceStatus";
import { getInstances } from "@/felo/instances/services/getInstances";
import getActiveUser from "@/identity/users/services/getActiveUser";
import { InvoicePaymentStatus } from "@/inspection/models/InvoicePaymentStatus";

import BgPicBottom from "../../../../public/images/navIcons/Frame 1984077919 (2).svg";
import BgPicTop from "../../../../public/images/navIcons/Frame 1984077920 (3).svg";
import setting from "../../../../public/images/navIcons/Group 120.svg";
import Email from "../../../../public/images/navIcons/Group 121.svg";
import NotificationAlarm from "../../../../public/images/navIcons/Group 83 (2).svg";
import Comments from "../../../../public/images/navIcons/Group 84 (3).svg";
import SignOut from "../../../../public/images/navIcons/Group 86 (2).svg";
import Wallet from "../../../../public/images/navIcons/Group 90.svg";
import { CUSTOMER_LOGO } from "@/branding";
import { useSocket } from "../../socket/useSocket";
import { Loading } from "../Loader";
import { getNavItems } from "../Navbar/navService";
import UpMenu from "../Navbar/UpMenu";
import { TimeRelative } from "../Time/TimeRelative";
import { User } from "../User/User";

export function Header() {
	const router = useRouter();

	const { identity } = useLoggedInUser();

	const { notificationsSocket } = useSocket();
	const {
		notifications,
		setNotifications,
		unreadCount,
		setUnreadCount,
		userSettings,
	} = useContext(DashboardContext);

	const [showNotificationBox, setShowNotificationBox] =
		useState<boolean>(false);
	const notificationRef = useRef<HTMLDivElement>(null);
	const [userCreditRemain, setUserCreditRemain] = useState<number>(0);
	const [userDebt, setUserDebt] = useState<number>(0);
	const [userCreditWithDebt, setUserCreditWithDebt] = useState<number>(0);
	const [loading, setLoading] = useState<boolean>(true);
	const GetUserCreditData = useCallback(async () => {
		setLoading(true);
		try {
			const [user, debt] = await Promise.all([
				getActiveUser(),
				getInstances({
					filters: [
						{ name: "status", value: InstanceStatus.Completed },
						{
							name: "processDefinitionKey",
							value: { $regex: `^Inspection_Case` },
						},
						{ name: `parameters.Assignees.customer.id`, value: identity.id },
						{
							name: "parameters.InvoicePaymentStatus",
							value: { $exists: true },
						},
						{
							name: "parameters.InvoicePaymentStatus",
							// value: {
							// 	$ne: InvoicePaymentStatus.Paid,
							// },
							value: InvoicePaymentStatus.Unpaid,
						},
					],
					props: ["InvoiceTotal"],
				}).then((instances) => {
					const debt = instances
						.map(
							(instance) => Number(instance.parameters?.["InvoiceTotal"]) || 0,
						)
						.reduce((acc, curr) => acc + curr, 0);

					return debt;
				}),
			]);

			setUserCreditWithDebt(user.credit - debt);
			setUserCreditRemain(user.credit);
			setUserDebt(debt);
		} catch (e) {
			console.error(e);
		} finally {
			setLoading(false);
		}
	}, [identity.id]);

	useEffect(() => {
		GetUserCreditData();
	}, [GetUserCreditData]);

	useEffect(() => {
		if (!notificationsSocket) return;

		function handleNewNotification(notification: any) {
			setNotifications((prev) => [notification, ...prev]);
			setUnreadCount((prev) => prev + 1);

			const settings = localStorage.getItem("userSettings")
				? JSON.parse(localStorage.getItem("userSettings")!)
				: {
						dashboardCalendar: undefined,
						dashboardNotepad: undefined,
						dashboardNotificationCard: undefined,
						dashboardTicketsCard: undefined,
						notificationSound: undefined,
						notificationProject: undefined,
						notificationSystemMessage: undefined,
						notificationTask: undefined,
						notificationTasks: undefined,
						notificationTicket: undefined,
					};

			if (
				settings?.notificationSound === "true" ||
				!settings?.notificationSound
			) {
				if (
					notification.category.includes("tickets") &&
					(settings?.notificationTicket === "true" ||
						!settings?.notificationTicket)
				) {
					showNotificationPopup(notification);
				} else if (
					notification.category.includes("tasks") &&
					(settings?.notificationTasks === "true" ||
						!settings?.notificationTasks)
				) {
					showNotificationPopup(notification);
				} else if (
					notification.category.includes("projects") &&
					(settings?.notificationProject === "true" ||
						!settings?.notificationProject)
				) {
					showNotificationPopup(notification);
				} else if (
					notification.category.includes("task") &&
					(settings?.notificationTask === "true" || !settings?.notificationTask)
				) {
					showNotificationPopup(notification);
				} else if (
					!notification.category.includes("tickets") &&
					!notification.category.includes("tasks") &&
					!notification.category.includes("task") &&
					!notification.category.includes("projects")
				) {
					showNotificationPopup(notification);
				}
			}
		}

		notificationsSocket.on("newNotification", handleNewNotification);

		return () => {
			notificationsSocket.off("newNotification", handleNewNotification);
		};
	}, [setNotifications, setUnreadCount, notificationsSocket]);

	const handleClickNotification = (notifs: NotificationProps) => {
		const id = notifs.category.split(":")[1];
		const messageId = notifs.id;
		const payload = { messageId };

		if (notifs.readedAt === null) {
			notificationsSocket?.emit("seenNotificationMessage", payload);
			setUnreadCount((prev) => prev - 1);

			setNotifications((prev) => {
				const updatedNotifications = prev.map((notif) => {
					if (notif.id === notifs.id) {
						notif.readedAt = JSON.stringify(new Date());
					}
					return notif;
				});
				return updatedNotifications;
			});
		}

		if (notifs.category.includes("tickets")) {
			router.push(`/dashboard/tickets-list?ticketId=${id}`);
		} else if (notifs.category.includes("tasks")) {
			router.push(`/dashboard/tasks-list/${id}`);
		} else if (notifs.category.includes("projects")) {
			router.push(`/dashboard/tasks-list`);
		} else if (notifs.category.includes("task")) {
			router.push(`/dashboard/tasks/${id}`);
		} else {
			router.push(`/dashboard/notifications?id=${notifs.id}`);
		}

		setShowNotificationBox(false);
	};

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				notificationRef.current &&
				!notificationRef.current.contains(event.target as Node)
			) {
				setShowNotificationBox(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	const pathname = usePathname();
	const navItems = getNavItems(identity!, pathname);

	return (
		<div className="z-50 flex max-h-[80px] items-center justify-between rounded-bl-full rounded-br-full bg-[#0A263B] px-[3rem] text-white shadow-lg shadow-black/40">
			<Image
				src={CUSTOMER_LOGO.src}
				alt={CUSTOMER_LOGO.alt}
				width={64}
				height={64}
				priority
				className="h-12 w-12 shrink-0 sm:h-16 sm:w-16"
			/>

			{/* {userSettings?.menuStyle === "third" && <UpMenu items={navItems} />} */}

			<UpMenu items={navItems} />

			<div className="flex shrink-0">
				<div className="relative flex flex-col items-center pl-8 sm:px-2">
					<Image
						src={BgPicTop}
						alt="frame"
						width={200}
						className="max-w-[150px] sm:max-w-[160px]"
					/>

					<div className="flex h-[40px] translate-x-3 gap-2 sm:-start-2 sm:items-center">
						<User />

						<div className="flex translate-x-[-30px] items-center sm:translate-x-0">
							{/* <DynamicLink
								href="/dashboard/settings	"
								className="text-xl/6 text-gray-200 transition hover:text-gray-100"
							>
								<Image
									className="w-[37.5px] sm:w-[40px]"
									src={setting}
									alt="profile"
									width={50}
									priority
								/>
							</DynamicLink> */}
							<div className="relative">
								<Image
									onClick={() => setShowNotificationBox(!showNotificationBox)}
									className={`w-[37.5px] cursor-pointer text-xl/6 sm:w-[40px] ${
										showNotificationBox ? "text-blue-100" : "text-gray-200"
									}`}
									src={NotificationAlarm}
									alt="NOTIFIFACTION ALARM."
									width={50}
								/>
								<div
									className="absolute -start-1 top-0 self-end"
									ref={notificationRef}
								>
									<div
										className="flex cursor-pointer justify-between"
										onClick={() => setShowNotificationBox(!showNotificationBox)}
									>
										<div className="flex cursor-pointer justify-between">
											{unreadCount !== 0 ? (
												<span className="absolute flex h-4 w-4 items-center justify-center">
													<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
													<span className="relative inline-flex h-4 w-4 items-center justify-center rounded-full bg-red-600 pt-1 text-2xs text-white">
														{unreadCount}
													</span>
												</span>
											) : (
												""
											)}
										</div>
									</div>

									{showNotificationBox && (
										<div className="fixed left-0 top-10 z-50 w-full max-w-[300px] rounded-lg border border-gray-100 bg-white text-black shadow-md sm:absolute sm:-left-11 sm:top-10 sm:w-[300px]">
											<div className="scrollbar-thin scrollbar-thumb-gray-200 scrollbar-thumb-rounded-full scrollbar-h-fit mb-2 h-80 overflow-y-auto">
												{!notifications.length ? (
													<div className="py-10 text-center">
														اعلان جدیدی یافت نشد
													</div>
												) : (
													notifications.slice(0, 10).map((notifs, index) => (
														<div
															key={index}
															className={`flex cursor-pointer flex-col gap-y-1 p-2 hover:bg-gray-50 ${
																index < notifications.length - 1 && "border-b"
															} `}
															onClick={() => handleClickNotification(notifs)}
														>
															<div className="flex items-center justify-between gap-2">
																<div className="flex items-center gap-2 text-xs font-semibold">
																	<div> {notifs.title}</div>
																	<span className="flex items-center gap-2">
																		{notifs.readedAt === null && (
																			<div className="relative flex h-2.5 w-2.5 items-center justify-center">
																				<div className="absolute inline-flex h-full w-full animate-ping items-center justify-center rounded-full bg-red-400 opacity-75"></div>
																				<div className="relative inline-flex h-1.5 w-1.5 items-center justify-center rounded-full bg-red-600"></div>
																			</div>
																		)}
																	</span>
																</div>
															</div>
															<div>
																<div className="overflow-hidden text-ellipsis whitespace-nowrap text-xs text-gray-700">
																	{notifs.description}
																</div>
																<div className="mt-2 flex items-center justify-end gap-2">
																	{notifs.priority === "high" && (
																		<span className="w-14 rounded-md bg-red-50 py-0.5 text-center text-xs text-red-900">
																			فوری
																		</span>
																	)}
																	{notifs.priority === "medium" && (
																		<span className="w-14 rounded-md bg-green-50 py-0.5 text-center text-xs text-green-900">
																			متوسط
																		</span>
																	)}

																	{notifs.priority === "low" && (
																		<span className="w-14 rounded-md bg-yellow-50 py-0.5 text-center text-xs text-yellow-900">
																			پایین
																		</span>
																	)}
																	<span className="w-20 rounded-md bg-gray-50 py-0.5 text-center text-xs text-gray-500">
																		<TimeRelative
																			time={new Date(notifs.createdAt)}
																		/>
																	</span>
																</div>
															</div>
														</div>
													))
												)}
											</div>
											<div className="sticky bottom-0 flex w-full justify-center rounded-md bg-gray-100 py-1 shadow">
												<span
													className="flex w-fit cursor-pointer items-center justify-center gap-2 hover:text-green-800"
													onClick={() => {
														setShowNotificationBox(false);
														router.push("/dashboard/notifications");
													}}
												>
													<FaEye size={"0.9rem"} />
													<span> مشاهده تمام اعلانات</span>
												</span>
											</div>
										</div>
									)}
								</div>
							</div>
							<DynamicLink
								href="/dashboard/tickets-list"
								className="text-xl/6 text-gray-200 transition hover:text-gray-100"
							>
								<Image
									className="w-[37.5px] sm:w-[40px]"
									src={Comments}
									alt="comments"
									width={50}
									priority
								/>
							</DynamicLink>
							<DynamicLink
								href="/dashboard/emails"
								className="text-xl/6 text-gray-200 transition hover:text-gray-100"
							>
								<Image
									className="w-[37.5px] sm:w-[40px]"
									src={Email}
									alt="email"
									width={50}
									priority
								/>
								<div className="absolute top-0 self-end">
									<UnreadEmailsCount />
								</div>
							</DynamicLink>
							<DynamicLink
								href="/api/auth/logout"
								className="text-xl/6 text-gray-200 transition hover:text-gray-100"
							>
								<Image
									className="w-[37.5px] sm:w-[40px]"
									src={SignOut}
									alt="logout"
									width={50}
									priority
								/>
							</DynamicLink>
						</div>
					</div>

					<Image
						src={BgPicBottom}
						alt="frame"
						width={200}
						className="max-w-[150px] sm:max-w-[160px]"
					/>
				</div>
			</div>
		</div>
	);
}

const requestAudioPermission = async () => {
	if (window.AudioContext) {
		const AudioContext = window.AudioContext;
		const audioContext = new AudioContext();
		audioContext
			.resume()
			.then(() => {})
			.catch((error) => {
				console.error("Unable to start audio context:", error);
			});
	} else {
		console.error("AudioContext not supported");
	}
};

const playNotificationSound = () => {
	const notificationSound = new Audio("/sound/notification-sound.mp3");
	requestAudioPermission();
	notificationSound.play();
};

const showNotificationPopup = (notification: NotificationProps) => {
	if ("Notification" in window) {
		if (Notification.permission === "granted") {
			displayNotification(notification);
		} else if (Notification.permission !== "denied") {
			Notification.requestPermission().then((permission) => {
				if (permission === "granted") {
					displayNotification(notification);
				}
			});
		}
	}
};

const displayNotification = (notification: NotificationProps) => {
	new Notification(notification.title, {
		body: notification.description,
		icon: "/images/popuplogo.svg",
	});
	playNotificationSound();
};

const UnreadEmailsCount = () => {
	const [unreadEmailsCount, setUnreadEmailsCount] = useState<number>(0);
	useEffect(() => {
		const fetchUnreadEmails = () => {
			getEmails({
				folder: "INBOX",
				page: 1,
				unread: "true",
				size: 1,
			}).then((res) => {
				setUnreadEmailsCount(res.count);
			});
		};

		fetchUnreadEmails();
		const interval = setInterval(fetchUnreadEmails, 600000);

		return () => clearInterval(interval);
	}, []);

	return (
		<>
			{unreadEmailsCount !== 0 ? (
				<div className="flex cursor-pointer justify-between">
					<span className="absolute flex h-4 w-4 items-center justify-center">
						<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
						<span className="relative inline-flex h-4 w-4 items-center justify-center rounded-full bg-red-600 pt-1 text-2xs text-white">
							{unreadEmailsCount}
						</span>
					</span>
				</div>
			) : (
				""
			)}
		</>
	);
};
