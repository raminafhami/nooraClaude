import {
  InspectionType,
  inspectionType as inspectionTypeType,
} from "../models/InspectionType";

export default function detectInspectionType(
  processKey: string
): InspectionType | undefined {
  let inspectionType: InspectionType | undefined;
  if (processKey.startsWith("Inspection_Case_")) {
    const extractedType = processKey
      .replace("Inspection_Case_", "")
      .replaceAll("_", "-")
      .toLowerCase();

    if (extractedType in inspectionTypeType) {
      inspectionType = extractedType as InspectionType;
    }
  } else if (processKey.endsWith("Sampling")) {
    inspectionType = InspectionType.Sampling;
  }

  return inspectionType;
}
