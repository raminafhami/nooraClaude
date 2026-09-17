"use client";

import {
	LucideClipboardList,
	LucideGitPullRequestArrow,
	LucideHistory,
	LucideListTodo,
	LucideMessagesSquare,
} from "lucide-react";

import TabsCreator, { TabsData } from "@/components/ui/tabs/TabsCreator";
import { InstanceCreateWidget } from "@/felo/instances/components/InstanceCreateWidget";
import { useTasksSocket } from "@/felo/tasks/hooks/useTasksSocket";
import { useTicketCount } from "@/ticket/hooks/useTicketCount";
import { Layout } from "@/ui/Layout";

import InstanceCopy from "../../_module/instance-copy/InsatnceCopy";
import { ApplicationsPage } from "./instances/ApplicationsPage";
import TasksListPage from "./task-manager/page";
import { MyTicketList } from "./ticket/MyTicketList";
import TaskList from "./user-tasks/TaskList";

function WorkspacePage() {
	const { totalTasks } = useTasksSocket();
	const { totalTickets } = useTicketCount();

	const TasksTabs: TabsData[] = [
		{
			name: "کارهای من",
			color: "",
			icon: LucideClipboardList,
			value: "usertasks",
			total: totalTasks,
			element: <TaskList />,
		},
		{
			name: "درخواست جدید",
			color: "",
			icon: LucideGitPullRequestArrow,
			value: "create-application",
			element: (
				<div className="flex gap-6">
					<div className="shrink-0 basis-1/2">
						<InstanceCreateWidget />
					</div>
					<div className="shrink-0 basis-1/2">
						<InstanceCopy />
					</div>
				</div>
			),
		},
		{
			name: "تیکت\u200cها",
			color: "",
			icon: LucideMessagesSquare,
			value: "ticket",
			total: totalTickets,
			element: <MyTicketList />,
		},
		{
			name: "تسک\u200cها",
			color: "",
			icon: LucideListTodo,
			value: "tasks",
			element: <TasksListPage />,
		},
		{
			name: "تاریخچه درخواست\u200cها",
			color: "",
			icon: LucideHistory,
			value: "instances",
			element: <ApplicationsPage />,
		},
	];

	return (
		<Layout.Root>
			<Layout.Content className="pt-2">
				<TabsCreator data={TasksTabs} />
			</Layout.Content>
		</Layout.Root>
	);
}

export default WorkspacePage;
