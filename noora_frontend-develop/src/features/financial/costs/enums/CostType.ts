import { SelectItemType } from "@/types/SelectItem";
import { getObjectEntries } from "@/utils/object/getObjectEntries";
import { ObjectType } from "@/utils/object/ObjectType";

enum CostType {
	Fixed = "fixed",
	Percentage = "percentage",
}

const costType: ObjectType<CostType> = {
	[CostType.Fixed]: "ثابت",
	[CostType.Percentage]: "درصدی",
};

const costTypeOptions: SelectItemType<CostType>[] = getObjectEntries(
	costType,
).map(([key, title]) => ({ value: key, label: title }));

export { CostType, costType, costTypeOptions };
