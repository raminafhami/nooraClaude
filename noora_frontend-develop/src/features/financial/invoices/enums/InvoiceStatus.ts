import { SelectItemType } from "@/types/SelectItem";
import { getObjectEntries } from "@/utils/object/getObjectEntries";
import { ObjectType } from "@/utils/object/ObjectType";

enum InvoiceStatus {
	Active = "active",
	Pending = "pending",
	Issued = "issued",
	PartiallyPaid = "partially",
	Paid = "paid",
	Cancelled = "canceled",
	Expired = "expired",
}

const invoiceStatus: ObjectType<InvoiceStatus, { title: string }> = {
	[InvoiceStatus.Active]: { title: "صدور پیش فاکتور" },
	[InvoiceStatus.Pending]: { title: "در انتظار بررسی" },
	[InvoiceStatus.Issued]: { title: "صدور فاکتور" },
	[InvoiceStatus.PartiallyPaid]: { title: "پرداخت ناقص" },
	[InvoiceStatus.Paid]: { title: "پرداخت شده" },
	[InvoiceStatus.Cancelled]: { title: "لغو شده" },
	[InvoiceStatus.Expired]: { title: "منقضی شده" },
};

const invoiceStatusOptions: SelectItemType<InvoiceStatus>[] = getObjectEntries(
	invoiceStatus,
).map(([key, { title }]) => ({ value: key, label: title }));

export { InvoiceStatus, invoiceStatus, invoiceStatusOptions };
