import { SelectItemType } from "@/types/SelectItem";

import { LedgerAccount } from "../models/LedgerAccount";

const foreignAccounts: LedgerAccount[] = [
	{
		title: "دفتر چین (اندی)",
		slCode: "21112",
		dlCode: "80002",
	},
	{
		title: "دفتر هند",
		slCode: "21112",
		dlCode: "11750",
	},
	{
		title: "دفتر دبی",
		slCode: "21112",
		dlCode: "13399",
	},
];

const foreignAccountOptions: SelectItemType[] = foreignAccounts.map(
	(account) => ({
		value: `${account.slCode}::${account.dlCode}`,
		label: account.title,
		visible: account.visible ?? true,
	}),
);

export { foreignAccounts, foreignAccountOptions };
