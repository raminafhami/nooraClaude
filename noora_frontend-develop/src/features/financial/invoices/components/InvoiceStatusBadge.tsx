import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { invoiceStatus, InvoiceStatus } from "../enums/InvoiceStatus";

function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
	return (
		<Badge
			className={cn(
				status === InvoiceStatus.Active && "bg-gray-100 text-gray-900",
				status === InvoiceStatus.Pending && "bg-yellow-100 text-yellow-900",
				status === InvoiceStatus.Issued && "bg-blue-100 text-blue-900",
				status === InvoiceStatus.PartiallyPaid && "bg-green-100 text-green-900",
				status === InvoiceStatus.Paid && "bg-green-100 text-green-900",
				status === InvoiceStatus.Cancelled && "bg-red-100 text-red-900",
				status === InvoiceStatus.Expired && "bg-red-100 text-red-900",
			)}
		>
			{invoiceStatus[status]?.title}
		</Badge>
	);
}

export { InvoiceStatusBadge };
