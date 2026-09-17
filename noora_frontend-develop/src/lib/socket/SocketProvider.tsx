"use client";

import { useEffect, useMemo, useState } from "react";
import { io, Socket } from "socket.io-client";

import getUniversalSession from "@/auth/utils/getUniversalSession";

import { SocketContext, SocketContextType } from "./SocketContext";

function SocketProvider(props: React.PropsWithChildren) {
	const [notificationsSocket, setNotificationsSocket] = useState<Socket>();
	const [tasksSocket, setTasksSocket] = useState<Socket>();

	useEffect(() => {
		const { accessToken } = getUniversalSession();

		if (!accessToken) return;

		let notificationsSocket: Socket | undefined;
		let tasksSocket: Socket | undefined;

		Promise.all([
			(() => {
				notificationsSocket = io(
					`${process.env.NEXT_PUBLIC_EXTERNAL_API_URL!}/notifications`,
					{
						extraHeaders: {
							authorization: `${accessToken}`,
						},
					},
				);
			})(),

			(() => {
				tasksSocket = io(`${process.env.NEXT_PUBLIC_EXTERNAL_API_URL!}/tasks`, {
					extraHeaders: {
						authorization: `${accessToken}`,
					},
				});
			})(),
		]);

		setNotificationsSocket(notificationsSocket);
		setTasksSocket(tasksSocket);

		return () => {
			notificationsSocket?.disconnect();
			setNotificationsSocket(undefined);

			tasksSocket?.disconnect();
			setTasksSocket(undefined);
		};
	}, []);

	const contextValue = useMemo<SocketContextType>(
		() => ({ notificationsSocket, tasksSocket }),
		[notificationsSocket, tasksSocket],
	);

	return <SocketContext.Provider value={contextValue} {...props} />;
}

export { SocketProvider };
