import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { PettyCostStatus, pettyCostStatuses } from "../enums/PettyCostStatus";
import { PettyCostApi } from "../models/PettyCost";

const PettyCostStatusBadge = ({
	className,
	cost: { status },
	...props
}: Omit<React.ComponentProps<"div">, "children"> & {
	cost: Pick<PettyCostApi, "status">;
}) => {
	if (!status) return;

	return (
		<Badge
			className={cn(
				status === PettyCostStatus.Unpaid && "bg-gray-100 text-gray-900",
				status === PettyCostStatus.Pending && "bg-yellow-100 text-yellow-900",
				status === PettyCostStatus.Paid && "bg-green-100 text-green-900",
				className,
			)}
			{...props}
		>
			{pettyCostStatuses[status as PettyCostStatus].title}
		</Badge>
	);
};

export { PettyCostStatusBadge };
