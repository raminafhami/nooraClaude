import { SelectItemType } from "@/types/SelectItem";
import { getObjectEntries } from "@/utils/object/getObjectEntries";
import { ObjectType } from "@/utils/object/ObjectType";

enum Currency {
	Rial = "rial",
	Dollar = "dollar",
	Euro = "euro",
	Yuan = "yuan",
}

const currency: ObjectType<Currency, { title: string; code?: string }> = {
	[Currency.Rial]: { title: "ریال" },
	[Currency.Dollar]: {
		title: "دلار",
		// code: "137203",
		code: "137235",
	},
	[Currency.Euro]: {
		title: "یورو",
		// code: "137204",
		code: "137241",
	},
	[Currency.Yuan]: {
		title: "یوان",
		// code: "137221",
		// code: "816445",
	},
};

const currencyOptions: SelectItemType[] = getObjectEntries(currency).map(
	([key, { title }]) => ({ value: key, label: title }),
);

export { Currency, currency, currencyOptions };
