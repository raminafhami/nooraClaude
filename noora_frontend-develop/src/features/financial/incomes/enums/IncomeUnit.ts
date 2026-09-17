import { SelectItemType } from "@/types/SelectItem";
import { getObjectEntries } from "@/utils/object/getObjectEntries";
import { ObjectType } from "@/utils/object/ObjectType";

enum IncomeUnit {
	Pieces = "pcs",
}

const incomeUnit: ObjectType<IncomeUnit, { title: string }> = {
	[IncomeUnit.Pieces]: { title: "مورد" },
};

const incomeUnitOptions: SelectItemType<IncomeUnit>[] = getObjectEntries(
	incomeUnit,
).map(([key, { title }]) => ({ value: key, label: title }));

export { IncomeUnit, incomeUnit, incomeUnitOptions };
