import { HTMLAttributes } from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { instanceStatus, InstanceStatus } from "../enums/InstanceStatus";
import { Instance } from "../models/Instance";

function InstanceStatusBadge({
	className,
	instance: { status },
	...props
}: Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
	instance: Pick<Instance, "status">;
}) {
	if (!status) return;

	return (
		<Badge
			className={cn(
				status === InstanceStatus.Active && "bg-blue-100 text-blue-900",
				status === InstanceStatus.Completed && "bg-green-100 text-green-900",
				status === InstanceStatus.OnHold && "bg-orange-100 text-orange-900",
				status === InstanceStatus.Canceled && "bg-red-100 text-red-900",
				className,
			)}
			{...props}
		>
			{instanceStatus[status]}
		</Badge>
	);
}

export { InstanceStatusBadge };
