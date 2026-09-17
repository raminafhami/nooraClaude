import { ComponentPropsWithoutRef } from "react";

import { Badge } from "@/components/ui/badge";
import {
	incomeStatus,
	IncomeStatus,
} from "@/financial/incomes/enums/IncomeStatus";
import { cn } from "@/lib/utils";

function IncomeStatusBadge({
	className,
	status,
	...props
}: Omit<ComponentPropsWithoutRef<"div">, "children"> & {
	status: IncomeStatus;
}) {
	if (!status) return;

	return (
		<Badge
			className={cn(
				"",
				status === IncomeStatus.Unpaid && "bg-gray-100 text-gray-900",
				status === IncomeStatus.Pending && "bg-yellow-100 text-yellow-900",
				status === IncomeStatus.PartiallyPaid && "bg-blue-100 text-blue-900",
				status === IncomeStatus.Paid && "bg-green-100 text-green-900",
				status === IncomeStatus.Cancelled && "bg-red-100 text-red-900",
				className,
			)}
			{...props}
		>
			{incomeStatus[status]?.title}
		</Badge>
	);
}

export { IncomeStatusBadge };
