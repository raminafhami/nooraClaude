import { SelectItemType } from "@/types/SelectItem";
import { getObjectEntries } from "@/utils/object/getObjectEntries";
import { ObjectType } from "@/utils/object/ObjectType";

enum CostPeriod {
	Any = "any",
	AfterReceive = "after",
}

const costPeriod: ObjectType<CostPeriod> = {
	[CostPeriod.Any]: "هر زمان",
	[CostPeriod.AfterReceive]: "پس از وصول",
};

const costPeriodOptions: SelectItemType<CostPeriod>[] = getObjectEntries(
	costPeriod,
).map(([key, title]) => ({ value: key, label: title }));

export { CostPeriod, costPeriod, costPeriodOptions };
