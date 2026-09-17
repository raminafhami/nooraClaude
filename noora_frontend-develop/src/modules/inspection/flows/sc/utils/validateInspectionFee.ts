import { CaseType } from "@/inspection/models/CaseType";

function validateInspectionFee({
	inspectionFeeInRial,
	caseType,
}: {
	inspectionFeeInRial: number;
	caseType: CaseType;
}): void {
	if (inspectionFeeInRial) {
		if (inspectionFeeInRial < 40000000) {
			throw new Error("مجموع درآمدها نمی تواند کمتر از 4,000,000 تومان باشد.");
		}
	}
}

export { validateInspectionFee };
