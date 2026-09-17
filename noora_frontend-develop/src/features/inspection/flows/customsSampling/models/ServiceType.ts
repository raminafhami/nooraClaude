import { SelectItemType } from "@/types/SelectItem";

type ServiceType = {
	id: string;
	title: string;
	price: number;
};

const serviceTypes: ServiceType[] = [
	{
		id: "68760689cc2a3d96de0bc0a8",
		title: "نمونه برداری (شهریار) (1404)",
		price: 12_743_850,
	},
	{
		id: "64b2f21c9c5d7f5a7d3d2e53",
		title: "نمونه برداری (پیرانشهر) (1403)",
		price: 2_727_273,
	},
	{
		id: "64c8d32d8f3e8d7b9e4c7f81",
		title: "نمونه برداری (ماکو) (1403)",
		price: 4_122_000,
	},
	{
		id: "64c8d32d8f3e8d7b9e4c9a64",
		title: "نمونه برداری (ماکو 2) (1403)",
		price: 2_925_000,
	},
	{
		id: "64a9c12b9b2d7d1f8e8b6a92",
		title: "نمونه برداری (شهریار) (1403)",
		price: 6_835_500,
	},
];

const serviceTypeOptions: SelectItemType[] = serviceTypes.map(
	({ id, title }) => ({ value: id, label: title }),
);

export { serviceTypes, serviceTypeOptions };
export type { ServiceType };
