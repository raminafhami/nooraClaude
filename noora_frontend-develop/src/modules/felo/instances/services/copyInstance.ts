import apiClient from "@/api/client";
import { ObjectType } from "@/utils/object/ObjectType";

import { Instance } from "../models/Instance";
import { parseInstance } from "../utils/parseInstance";

type CopyInstanceDto = {
	parameters: ObjectType<string>;
};

type CopyInstanceApi = {
	parameters: ObjectType<string>;
	excludes: string[];
};

async function copyInstance(
	id: string,
	input: CopyInstanceDto = { parameters: {} },
): Promise<Instance> {
	// TODO: separate general excludes and add specific process ones later
	const data: CopyInstanceApi = {
		parameters: input.parameters,
		excludes: [
			"Assignees",
			"Branch",
			"PreviousTask",
			"CancellationNote",
			"CaseInvoiceNo",
			"CaseInvoiceDate",
			"CertificateConclusion",
			"CertificateIssueNo",
			"CertificateIssueDate",
			"InspectionInstanceId",
			"InspectionCaseNo",
			"InspectionFee",
			"InspectionFeeCurrency",
			"InspectionFeeCurrencyRate",
			"InspectionFeeInRial",
			"InvoiceTax",
			"InvoiceDuty",
			"InvoiceToll",
			"InvoiceTotal",
			"InvoiceTotalInText",
			"InvoiceDescription",
			"InvoiceRemaining",
			"InvoicePaymentRequests",
			"InvoicePaymentStatus",
			"LetterNo",
			"LetterPages",
			"LetterSignature",

			/* Secretariat_Letter_Outgoing */
			// TODO: should be included?
			// "LetterDate",
			// "LetterHasAttachments",
			"ReviewBy",
			"ReviewerPosition",
			"LetterFormNote",
			"LetterFormStatus",
			"LetterReviewNote",
			"LetterReviewStatus",
		],
	};

	const response = await apiClient.post({
		url: `process-instances/${id}/duplicate`,
		body: data,
	});

	return parseInstance(response.result);
}

export { copyInstance };
