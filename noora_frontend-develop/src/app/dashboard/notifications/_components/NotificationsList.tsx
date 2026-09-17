"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { IoCheckmarkDoneSharp, IoChevronUp } from "react-icons/io5";
import { MdOutlineNotificationAdd } from "react-icons/md";
import { Tooltip } from "react-tooltip";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import Pagination from "@/components/ui/pagination/Pagination";
import { cn } from "@/lib/utils";
import { NotificationMessages } from "@/notifications/models/NotificationsMessages";
import GetNotificationsMessageList from "@/notifications/services/getNotificationsMessageList";
import PutAllNotificationsMessageSeen from "@/notifications/services/putAllNotificationMessageSeen";
import PutNotificationsMessageById from "@/notifications/services/putNotificationMessage";
import { TimeRelative } from "@/ui/Time";
import { Disclosure } from "@headlessui/react";

import DashboardContext from "../../_module/DashboardContext";

interface NotificationsListProps {
	isCard?: boolean;
}
export function NotificationsList({ isCard }: NotificationsListProps) {
	const router = useRouter();
	const searchParams = useSearchParams();

	const { notifications, setNotifications, setUnreadCount } =
		useContext(DashboardContext);

	const [notificationsMessages, setNotificationMessages] = useState<
		NotificationMessages[]
	>([]);

	const [loading, setLoading] = useState<boolean>(true);
	const [onRead, setOnRead] = useState<boolean>(false);
	const [items, setItems] = useState<number>(0);
	const [currentPage, setCurrentPage] = useState<number>(0);
	const [size, setSize] = useState<number>(10);

	const getData = async () => {
		try {
			setLoading(true);
			await GetNotificationsMessageList({
				page: isCard ? 0 : currentPage,
				size: isCard ? 4 : size,
				sort: { createdAt: "desc" },
			}).then((res) => {
				const sortedNotifications = [...res.data].sort((a, b) => {
					return (
						new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
					);
				});
				setNotificationMessages(sortedNotifications);
				setItems(res.count);
			});
		} catch (error) {
			toast.error("خطایی رخ داد");
		} finally {
			setLoading(false);
		}
	};

	const readMessage = async (notificationId: string) => {
		const notificationItem = notifications.find((notif) => {
			return notif.id === notificationId;
		});

		if (notificationItem?.readedAt === null) {
			setNotifications((prev) => {
				return prev.map((notifis) => {
					if (notifis.id === notificationItem.id) {
						return {
							...notifis,
							readedAt: "true",
						};
					}
					return notifis;
				});
			});
		}

		const item = notificationsMessages.find((notif) => {
			return notif.id === notificationId;
		});

		if (item?.readedAt === null) {
			setOnRead(true);
			await PutNotificationsMessageById({
				id: notificationId,
			}).then(async (res) => {
				setNotificationMessages((prev) => {
					return prev.map((notifMessage) => {
						if (notificationId === notifMessage.id) {
							return {
								...notifMessage,
								readedAt: "true",
							};
						}
						return notifMessage;
					});
				});
				setUnreadCount((prev) => prev - 1);
				setOnRead(false);
			});
		}
	};

	const readAllMessage = () => {
		const notificationItem = notifications.filter((notif) => {
			return notif.readedAt === null;
		});

		setNotifications((prev) => {
			return prev.map((notifis) => {
				const isRead = notificationItem.some((item) => item.id === notifis.id);
				if (isRead) {
					return {
						...notifis,
						readedAt: new Date().toLocaleString("fa-IR"),
					};
				}
				return notifis;
			});
		});

		const item = notificationsMessages.filter((notif) => {
			return notif.readedAt === null;
		});

		setNotificationMessages((prev) => {
			return prev.map((notifMessage) => {
				const isUnread = item.some((item) => item.id === notifMessage.id);
				if (isUnread) {
					return {
						...notifMessage,
						readedAt: new Date().toLocaleString("fa-IR"),
					};
				}
				return notifMessage;
			});
		});
		setUnreadCount(0);
		setOnRead(false);
	};

	useEffect(() => {
		getData();

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentPage]);

	useEffect(() => {
		const notificationId = searchParams.get("id");
		if (notificationId) {
			readMessage(notificationId);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [notificationsMessages]);

	return (
		<div className="flex w-full flex-col items-end gap-2">
			{!isCard && (
				<div className="flex items-center gap-2">
					<Button
						variant="primary"
						onClick={async () => {
							const readAll = await PutAllNotificationsMessageSeen();
							if (readAll.message === "success") {
								readAllMessage();
								toast.success("وضعیت تمام اعلانات به خوانده شده تغییر یافت");
							}
						}}
					>
						<span> خوانده شدن همه</span>
						<IoCheckmarkDoneSharp size={20} />
					</Button>

					<Button
						variant="primary"
						onClick={() => router.push("/dashboard/notifications/add")}
					>
						<span> ارسال اعلان جدید</span>
						<MdOutlineNotificationAdd size={20} />
					</Button>
				</div>
			)}
			{!notificationsMessages.length ? (
				<div className="w-full py-5 text-center">اعلانی یافت نشد</div>
			) : (
				<>
					{/* // <Accordion className="w-full mt-2" collapseAll> */}
					<div className="w-full">
						<div
							className={cn(
								"w-full rounded-2xl bg-white",
								isCard && "rounded-t-none",
							)}
						>
							{notificationsMessages.map((notification, index) => {
								return (
									<Disclosure
										key={index}
										defaultOpen={searchParams.get("id") === notification.id}
									>
										{({ open }) => (
											<>
												<Disclosure.Button
													disabled={isCard || onRead}
													className={cn(
														"relative flex w-full flex-wrap justify-between border border-gray-200 bg-white px-4 py-6 text-right shadow-sm hover:bg-gray-100",
														index === 0 && !isCard && "rounded-t-2xl",
														index === notificationsMessages.length - 1 &&
															!open &&
															"rounded-b-2xl",
														notification.id === searchParams.get("id")
															? "animate-blue-pulse"
															: "",
														isCard && "border-x-0 border-b-0 border-t",
													)}
													onClick={() => {
														notification.readedAt === null &&
															readMessage(notification.id);
													}}
												>
													<span className="mb-2 flex items-center gap-2 xs:mb-0">
														{notification.readedAt === null && (
															<div className="relative flex h-3 w-3 items-center justify-center">
																<div className="absolute inline-flex h-full w-full animate-ping items-center justify-center rounded-full bg-red-400 opacity-75"></div>
																<div className="relative inline-flex h-2 w-2 items-center justify-center rounded-full bg-red-600"></div>
															</div>
														)}
														{notification.title}
													</span>

													<div className="mb-2 mr-auto flex items-center gap-2 xs:mb-0">
														<span className="rounded-xl bg-gray-50 px-3 py-0.5 text-xs text-gray-900">
															{notification.category.includes("tickets")
																? "تیکت"
																: notification.category.includes("task")
																	? "تسک"
																	: notification.category.includes("projects")
																		? "پروژه"
																		: notification.category.includes("tasks")
																			? "تسک"
																			: notification.category}
														</span>
														{notification.priority === "high" && (
															<span className="rounded-xl bg-red-50 px-3 py-0.5 text-xs text-red-900">
																فوری
															</span>
														)}
														{notification.priority === "medium" && (
															<span className="rounded-xl bg-green-50 px-3 py-0.5 text-xs text-green-900">
																متوسط
															</span>
														)}

														{notification.priority === "low" && (
															<span className="rounded-xl bg-yellow-50 px-3 py-0.5 text-xs text-yellow-900">
																پایین
															</span>
														)}

														<span className="mr-2 text-xs">
															<TimeRelative
																time={new Date(notification.createdAt)}
															/>
														</span>
														{!isCard && (
															<IoChevronUp
																size={18}
																className={`${
																	open ? "rotate-180 transform" : ""
																} absolute left-2 top-[34%] ml-2 h-5 w-5 text-gray-700 transition-all delay-75`}
															/>
														)}
													</div>
												</Disclosure.Button>
												<Disclosure.Panel className="bg-gray-50 px-4 py-6 text-gray-700">
													{notification.description}
												</Disclosure.Panel>
											</>
										)}
									</Disclosure>
								);
							})}{" "}
						</div>
					</div>
				</>
			)}

			{!isCard && (
				<Pagination
					className="mt-2 !pl-0"
					items={items}
					currentPage={currentPage}
					size={size}
					onPageChange={setCurrentPage}
					loading={loading}
					setSize={setSize}
				/>
			)}
			<Tooltip id={"markAllAsRead"}>علامت زدن همه به عنوان خوانده شده</Tooltip>
		</div>
	);
}
