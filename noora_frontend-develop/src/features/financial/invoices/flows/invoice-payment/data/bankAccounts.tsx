import { SelectItemType } from "@/types/SelectItem";

import { LedgerAccount } from "../models/LedgerAccount";

const bankAccounts: LedgerAccount[] = [
	{
		title: "سپه / نورا (171800185402)",
		description: (
			<span className="rtl:text-right" dir="ltr">
				5892 1070 4402 2476
			</span>
		),
		slCode: "111005",
		dlCode: "001",
	},
	{
		title: "ملی / فریما فرخ مهر",
		slCode: "111005",
		dlCode: "002",
		visible: false,
	},
	{
		title: "ملی / هومن علایی (0226892601006)",
		description: (
			<span className="rtl:text-right" dir="ltr">
				6037 9971 7092 9177
			</span>
		),
		slCode: "111005",
		dlCode: "003",
	},
	{
		title: "سپه / کارت خوان",
		description: "شهریار",
		slCode: "111005",
		dlCode: "004",
	},
	{
		title: "تجارت / نورا (2904059288)",
		description: (
			<span className="rtl:text-right" dir="ltr">
				5859 8370 0911 9658
			</span>
		),
		slCode: "111005",
		dlCode: "007",
	},
	{
		title: "تجارت / نورا (2904357033)",
		slCode: "111005",
		dlCode: "008",
	},
	{
		title: "پاسارگاد / هومن علائی (216/8000/14020257/1)",
		description: (
			<span className="rtl:text-right" dir="ltr">
				5022 2913 1000 3338
			</span>
		),
		slCode: "111005",
		dlCode: "009",
	},
	{
		title: "پاسارگاد / کیارش شبدیز (320800514951)",
		description: (
			<span className="rtl:text-right" dir="ltr">
				5022 2910 9334 5203
			</span>
		),
		slCode: "111005",
		dlCode: "016",
	},
	{
		title: "توسعه تعاون / نورا (313.311.7117546.1)",
		description: (
			<span className="rtl:text-right" dir="ltr">
				5029 0870 0163 9031
			</span>
		),
		slCode: "111005",
		dlCode: "017",
	},
	{
		title: "تجارت / کارت خوان",
		description: "همدان - بوشهر - بندرعباس - آذربایجان غربی",
		slCode: "111005",
		dlCode: "019",
	},
	{
		title: "درگاه پرداخت",
		slCode: "111005",
		dlCode: "020",
		visible: false,
	},
];

const bankAccountOptions: SelectItemType[] = bankAccounts.flatMap((account) => [
	{
		value: `${account.slCode}::${account.dlCode}`,
		label: account.title,
		description: account.description,
		visible: account.visible ?? true,
	},
	{
		value: account.dlCode,
		label: account.title,
		description: account.description,
		visible: false,
	},
]);

export { bankAccounts, bankAccountOptions };
