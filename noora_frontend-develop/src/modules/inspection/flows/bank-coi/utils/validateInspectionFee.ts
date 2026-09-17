import { CaseType } from "@/inspection/models/CaseType";

function validateInspectionFee({
	inspectionFeeInRial,
	caseType,
}: {
	inspectionFeeInRial: number;
	caseType: CaseType;
}): void {
	if (inspectionFeeInRial) {
		if (inspectionFeeInRial < 50000000) {
			throw new Error("مجموع درآمدها نمی تواند کمتر از 5,000,000 تومان باشد.");
		}
	}
}

export { validateInspectionFee };
