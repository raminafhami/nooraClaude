import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { contractStatus, ContractStatus } from "../enums/ContractStatus";

function ContractStatusBadge({ status }: { status: ContractStatus }) {
	return (
		<Badge
			className={cn(
				status === ContractStatus.Draft && "bg-gray-100 text-gray-900",
				status === ContractStatus.Pending && "bg-yellow-100 text-yellow-900",
				status === ContractStatus.Signed && "bg-green-100 text-green-900",
				status === ContractStatus.Active && "bg-blue-100 text-blue-900",
				status === ContractStatus.Expired && "bg-red-100 text-red-900",
				status === ContractStatus.Canceled && "bg-gray-100 text-gray-900",
			)}
		>
			{contractStatus[status]?.title}
		</Badge>
	);
}

export { ContractStatusBadge };
