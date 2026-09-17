import { SelectItemType } from "@/types/SelectItem";
import { getObjectEntries } from "@/utils/object/getObjectEntries";
import { ObjectType } from "@/utils/object/ObjectType";

enum ProcessType {
	Voc2 = "voc2",
	ProformaPriceConfirmation = "proforma-price-confirmation",
	SellerAudit = "seller-audit",
	FactoryAudit = "factory-audit",
}

const processType: ObjectType<ProcessType, ObjectType<"title">> = {
	[ProcessType.Voc2]: { title: "VOC2" },
	[ProcessType.ProformaPriceConfirmation]: { title: "تایید قیمت پروفرما" },
	[ProcessType.SellerAudit]: { title: "تایید اصالت فروشنده (Seller Audit)" },
	[ProcessType.FactoryAudit]: { title: "Factory Audit" },
};

const processTypeOptions: SelectItemType<ProcessType>[] = getObjectEntries(
	processType,
).map(([key, { title }]) => ({ value: key, label: title }));

export { ProcessType, processType, processTypeOptions };
