import { getObjectEntries } from "@/utils/object/getObjectEntries";

enum ProformaValueCurrency {
	Ruble = "ruble",
	Rupee = "rupee",
	Yuan = "yuan",
	Dirham = "dirham",
	Lira = "lira",
	Dinar = "dinar",
	Dollar = "dollar",
	Euro = "euro",
}

const proformaValueCurrencies: Record<
	ProformaValueCurrency,
	{ title: string; rate: string }
> = {
	[ProformaValueCurrency.Ruble]: {
		title: "روبل",
		rate: "0.0114",
	},
	[ProformaValueCurrency.Rupee]: {
		title: "روپیه",
		rate: "0.0103",
	},
	[ProformaValueCurrency.Yuan]: {
		title: "یوان",
		rate: "0.1224",
	},
	[ProformaValueCurrency.Dirham]: {
		title: "درهم",
		rate: "0.221",
	},
	[ProformaValueCurrency.Lira]: {
		title: "لیر",
		rate: "0.0225",
	},
	[ProformaValueCurrency.Dinar]: {
		title: "دینار",
		rate: "2.871",
	},
	[ProformaValueCurrency.Dollar]: {
		title: "دلار",
		rate: "0.8812",
	},
	[ProformaValueCurrency.Euro]: {
		title: "یورو",
		rate: "1",
	},
};

const proformaValueCurrencyOptions = getObjectEntries(
	proformaValueCurrencies,
).map(([key, { title }]) => ({ value: key, label: title }));

export {
	ProformaValueCurrency,
	proformaValueCurrencies,
	proformaValueCurrencyOptions,
};
