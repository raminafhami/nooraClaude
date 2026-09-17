import { SelectItemType } from "@/types/SelectItem";
import { getObjectEntries } from "@/utils/object/getObjectEntries";
import { ObjectType } from "@/utils/object/ObjectType";

enum CostMethod {
	Total = "total",
	Remaining = "remaining",
}

const costMethod: ObjectType<CostMethod> = {
	[CostMethod.Total]: "از کل هزینه",
	[CostMethod.Remaining]: "پس از کسورات",
};

const costMethodOptions: SelectItemType<CostMethod>[] = getObjectEntries(
	costMethod,
).map(([key, title]) => ({ value: key, label: title }));

export { CostMethod, costMethod, costMethodOptions };
