"use client";

import { useEffect, useState } from "react";

import { useSocket } from "@/socket/useSocket";

function useTasksSocket(): {
	totalTasks: number;
} {
	const { tasksSocket } = useSocket();

	const [totalTasks, setTotalTasks] = useState<number>(0);

	useEffect(() => {
		if (!tasksSocket) return;

		tasksSocket.emit("init");
	}, [tasksSocket]);

	useEffect(() => {
		if (!tasksSocket) return;

		const handleInit = (data: { taskCount: number }) => {
			setTotalTasks(data.taskCount);
		};

		tasksSocket.on("init", handleInit);

		return () => {
			tasksSocket.off("init", handleInit);
		};
	}, [tasksSocket]);

	useEffect(() => {
		if (!tasksSocket) return;

		const handleNewTask = () => {
			setTotalTasks((prev) => prev + 1);
		};
		tasksSocket.on("newTask", handleNewTask);

		return () => {
			tasksSocket.off("newTask", handleNewTask);
		};
	}, [tasksSocket, totalTasks]);

	return { totalTasks };
}

export { useTasksSocket };
