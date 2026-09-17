import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { invoiceType, InvoiceType } from "../enums/InvoiceType";

function InvoiceTypeBadge({ type }: { type: InvoiceType }) {
	return (
		<Badge
			className={cn(
				type === InvoiceType.Official && "bg-green-100 text-green-900",
				type === InvoiceType.Unofficial && "bg-blue-100 text-blue-900",
			)}
		>
			{invoiceType[type]?.title}
		</Badge>
	);
}

export { InvoiceTypeBadge };
