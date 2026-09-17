import { SelectItemType } from "@/types/SelectItem";

type ServiceType = {
	id: string;
	title: string;
	price: number;
};

const serviceTypes: ServiceType[] = [
	{
		id: "64a9c12b9b2d7d1f8e8b6a92",
		title: "نمونه برداری",
		price: 6835500,
	},
];

const serviceTypeOptions: SelectItemType[] = serviceTypes.map(
	({ id, title }) => ({ value: id, label: title }),
);

export { serviceTypes, serviceTypeOptions };
export type { ServiceType };
