import { getObjectEntries } from "@/utils/object/getObjectEntries";
import { pick } from "@/utils/pick";

enum InspectionMethod {
	Source = "source",
	Destination = "destination",
	DocumentInspection = "document-inspection",
	TechnicalSpec = "technical-spec",
	VOC = "voc",
	VOC2 = "voc2",
}

const inspectionMethods: Record<InspectionMethod, { title: string }> = {
	[InspectionMethod.Source]: { title: "مبدأ" },
	[InspectionMethod.Destination]: { title: "مقصد" },
	[InspectionMethod.DocumentInspection]: { title: "بازرسی اسنادی" },
	[InspectionMethod.TechnicalSpec]: { title: "مشخصات فنی" },
	[InspectionMethod.VOC]: { title: "VOC" },
	[InspectionMethod.VOC2]: { title: "VOC2" },
};

const inspectionMethodsByProcessDefinitionKey = {
	["Inspection_Case_IC"]: pick(inspectionMethods, [
		InspectionMethod.Source,
		InspectionMethod.Destination,
	]),

	["Inspection_Case_COI"]: pick(inspectionMethods, [
		InspectionMethod.Source,
		InspectionMethod.Destination,
		InspectionMethod.DocumentInspection,
		InspectionMethod.TechnicalSpec,
		InspectionMethod.VOC,
		InspectionMethod.VOC2,
	]),

	["Inspection_Case_Source"]: pick(inspectionMethods, [
		InspectionMethod.Source,
		InspectionMethod.Destination,
	]),
} as const;

const getInspectionMethodOptions = (processDefinitionKey?: string) =>
	getObjectEntries(
		processDefinitionKey
			? (inspectionMethodsByProcessDefinitionKey[
					processDefinitionKey as keyof typeof inspectionMethodsByProcessDefinitionKey
				] ?? {})
			: inspectionMethods,
	).map(([key, { title }]) => ({
		value: key,
		label: title,
	}));

export { InspectionMethod, inspectionMethods, getInspectionMethodOptions };
