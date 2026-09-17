import { SelectItemType } from "@/types/SelectItem";
import { getObjectEntries } from "@/utils/object/getObjectEntries";
import { ObjectType } from "@/utils/object/ObjectType";

enum InvoiceType {
	Official = "official",
	Unofficial = "unofficial",
}

const invoiceType: ObjectType<InvoiceType, { title: string }> = {
	[InvoiceType.Official]: { title: "رسمی" },
	[InvoiceType.Unofficial]: { title: "غیر رسمی" },
};

const invoiceTypeOptions: SelectItemType<InvoiceType>[] = getObjectEntries(
	invoiceType,
).map(([key, { title }]) => ({ value: key, label: title }));

export { InvoiceType, invoiceType, invoiceTypeOptions };
