import { SelectItem } from "@/entities";

enum DocumentTypesProps {
	FactoryGate = "factoryGate",
	AppearenceAndPacking = "appearanceAndPacking",
	MarkingLable = "markingLable",
	Seals = "seals",
	Sampling = "sampling",
	Testing = "testing",
	Loading = "loading",
	Other = "other",
}

const DocumentTypes: SelectItem<DocumentTypesProps>[] = [
	{
		label: "تابلو محل بازرسی/سلفی بازرس",
		value: DocumentTypesProps.FactoryGate,
	},
	{
		label: "ظاهر و بسته بندی",
		value: DocumentTypesProps.AppearenceAndPacking,
	},
	{
		label: "نشانه گذاری",
		value: DocumentTypesProps.MarkingLable,
	},
	{
		label: "پلمپ‌ها",
		value: DocumentTypesProps.Seals,
	},
	{
		label: "عملیات نمونه برداری",
		value: DocumentTypesProps.Sampling,
	},
	{
		label: "آزمون‌ها",
		value: DocumentTypesProps.Testing,
	},
	{
		label: "بارگیری",
		value: DocumentTypesProps.Loading,
	},
	{
		label: "سایر",
		value: DocumentTypesProps.Other,
	},
];

export { DocumentTypesProps, DocumentTypes };
