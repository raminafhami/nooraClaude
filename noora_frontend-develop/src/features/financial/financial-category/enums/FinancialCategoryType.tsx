import { SelectItemType } from "@/types/SelectItem";
import { getObjectEntries } from "@/utils/object/getObjectEntries";
import { ObjectType } from "@/utils/object/ObjectType";

enum FinancialCategoryType {
	Income = "income",
	Cost = "cost",
	Petty = "petty",
}

const financialCategoryType: ObjectType<
	FinancialCategoryType,
	{ title: string }
> = {
	[FinancialCategoryType.Income]: { title: "درآمد" },
	[FinancialCategoryType.Cost]: { title: "هزینه" },
	[FinancialCategoryType.Petty]: { title: "مرکز بودجه / هزینه" },
};

const financialCategoryTypeOptions: SelectItemType<FinancialCategoryType>[] =
	getObjectEntries(financialCategoryType).map(([key, { title }]) => ({
		value: key,
		label: title,
	}));

export {
	FinancialCategoryType,
	financialCategoryType,
	financialCategoryTypeOptions,
};
