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
			inspectionFeeInRial < 300000000
		) {
			throw new Error("مجموع درآمدها نمی تواند کمتر از 30,000,000 تومان باشد.");
		} else if (
			inspectionMethod === InspectionMethod.Destination &&
			inspectionFeeInRial < 50000000
		) {
			throw new Error("مجموع درآمدها نمی تواند کمتر از 5,000,000 تومان باشد.");
		} else if (
			inspectionMethod === InspectionMethod.TechnicalSpec &&
			inspectionFeeInRial < 50000000
		) {
			throw new Error("مجموع درآمدها نمی تواند کمتر از 5,000,000 تومان باشد.");
		}
		// else if (
		//   inspectionMethod === InspectionMethod.VOC &&
		//   inspectionFeeInRial < 8000000
		// ) {
		//   throw new Error("مجموع درآمدها نمی تواند کمتر از 800,000 تومان باشد.");
		// }
		else if (
			inspectionMethod === InspectionMethod.VOC2 &&
			inspectionFeeInRial < 250000000
		) {
			throw new Error("مجموع درآمدها نمی تواند کمتر از 25,000,000 تومان باشد.");
		}
	}
}

export { validateInspectionFee };
