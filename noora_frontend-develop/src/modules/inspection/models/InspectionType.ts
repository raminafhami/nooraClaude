import { SelectItemType } from "@/types/SelectItem";
import { getObjectEntries } from "@/utils/object/getObjectEntries";
import { ObjectType } from "@/utils/object/ObjectType";

enum InspectionType {
	IC = "ic",
	LC = "lc",
	SC = "sc",
	Bank_COI = "bank-coi",
	COI = "coi",
	Source = "source",
	Sampling = "sampling",
}

type InspectionTypeItem = {
	title: string;
	serviceCode: string;
};

const inspectionType: ObjectType<InspectionType, InspectionTypeItem> = {
	[InspectionType.IC]: {
		title: "بازرسی IC",
		serviceCode: process.env.NEXT_PUBLIC_SEPIDAR_SERVICE_CODE_IC ?? "",
	},
	[InspectionType.LC]: {
		title: "بازرسی LC",
		serviceCode: process.env.NEXT_PUBLIC_SEPIDAR_SERVICE_CODE_IC ?? "",
	},
	[InspectionType.SC]: {
		title: "قرارداد نظارتی",
		serviceCode: process.env.NEXT_PUBLIC_SEPIDAR_SERVICE_CODE_IC ?? "",
	},
	[InspectionType.Bank_COI]: {
		title: "بازرسی COI بانکی",
		serviceCode: process.env.NEXT_PUBLIC_SEPIDAR_SERVICE_CODE_IC ?? "",
	},
	[InspectionType.COI]: {
		title: "بازرسی COI",
		serviceCode: process.env.NEXT_PUBLIC_SEPIDAR_SERVICE_CODE_COI ?? "",
	},
	[InspectionType.Source]: {
		title: "فرایند مبدا",
		serviceCode: process.env.NEXT_PUBLIC_SEPIDAR_SERVICE_CODE_COI ?? "",
	},
	[InspectionType.Sampling]: {
		title: "نمونه برداری",
		serviceCode: process.env.NEXT_PUBLIC_SEPIDAR_SERVICE_CODE_SAMPLING ?? "",
	},
};

const inspectionTypes: SelectItemType<InspectionType>[] = getObjectEntries(
	inspectionType,
).map(([key, { title }]) => ({
	value: key,
	label: title,
}));

export { InspectionType, inspectionType, inspectionTypes };
