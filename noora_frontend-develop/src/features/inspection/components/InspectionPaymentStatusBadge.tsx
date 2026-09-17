import { Badge } from "@/components/ui/badge";
import {
	invoicePaymentStatus,
	InvoicePaymentStatus,
} from "@/inspection/models/InvoicePaymentStatus";
import { cn } from "@/lib/utils";

function InspectionPaymentStatusBadge({
	status,
}: {
	status: InvoicePaymentStatus | undefined;
}) {
	return (
		<Badge
			className={cn(
				"bg-red-100 text-red-900",
				status === InvoicePaymentStatus.Paid && "bg-green-100 text-green-900",
				status === InvoicePaymentStatus.PartiallyPaid &&
					"bg-orange-100 text-orange-900",
				status === InvoicePaymentStatus.Pending &&
					"bg-yellow-100 text-yellow-900",
			)}
		>
			{invoicePaymentStatus[status ?? InvoicePaymentStatus.Unpaid]}
		</Badge>
	);
}

export { InspectionPaymentStatusBadge };
