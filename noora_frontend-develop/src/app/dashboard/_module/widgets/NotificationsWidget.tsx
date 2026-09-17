"use client";

import { useSearchParams } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardNav,
	CardTitle,
} from "@/components/ui/card";
import { DynamicLink } from "@/components/ui/dynamic-link";
import { cn } from "@/lib/utils";
import { NotificationMessages } from "@/notifications/models/NotificationsMessages";
import GetNotificationsMessageList from "@/notifications/services/getNotificationsMessageList";
import { TimeRelative } from "@/ui/Time";
import { Disclosure } from "@headlessui/react";

import DashboardContext from "../DashboardContext";

function NotificationsWidget() {
	const { unreadCount } = useContext(DashboardContext);
	const searchParams = useSearchParams();

	const [notificationsMessages, setNotificationMessages] = useState<
		NotificationMessages[]
	>([]);

	const getData = async () => {
		try {
			await GetNotificationsMessageList({
				page: 0,
				size: 4,
				sort: { createdAt: "desc" },
			}).then((res) => {
				const sortedNotifications = [...res.data].sort((a, b) => {
					return (
						new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
					);
				});
				setNotificationMessages(sortedNotifications);
			});
		} catch (error) {
			toast.error("خطایی رخ داد");
		}
	};

	useEffect(() => {
		getData();
	}, []);
	return (
		<Card className="col-span-full border-0 shadow-none xl:col-span-5">
			<CardHeader orientation="horizontal" className="pb-0">
				<CardTitle>
					<div>اعلان ها</div>
					<div className="h-3 w-3 rounded-full bg-red-600"></div>
					<div className="text-sm">{unreadCount} اعلان جدید</div>
				</CardTitle>
				<CardNav>
					<DynamicLink href="/dashboard/notifications">
						<Button variant="ghost">مشاهده همه</Button>
					</DynamicLink>
				</CardNav>
			</CardHeader>

			<CardContent className="p-0">
				<div className="flex w-full flex-col items-end gap-2">
					{!notificationsMessages.length ? (
						<div className="w-full py-5 text-center">اعلانی یافت نشد</div>
					) : (
						<>
							<div className="w-full rounded-2xl rounded-t-none bg-white">
								{notificationsMessages.map((notification, index) => {
									return (
										<Disclosure
											key={index}
											defaultOpen={searchParams.get("id") === notification.id}
										>
											{({ open }) => (
												<>
													<Disclosure.Button
														className={cn(
															"relative flex w-full justify-between border-b border-t-0 bg-white px-4 py-4 text-right",

															index === notificationsMessages.length - 1 &&
																!open &&
																"rounded-b-2xl",

															index === 3 && "border-b-0",
														)}
													>
														<span className="w-4/5 truncate">
															{notification.title}
														</span>

														<span className="flex w-1/5 items-center justify-end text-xs font-normal text-gray-700">
															<TimeRelative
																time={new Date(notification.createdAt)}
															/>
														</span>
													</Disclosure.Button>
												</>
											)}
										</Disclosure>
									);
								})}
							</div>
						</>
					)}
				</div>
			</CardContent>
		</Card>
	);
}

export { NotificationsWidget };
