import moment from "jalali-moment";

import { getBuyerById } from "@/buyers/services/getBuyerById";
import { addWatcherToInstance } from "@/felo/instances/services/addWatcherToInstance";
import { createInstance } from "@/felo/instances/services/createInstance";
import { setStageOfInstance } from "@/felo/instances/services/setStageOfInstance";
import getProcessByKey from "@/felo/processes/services/getProcessByKey";
import { getMyNextTask } from "@/felo/tasks/services/getMyNextTask";
import { CaseType } from "@/inspection/models/CaseType";
import { InspectionType } from "@/inspection/models/InspectionType";
import { InvoicePaymentStatus } from "@/inspection/models/InvoicePaymentStatus";

import { ActionName } from "../models/ActionName";
import { CasePaymentStatus } from "../models/CasePaymentStatus";
import { ids } from "../models/Ids";
import { PaymentType } from "../models/PaymentTypes";

interface PaymentInitiateBySamplingModel {
	buyerId: string;
	data: {
		instanceId: string;
		caseNo: string;
		fee: string;
		tax: string;
		duty: string;
		total: string;
	};
	userId: string;
}

export async function initiatePaymentBySampling({
	buyerId,
	data,
	userId,
}: PaymentInitiateBySamplingModel): Promise<string> {
	const [buyer, process] = await Promise.all([
		getBuyerById(buyerId),
		getProcessByKey("Inspection_Payment_ReceiptRecord"),
	]);

	if (buyer === null) {
		throw new Error("Buyer not found.");
	}
	// } else if (!buyer.sepidarId) {
	//   throw new Error("Buyer does not have sepidar Id.");
	// }

	if (process === null) {
		throw new Error("Process not found.");
	}

	const createdInstance = await createInstance({
		processId: process.id,
		parameters: {
			[ids.actionName]: ActionName.Receipt,
			[ids.inspectionCases]: [
				{
					instanceId: data.instanceId,
					caseNo: data.caseNo,
					caseType: CaseType.Official,
					inspectionType: InspectionType.Sampling,
					buyer: {
						id: buyer.id,
						name: buyer.name,
						sepidarId: buyer.sepidarId,
					},
					invoiceNo: null,
					inspectionFee: data.fee,
					invoiceDuty: data.duty,
					invoiceTax: data.tax,
					invoiceTotal: data.total,
					invoiceRemaining: data.total,
					paymentAmount: data.total,
					paymentStatus: CasePaymentStatus.Complete,
					previousPaymentStatus: InvoicePaymentStatus.Unpaid,
				},
			],
			[ids.caseType]: CaseType.Official,
			[ids.paymentType]: PaymentType.BankDeposit,
			[ids.paymentDate]: moment(new Date()).format("jYYYY/jMM/jDD"),
			[ids.paymentAmount]: data.total,
		},
	});

	const [nextTask] = await Promise.all([
		await getMyNextTask(createdInstance.id),
		await addWatcherToInstance(createdInstance.id, userId),
		createdInstance.processPhases &&
			createdInstance.processPhases.length !== 0 &&
			(await setStageOfInstance(
				createdInstance.id,
				createdInstance.processPhases.at(0)?.name ?? "",
			)),
	]);

	return nextTask?.taskId ?? "";
}
