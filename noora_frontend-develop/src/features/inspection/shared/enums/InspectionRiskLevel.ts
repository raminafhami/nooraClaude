import { getObjectEntries } from "@/utils/object/getObjectEntries";

enum InspectionRiskLevel {
	Normal = "normal",
	High = "high",
	VeryHigh = "very-high",
}

const inspectionRiskLevels: Record<InspectionRiskLevel, { title: string }> = {
	[InspectionRiskLevel.Normal]: { title: "عادی" },
	[InspectionRiskLevel.High]: { title: "زیاد" },
	[InspectionRiskLevel.VeryHigh]: { title: "خیلی زیاد" },
};

const inspectionRiskLevelOptions = getObjectEntries(inspectionRiskLevels).map(
	([key, { title }]) => ({ value: key, label: title }),
);

export {
	InspectionRiskLevel,
	inspectionRiskLevels,
	inspectionRiskLevelOptions,
};
