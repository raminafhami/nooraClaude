"use client";

import { useEffect, useState } from "react";

import GetAllTickets from "@/api/ticketsapi/getAllTickets";
import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import { useSocket } from "@/socket/useSocket";

function useTicketCount(): {
	totalTickets: number;
} {
	const { identity } = useLoggedInUser();

	const { notificationsSocket } = useSocket();

	const [totalTickets, setTotalTickets] = useState<number>(0);

	useEffect(() => {
		const ticketQuernFn = async () => {
			try {
				const response = await GetAllTickets({
					page: 0,
					size: 1,
					user: { id: identity.id },
				});

				setTotalTickets(response.result.count);
			} catch (err) {
				console.error(err);
			}
		};

		ticketQuernFn();
	}, [identity.id]);

	useEffect(() => {
		if (!notificationsSocket) return;

		const handleNewNotification = (notification: any) => {
			if (notification.category.includes("tickets")) {
				setTotalTickets((prev) => prev + 1);
			}
		};

		notificationsSocket.on("newNotification", handleNewNotification);

		return () => {
			notificationsSocket.off("newNotification", handleNewNotification);
		};
	}, [notificationsSocket]);

	return {
		totalTickets,
	};
}

export { useTicketCount };
