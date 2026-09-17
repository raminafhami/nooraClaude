"use client";

import { createContext } from "react";
import { Socket } from "socket.io-client";

type SocketContextType = Partial<{
	notificationsSocket: Socket;
	tasksSocket: Socket;
}>;

const SocketContext = createContext<SocketContextType | null>(null);

export type { SocketContextType };
export { SocketContext };
