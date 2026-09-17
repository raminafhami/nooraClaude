"use client";

import { memo, useMemo } from "react";
import { FaCaretLeft, FaCircleExclamation } from "react-icons/fa6";

import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  instanceCancelReason,
  InstanceCancelReason,
} from "@/felo/instances/enums/InstanceCancelReason";
import {
  InstanceHoldReason,
  instanceHoldReason,
} from "@/felo/instances/enums/InstanceHoldReason";
import { InstanceStatus } from "@/felo/instances/enums/InstanceStatus";
import { Instance } from "@/felo/instances/models/Instance";
import { isInstanceOtherReason } from "@/felo/instances/utils/isInstanceOtherReason";
import { InspectionType } from "@/inspection/models/InspectionType";
import detectInspectionType from "@/inspection/utils/detectInspectionType";
import { cn } from "@/lib/utils";

type MoreItem =
	| { type: "key-value"; key: string; value: string }
	| { type: "component"; component: React.ReactNode }
	| { type: "separator" };

function InstanceItemMore({ instance }: { instance: Instance }) {
	const { processKey, status, parameters: data } = instance;

	const items = useMemo<MoreItem[]>(() => {
		const result: MoreItem[] = [];

		if (status === InstanceStatus.OnHold && instance.holdBy) {
			result.push({
				type: "key-value",
				key: "متوقف کننده",
				value: instance.holdBy.name,
			});

			if (instance.reason && instance.description) {
				result.push({
					type: "component",
					component: (
						<div className="mt-1 flex items-center gap-2">
							<span>
								علت توقف:{" "}
								{
									instanceHoldReason[instance.reason as InstanceHoldReason]
										?.title
								}
							</span>
							{isInstanceOtherReason(instance.reason) && (
								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger>
											<FaCircleExclamation />
										</TooltipTrigger>
										<TooltipContent>{instance.description}</TooltipContent>
									</Tooltip>
								</TooltipProvider>
							)}
						</div>
					),
				});
			}

			result.push({ type: "separator" });
		}

		if (status === InstanceStatus.Canceled && instance.cancelledBy) {
			result.push({
				type: "key-value",
				key: "لغو کننده",
				value: instance.cancelledBy.name,
			});

			if (instance.reason && instance.description) {
				result.push({
					type: "component",
					component: (
						<div className="mt-1 flex gap-1">
							<span>
								علت لغو:{" "}
								{
									instanceCancelReason[instance.reason as InstanceCancelReason]
										?.title
								}
							</span>
							{isInstanceOtherReason(instance.reason) && (
								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger>
											<FaCircleExclamation />
										</TooltipTrigger>
										<TooltipContent>{instance.description}</TooltipContent>
									</Tooltip>
								</TooltipProvider>
							)}
						</div>
					),
				});
			}

			result.push({ type: "separator" });
		}

		if (!data) {
			return result;
		}

		// try parse inspection type
		const inspectionType = detectInspectionType(processKey);

		// assignees
		if (data["Assignees"]) {
			const assignees = data["Assignees"];

			if (inspectionType === InspectionType.COI) {
				if (assignees.technicalExpert) {
					result.push({
						type: "key-value",
						key: "کارشناس فنی",
						value: assignees.technicalExpert.name,
					});
				}

				if (assignees.seniorExpert) {
					result.push({
						type: "key-value",
						key: "کارشناس ارشد",
						value: assignees.seniorExpert.name,
					});
				}

				if (assignees.technicalManager) {
					result.push({
						type: "key-value",
						key: "مدیر فنی",
						value: assignees.technicalManager.name,
					});
				}
			} else {
				if (assignees.technicalExpert) {
					result.push({
						type: "key-value",
						key: "کارشناس",
						value: assignees.technicalExpert.name,
					});
				} else if (assignees.expert) {
					result.push({
						type: "key-value",
						key: "کارشناس",
						value: assignees.expert.name,
					});
				}
			}

			if (assignees.coordinator) {
				result.push({
					type: "key-value",
					key: "هماهنگ کننده",
					value: assignees.coordinator.name,
				});
			}

			if (assignees.customer) {
				result.push({
					type: "key-value",
					key: "مشتری",
					value: assignees.customer.name,
				});
			}
		}

		// general
		if (data["Buyer"] || data["BuyerName"]) {
			result.push({
				type: "key-value",
				key: "خریدار",
				value: data["Buyer"]?.name || data["BuyerName"],
			});
		}

		// PROCESS: COI Inspection
		if (processKey === "Inspection_Case_COI") {
			if (data["CustomName"]) {
				result.push({
					type: "key-value",
					key: "گمرک",
					value: data["CustomName"],
				});
			}
		}

		return result;
	}, [
		processKey,
		status,
		data,
		instance.holdBy,
		instance.cancelledBy,
		instance.reason,
		instance.description,
	]);

	if (!items.length) {
		return "-";
	}

	return (
		<div className="space-y-1">
			{items.map((item, index) => {
				if (
					item.type === "separator" &&
					(index === 0 || index === items.length - 1)
				) {
					return null;
				}

				return (
					<div
						key={index}
						className={cn(
							item.type === "key-value" && "flex items-center gap-1",
						)}
					>
						{item.type === "key-value" && (
							<>
								<span>{item.key}</span>
								<FaCaretLeft className="text-[10px] text-gray-500" />
								<span className="text-gray-500">{item.value}</span>
							</>
						)}

						{item.type === "component" && item.component}

						{item.type === "separator" && (
							<Separator className="my-2 h-0.5 max-w-20" />
						)}
					</div>
				);
			})}
		</div>
	);
}

const MemoizedInstanceItemMore = memo(InstanceItemMore);

export { MemoizedInstanceItemMore as InstanceItemMore };
