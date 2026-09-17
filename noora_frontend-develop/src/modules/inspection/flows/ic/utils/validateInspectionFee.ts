import { CaseType } from "@/inspection/models/CaseType";

import { InspectionMethod } from "../models/InspectionMethod";

function validateInspectionFee({
	inspectionFeeInRial,
	inspectionMethod,
	caseType,
}: {
	inspectionFeeInRial: number;
	inspectionMethod: InspectionMethod;
	caseType: CaseType;
}): void {
	if (inspectionFeeInRial) {
		if (
			inspectionMethod === InspectionMethod.Source &&
			caseType === CaseType.Official &&
			inspectionFeeInRial < 10000000
		) {
			throw new Error("مجموع درآمدها نمی تواند کمتر از 1,000,000 تومان باشد.");
		} else if (
			inspectionMethod === InspectionMethod.Source &&
			caseType === CaseType.Unofficial &&
			inspectionFeeInRial < 10000000
		) {
			throw new Error("مجموع درآمدها نمی تواند کمتر از 1,000,000 تومان باشد.");
		} else if (
			inspectionMethod === InspectionMethod.Destination &&
			caseType === CaseType.Official &&
			inspectionFeeInRial < 8000000
		) {
			throw new Error("مجموع درآمدها نمی تواند کمتر از 800,000 تومان باشد.");
		} else if (
			inspectionMethod === InspectionMethod.Destination &&
			caseType === CaseType.Unofficial &&
			inspectionFeeInRial < 8000000
		) {
			throw new Error("مجموع درآمدها نمی تواند کمتر از 800,000 تومان باشد.");
		}
	}
}

export { validateInspectionFee };
