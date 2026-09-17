"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { FaEye } from "react-icons/fa6";

import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import { Button } from "@/components/ui/button";
import { DeadlineProgressBar } from "@/components/ui/deadline-progressbar";
import {
	Table,
	TableAction,
	TableActions,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { addWatcherToInstance } from "@/felo/instances/services/addWatcherToInstance";
import { TaskKind } from "@/felo/tasks/enums/TaskKind";
import { Task } from "@/felo/tasks/models/Task";
import { claimTask } from "@/felo/tasks/services/claimTask";
import { PaymentPriority } from "@/inspection/flows/paymentOrder/data/PaymentPriority";
import { cn } from "@/lib/utils";
import { Loading } from "@/ui/Loader";
import { Panel } from "@/ui/Panel";
import { getDynamicUrl } from "@/utils/url/getDynamicUrl";

import { TaskItemActionMore } from "./TaskItemActionMore";
import { TaskItemDate } from "./TaskItemDate";
import { TaskItemMore } from "./TaskItemMore";
import { TaskItemProcess } from "./TaskItemProcess";

function getDeadlineProgressBarColors(percentageRemaining: number) {
	let progressColor = "bg-green-200";
	let bgColor = "bg-gray-200";
	let textColor = "text-green-400";

	if (percentageRemaining <= 0) {
		bgColor = "bg-red-300";
		textColor = "text-red-400";
		progressColor = "bg-red-400";
	} else if (percentageRemaining < 60) {
		progressColor = "bg-[#fffdb2]";
		textColor = "text-yellow-400";
	}

	return { bgColor, progressColor, textColor };
}

function TaskTable({
	error,
	loading,
	offset,
	tasks,
	onChange,
}: {
	error: string | null;
	loading: boolean;
	offset: number;
	tasks: Task[];
	onChange: () => void;
}) {
	const router = useRouter();
	const { identity } = useLoggedInUser();

	const handleTaskOpen = useCallback(
		async (task: Task) => {
			if (task.kind === "candid") {
				await Promise.all([
					await claimTask(task.taskId),
					await addWatcherToInstance(task.instanceId, identity.id),
				]);
			}

			router.push(getDynamicUrl(`/dashboard/tasks/${task.taskId}`));
		},
		[identity.id, router],
	);

	return (
		<Panel.Root>
			<Table
				slotProps={{
					root: { className: "border-0 rounded-sm" },
				}}
			>
				<TableHeader>
					<TableRow>
						<TableHead className="w-1">عملیات</TableHead>
						<TableHead className="w-12">#</TableHead>
						<TableHead className="w-32">شماره درخواست</TableHead>
						<TableHead className="w-56">نوع درخواست</TableHead>
						<TableHead>عنوان کار</TableHead>
						<TableHead>اطلاعات تکمیلی</TableHead>
						<TableHead className="w-32">نوع کار</TableHead>
						<TableHead className="w-32">اولویت</TableHead>
						<TableHead className="w-40">زمان باقی مانده</TableHead>
						<TableHead className="w-44">زمان ایجاد</TableHead>
						<TableHead className="w-44">آخرین بروزرسانی</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{tasks.length !== 0 || (!loading && !error) ? (
						tasks.length !== 0 ? (
							tasks.map((task, i) => (
								<TableRow
									className={`cursor-pointer font-medium subpixel-antialiased hover:shadow-md ${
										task?.readAt !== null &&
										"font-light text-gray-500 opacity-90 hover:text-black hover:opacity-100"
									}`}
									key={task.id}
									onClick={async () => await handleTaskOpen(task)}
								>
									<TableCell
										className="text-sm"
										onClick={(event) => {
											event.stopPropagation();
										}}
									>
										<TooltipProvider>
											<TableActions>
												<Tooltip>
													<TooltipTrigger asChild>
														<TableAction>
															<Button
																className={cn(
																	"h-4 text-inherit hover:text-blue-500",
																	task.readAt === null &&
																		"animate-ping text-red-600 transition-all duration-1000 ease-in-out hover:text-red-900",
																)}
																variant="link"
																onClick={async () => await handleTaskOpen(task)}
															>
																<FaEye />
															</Button>
														</TableAction>
													</TooltipTrigger>
													<TooltipContent>مشاهده کار</TooltipContent>
												</Tooltip>

												<TaskItemActionMore task={task} onChange={onChange} />
											</TableActions>
										</TooltipProvider>
									</TableCell>
									<TableCell>{offset + i + 1}</TableCell>
									<TableCell>{task.caseNo}</TableCell>
									<TableCell>
										<TaskItemProcess task={task} />
									</TableCell>
									<TableCell>{task.name}</TableCell>
									<TableCell>
										<TaskItemMore
											processKey={task.processKey}
											data={task.data}
										/>
									</TableCell>
									<TableCell>
										{task.kind === TaskKind.Pending ? (
											<span
												className={`rounded-lg px-2 py-0.5 ${
													task?.readAt === null && "bg-amber-300 text-amber-900"
												} inline-block min-w-fit text-xs`}
											>
												در انتظار
											</span>
										) : (
											<span
												className={`rounded-lg px-2 py-0.5 ${
													task?.readAt === null && "bg-red-300 text-red-900"
												} inline-block min-w-fit text-xs`}
											>
												قابل انجام
											</span>
										)}
									</TableCell>
									<TableCell>
										{task?.processKey === "paymentOrder"
											? PaymentPriority?.map(
													(i) => i.value === task?.data?.Priority && i?.label,
												)
											: "عادی"}
									</TableCell>
									<TableCell>
										{task.dueDate ? (
											<DeadlineProgressBar
												className="w-24"
												timeStarted={task.timeStarted}
												deadLine={task.dueDate}
												colors={getDeadlineProgressBarColors}
											/>
										) : (
											"-"
										)}
									</TableCell>
									<TableCell>
										<TaskItemDate date={task.createdAt} />
									</TableCell>
									<TableCell>
										<TaskItemDate date={task.updatedAt} />
									</TableCell>
								</TableRow>
							))
						) : (
							<TableRow key="empty">
								<TableCell></TableCell>
								<TableCell colSpan={100}>هیچ کاری وجود ندارد.</TableCell>
							</TableRow>
						)
					) : loading ? (
						<TableRow key="loading">
							<TableCell></TableCell>
							<TableCell colSpan={100}>
								<Loading size="sm">در حال دریافت اطلاعات...</Loading>
							</TableCell>
						</TableRow>
					) : (
						error && (
							<TableRow key="error">
								<TableCell></TableCell>
								<TableCell colSpan={100}>
									دریافت اطلاعات با خطا روبرو شد.
								</TableCell>
							</TableRow>
						)
					)}
				</TableBody>
			</Table>
		</Panel.Root>
	);
}

export default TaskTable;
