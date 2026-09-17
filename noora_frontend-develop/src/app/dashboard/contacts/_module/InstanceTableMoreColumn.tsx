"use client";

import { memo, useMemo } from "react";
import { FaCaretLeft } from "react-icons/fa6";

import { Separator } from "@/components/ui/separator";
import { Instance } from "@/felo/instances/models/Instance";
import { cn } from "@/lib/utils";

type MoreItem =
	| { type: "key-value"; key: string; value: string }
	| { type: "component"; component: React.ReactNode }
	| { type: "separator" };

function InstanceTableMoreColumn({ instance }: { instance: Instance }) {
	const { processKey, status, parameters: data } = instance;

	const items = useMemo<MoreItem[]>(() => {
		const result: MoreItem[] = [];

		if (!data) {
			return result;
		}

		// assignees
		if (data["Assignees"]) {
			const assignees = data["Assignees"];

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

		if (data["Buyer"] || data["BuyerName"]) {
			result.push({
				type: "key-value",
				key: "خریدار",
				value: data["Buyer"]?.name || data["BuyerName"],
			});
		}

		return result;
	}, [data]);

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

const MemoizedInstanceTableMoreColumn = memo(InstanceTableMoreColumn);

export { MemoizedInstanceTableMoreColumn as InstanceTableMoreColumn };
