"use client";

import { useRouter } from "next/navigation";
import { FaAngleLeft, FaEye } from "react-icons/fa6";

import { Button } from "@/components/ui/button";
import { DateTime } from "@/components/ui/datetime";
import { DeadlineProgressBar } from "@/components/ui/deadline-progressbar";
import { DynamicLink } from "@/components/ui/dynamic-link";
import { Numeric } from "@/components/ui/numeric";
import {
	TableAction,
	TableActions,
	TableCell,
	TableRow,
} from "@/components/ui/table";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { InstanceStatusBadge } from "@/felo/instances/components/InstanceStatusBadge";
import { Instance } from "@/felo/instances/models/Instance";
import { InspectionPaymentStatusBadge } from "@/inspection/components/InspectionPaymentStatusBadge";
import {
	InspectionMethod,
	inspectionMethod,
} from "@/inspection/models/InspectionMethod";
import { getInspectionCaseUrl } from "@/inspection/utils/getInspectionCaseUrl";
import { cn } from "@/lib/utils";
import { getDynamicUrl } from "@/utils/url/getDynamicUrl";

import { InstanceItemMore } from "./InstanceItemMore";
import { InstanceItemTask, InstanceItemType } from "./InstanceList.types";

function InstanceItem({
	item,
	index,
	offset,
}: {
	item: InstanceItemType;
	index: number;
	offset: number;
}) {
	const router = useRouter();

	function handleCaseRedirect(instance: Pick<Instance, "id" | "processKey">) {
		const url = getInspectionCaseUrl(instance);
		router.push(getDynamicUrl(url));
	}

	return (
		<TableRow className="whitespace-nowrap">
			<TableCell className="!p-0">
				<ItemLink className="!ps-6" instance={item.instance}>
					<Numeric value={offset + index + 1} />
				</ItemLink>
			</TableCell>
			<TableCell className="p-0">
				<ItemLink instance={item.instance}>
					<Numeric value={item.instance.caseNo} />
				</ItemLink>
			</TableCell>
			<TableCell className="p-0">
				<ItemLink instance={item.instance}>
					<ItemProcess instance={item.instance} />
				</ItemLink>
			</TableCell>
			<TableCell className="p-0">
				<ItemLink instance={item.instance}>
					<InstanceStatusBadge instance={item.instance} />
				</ItemLink>
			</TableCell>
			<TableCell className="p-0">
				<ItemLink instance={item.instance}>
					<ItemTasks tasks={item.tasks} />
				</ItemLink>
			</TableCell>
			<TableCell className="p-0">
				<ItemLink instance={item.instance}>
					<InspectionPaymentStatusBadge
						status={item.instance.parameters?.["InvoicePaymentStatus"]}
					/>
				</ItemLink>
			</TableCell>
			<TableCell className="p-0">
				<ItemLink instance={item.instance}>
					<Numeric value={item.instance.contractNo} placeholder="-" />
				</ItemLink>
			</TableCell>
			<TableCell className="p-0">
				<ItemLink instance={item.instance}>
					<InstanceItemMore instance={item.instance} />
				</ItemLink>
			</TableCell>
			<TableCell className="p-0">
				<ItemLink className="px-1" instance={item.instance}>
					{item.instance.timeActivated && item.instance.maxPossibleDuration ? (
						<DeadlineProgressBar
							className="w-24"
							timeStarted={item.instance.timeActivated}
							deadLine={item.instance.maxPossibleDuration}
							colors={getDeadlineProgressBarColors}
						/>
					) : (
						"-"
					)}
				</ItemLink>
			</TableCell>
			<TableCell className="p-0">
				<ItemLink instance={item.instance}>
					<DateTime date={item.instance.createAt} />
				</ItemLink>
			</TableCell>
			<TableCell className="p-0">
				<ItemLink instance={item.instance}>
					<DateTime date={item.instance.updateAt} />
				</ItemLink>
			</TableCell>
			<TableCell>
				<TooltipProvider>
					<TableActions>
						<TableAction>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										className="focus-within:text-blue-600 hover:text-blue-600 active:text-blue-600"
										size="icon"
										variant="link"
										onClick={() => {
											handleCaseRedirect(item.instance);
										}}
									>
										<FaEye />
									</Button>
								</TooltipTrigger>
								<TooltipContent>مشاهده درخواست</TooltipContent>
							</Tooltip>
						</TableAction>
					</TableActions>
				</TooltipProvider>
			</TableCell>
		</TableRow>
	);
}

function ItemLink({
	children,
	className,
	instance,
}: React.PropsWithChildren<{
	className?: string;
	instance: Instance;
}>) {
	return (
		<DynamicLink
			className={cn("block px-4 py-3", className)}
			href={getInspectionCaseUrl(instance)}
		>
			{children}
		</DynamicLink>
	);
}

function ItemProcess({ instance }: { instance: Instance }) {
	const { processName, parameters } = instance;

	const method =
		parameters["InspectionMethod"] &&
		inspectionMethod[parameters["InspectionMethod"] as InspectionMethod];

	return (
		<div className="flex gap-x-3">
			<div className="flex items-center gap-1">
				<span>{processName}</span>
				{method && (
					<span className="text-xs text-muted-foreground">({method})</span>
				)}
			</div>
		</div>
	);
}

function ItemTasks({ tasks }: { tasks: InstanceItemTask[] }) {
	if (!tasks.length) {
		return "-";
	}

	return (
		<div className="space-y-1">
			{tasks.map(({ task, assigneeName, userNames, groupNames }) => (
				<div key={task.id} className="flex items-center gap-1">
					<span>{task.name}</span>
					<FaAngleLeft className="text-[10px] text-gray-500" />
					<span className="text-gray-500">
						{assigneeName || [...userNames, ...groupNames].join("، ") || "؟"}
					</span>
				</div>
			))}
		</div>
	);
}

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

export { InstanceItem };
