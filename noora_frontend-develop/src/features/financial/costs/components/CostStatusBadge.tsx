import { ComponentPropsWithoutRef } from "react";

import { Badge } from "@/components/ui/badge";
import { costStatus, CostStatus } from "@/financial/costs/enums/CostStatus";
import { cn } from "@/lib/utils";

function CostStatusBadge({
	className,
	status,
	...props
}: Omit<ComponentPropsWithoutRef<"div">, "children"> & {
	status: CostStatus;
}) {
	if (!status) return;

	return (
		<Badge
			className={cn(
				"",
				status === CostStatus.Unpaid && "bg-gray-100 text-gray-900",
				status === CostStatus.Pending && "bg-yellow-100 text-yellow-900",
				status === CostStatus.Paid && "bg-green-100 text-green-900",
				className,
			)}
			{...props}
		>
			{costStatus[status]}
		</Badge>
	);
}

export { CostStatusBadge };
