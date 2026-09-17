import { CaseType } from "@/inspection/models/CaseType";

function validateInspectionFee({
	inspectionFeeInRial,
	caseType,
}: {
	inspectionFeeInRial: number;
	caseType: CaseType;
}): void {
	if (inspectionFeeInRial) {
		if (caseType === CaseType.Official && inspectionFeeInRial < 30000000) {
			throw new Error("مجموع درآمدها نمی تواند کمتر از 3,000,000 تومان باشد.");
		}
	}
}

export { validateInspectionFee };
