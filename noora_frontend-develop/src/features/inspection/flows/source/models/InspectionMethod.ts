import { SelectItemType } from "@/types/SelectItem";
import { getObjectEntries } from "@/utils/object/getObjectEntries";
import { ObjectType } from "@/utils/object/ObjectType";

enum InspectionMethod {
	Source = "source",
	Destination = "destination",
}

const inspectionMethod: ObjectType<InspectionMethod, ObjectType<"title">> = {
	[InspectionMethod.Source]: { title: "مبدا" },
	[InspectionMethod.Destination]: { title: "مقصد" },
};

const inspectionMethodOptions: SelectItemType<InspectionMethod>[] =
	getObjectEntries(inspectionMethod).map(([key, { title }]) => ({
		value: key,
		label: title,
	}));

export { InspectionMethod, inspectionMethod, inspectionMethodOptions };
