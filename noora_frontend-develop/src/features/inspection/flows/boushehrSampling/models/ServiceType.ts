import { SelectItemType } from "@/types/SelectItem";

type ServiceType = {
	id: string;
	title: string;
	price: number | Record<number, number>;
};

const serviceTypes: ServiceType[] = [
	{
		id: "687616cc8e76a50ebb08f012",
		title: "بازرسی بدون نمونه برداری (1404)",
		price: 12_727_273,
	},
	{
		id: "687618118e76a50ebb08f015",
		title: "بازرسی + نمونه برداری (1404)",
		price: {
			1: 13_636_364,
			2: 14_545_455,
			3: 15_454_545,
			4: 17_272_727,
			5: 19_090_909,
			6: 20_909_091,
			7: 22_727_273,
			8: 24_545_455,
			9: 26_363_636,
			10: 28_181_818,
			11: 30_000_000,
			12: 31_818_182,
		},
	},
];

const serviceTypeOptions: SelectItemType[] = serviceTypes.map(
	({ id, title }) => ({ value: id, label: title }),
);

export { serviceTypes, serviceTypeOptions };
export type { ServiceType };
