"use client";

import { useCallback, useState } from "react";
import { FaCheck, FaCircleInfo, FaCirclePause, FaEye } from "react-icons/fa6";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardIcon,
  CardNav,
  CardTitle,
} from "@/components/ui/card";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { DateTime } from "@/components/ui/datetime";
import { DynamicLink } from "@/components/ui/dynamic-link";
import { usePagination } from "@/components/ui/pagination/usePagination";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import {
  InstanceHoldReason,
  instanceHoldReason,
  instanceHoldReasonOptions,
} from "@/felo/instances/enums/InstanceHoldReason";
import { InstanceStatus } from "@/felo/instances/enums/InstanceStatus";
import { Instance } from "@/felo/instances/models/Instance";
import { getInstances } from "@/felo/instances/services/getInstances";
import { isInstanceOtherReason } from "@/felo/instances/utils/isInstanceOtherReason";
import {
  inspectionMethod,
  InspectionMethod,
} from "@/inspection/models/InspectionMethod";
import { getInspectionCaseUrl } from "@/inspection/utils/getInspectionCaseUrl";
import { ObjectType } from "@/utils/object/ObjectType";

import { InstanceTableMoreColumn } from "./InstanceTableMoreColumn";

function HoldInstancesTable() {
	const [reasonFilter, setReasonFilter] = useState<string[]>(
		instanceHoldReasonOptions.map((option) => option.value),
	);

	const queryFn = useCallback(
		async (page: number, pageSize: number) => {
			if (reasonFilter.length === 0) {
				return [[], 0] as [Instance[], number];
			}

			const instances = await getInstances({
				filters: [
					{ name: "status", value: InstanceStatus.OnHold },
					{
						name: "$and",
						value: [
							{
								$or: [
									{ processDefinitionKey: { $regex: `^Inspection_Case` } },
									{ processDefinitionKey: { $regex: `Sampling$` } },
								],
							},
							{
								$or: reasonFilter.map((value) => ({ reason: value })),
							},
						],
					},
				],
				populate: ["holdBy"],
				props: ["InspectionMethod", "Assignees", "Buyer", "BuyerName"],
				page: { no: page, size: pageSize },
			});
			return [instances.items, instances.total] as const;
		},
		[reasonFilter],
	);

	const { items, isLoading, offset, Pagination } = usePagination(
		queryFn,
		undefined,
		5,
	);

	return (
		<div className="col-span-full">
			<Card>
				<CardHeader orientation="horizontal">
					<CardTitle>
						<CardIcon>
							<FaCirclePause />
						</CardIcon>
						متوقف شده ها
					</CardTitle>
					<CardNav>
						<div className="flex items-center gap-2">
							<div>علت توقف:</div>
							<ReasonSelect
								value={reasonFilter}
								onValueChange={setReasonFilter}
							/>
						</div>
					</CardNav>
				</CardHeader>
				<CardContent className="space-y-3 px-0">
					<Table
						loading={isLoading}
						pagination={<Pagination />}
						slotProps={{ root: { className: "border-x-0 rounded-none" } }}
					>
						<TableHeader>
							<TableRow className="whitespace-nowrap">
								<TableHead className="w-1">#</TableHead>
								<TableHead className="w-36">شماره درخواست</TableHead>
								<TableHead className="w-72">نوع درخواست</TableHead>
								<TableHead className="w-52">وضعیت درخواست</TableHead>
								<TableHead className="w-52">متوقف کننده</TableHead>
								<TableHead className="w-48">علت توقف</TableHead>
								<TableHead>اطلاعات تکمیلی</TableHead>
								<TableHead className="w-36">زمان شروع</TableHead>
								<TableHead className="w-36">آخرین بروزرسانی</TableHead>
								<TableHead className="w-1">عملیات</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{items.length !== 0 ? (
								items?.map((instance, index) => (
									<TableRow
										key={instance.id}
										className="cursor-pointer whitespace-nowrap"
									>
										<TableCell>{offset + index + 1}</TableCell>
										<TableCell>{instance.caseNo}</TableCell>
										<TableCell>
											<RequestProcess
												processName={instance.processName}
												data={instance.parameters}
											/>
										</TableCell>
										<TableCell>{instance.phase?.title ?? "-"}</TableCell>
										<TableCell>{instance.holdBy?.name || "نامشخص"}</TableCell>
										<TableCell>
											<div className="flex items-center gap-2">
												<span>
													{
														instanceHoldReason[
															instance.reason as InstanceHoldReason
														]?.title
													}
												</span>
												{isInstanceOtherReason(instance.reason) &&
													instance.description && (
														<TooltipProvider>
															<Tooltip>
																<TooltipTrigger asChild>
																	<div className="text-muted-foreground">
																		<FaCircleInfo size={16} />
																	</div>
																</TooltipTrigger>
																<TooltipContent>
																	{instance.description}
																</TooltipContent>
															</Tooltip>
														</TooltipProvider>
													)}
											</div>
										</TableCell>
										<TableCell>
											<InstanceTableMoreColumn instance={instance} />
										</TableCell>
										<TableCell>
											<DateTime date={instance.createAt} />
										</TableCell>
										<TableCell>
											<DateTime date={instance.updateAt} />
										</TableCell>
										<TableCell>
											<TooltipProvider>
												<TableActions>
													<Tooltip>
														<TooltipTrigger asChild>
															<DynamicLink
																className="h-full"
																href={getInspectionCaseUrl(instance)}
															>
																<TableAction className="hover:text-blue-500">
																	<FaEye />
																</TableAction>
															</DynamicLink>
														</TooltipTrigger>
														<TooltipContent>مشاهده درخواست</TooltipContent>
													</Tooltip>
												</TableActions>
											</TooltipProvider>
										</TableCell>
									</TableRow>
								))
							) : (
								<TableRow>
									<TableCell colSpan={100}>هیچ موردی یافت نشد.</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	);
}

function ReasonSelect({
	value,
	onValueChange,
}: {
	value: string[];
	onValueChange: (value: string[]) => void;
}) {
	const toggleValue = (e: string) => {
		if (value.includes(e)) {
			onValueChange(value.filter((x) => x !== e));
		} else {
			onValueChange([...value, e]);
		}
	};

	let options = instanceHoldReasonOptions;

	const allSelected = value.length === options.length;

	const handleSelectAll = () => {
		if (allSelected) {
			onValueChange([]);
		} else {
			onValueChange(options.map((option) => option.value));
		}
	};

	const label = allSelected
		? "همه علت ها"
		: value.length > 0
			? options
					.filter((option) => value.includes(option.value))
					.map((option) => option.label)
					.join("، ")
			: undefined;

	const displayValue = label ?? "انتخاب کنید";
	const tooltipContent = label ?? "هیچ موردی انتخاب نشده";

	return (
		<Popover>
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger asChild>
						<PopoverTrigger asChild>
							<Button
								variant="outline"
								className="w-full max-w-44 text-start xs:min-w-44"
							>
								<span className="w-full overflow-hidden text-ellipsis">
									{displayValue}
								</span>
							</Button>
						</PopoverTrigger>
					</TooltipTrigger>
					<TooltipContent>{tooltipContent}</TooltipContent>
				</Tooltip>
			</TooltipProvider>

			<PopoverContent className="p-0">
				<Command>
					<CommandList>
						<CommandGroup>
							<CommandItem
								onSelect={handleSelectAll}
								className="justify-center bg-gray-100"
							>
								{allSelected ? "حذف همه" : "انتخاب همه"}
							</CommandItem>

							{options.map((option) => (
								<CommandItem
									key={option.value}
									onSelect={() => toggleValue(option.value)}
								>
									<div className="w-4">
										{value.includes(option.value) && <FaCheck />}
									</div>
									<div>{option.label}</div>
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}

function RequestProcess({
	processName,
	data,
}: {
	processName: string;
	data: ObjectType;
}) {
	const method =
		data["InspectionMethod"] &&
		inspectionMethod[data["InspectionMethod"] as InspectionMethod];
	return (
		<div className="flex gap-3">
			<div className="flex items-center gap-1">
				<span>{processName}</span>
				{method && <span className="text-xs text-gray-500">({method})</span>}
			</div>
		</div>
	);
}

export { HoldInstancesTable };
