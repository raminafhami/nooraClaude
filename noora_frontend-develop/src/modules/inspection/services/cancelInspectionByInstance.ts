import { cancelInstance } from "@/felo/instances/services/cancelInstance";
import { getInstances } from "@/felo/instances/services/getInstances";
import { setStageOfInstance } from "@/felo/instances/services/setStageOfInstance";
import { updateInstanceData } from "@/felo/instances/services/updateInstanceData";
import { deleteCostsByCase } from "@/financial/costs/services/deleteCostsByCase";
import { cancelDebts } from "@/financial/debts/services/cancelDebts";
import { deleteIncome } from "@/financial/incomes/services/deleteIncome";
import { getIncomes } from "@/financial/incomes/services/getIncomes";
import { InvoiceStatus } from "@/financial/invoices/enums/InvoiceStatus";
import { cancelInvoice } from "@/financial/invoices/services/cancelInvoice";
import { getInstanceInvoices } from "@/financial/invoices/services/getInstanceInvoices";
import { parseInvoice } from "@/financial/invoices/utils/parseInvoice";
import { isEntityLocked } from "@/utils/isEntityLocked";
import { ObjectType } from "@/utils/object/ObjectType";

import { InvoicePaymentStatus } from "../models/InvoicePaymentStatus";

const ids = {
	inspectionFeeInRial: "InspectionFeeInRial",
	invoicePaymentStatus: "InvoicePaymentStatus",
	inspectionInstanceId: "InspectionInstanceId",
} as const;

async function cancelInspectionByInstance(
	instanceId: string,
	details: {
		reason: string;
		description?: string;
	},
) {
	const { reason, description } = details;

	// abort if an invoice or payment exists for the request
	const instance = await getInstances({
		filters: [{ name: "_id", value: instanceId }],
		props: [
			ids.inspectionFeeInRial,
			ids.inspectionInstanceId,
			ids.invoicePaymentStatus,
		],
	}).then((x) => x.at(0));

	if (!instance) {
		throw new Error("instance is not found.");
	}

	// verify invoices status
	let invoicePaymentStatus: InvoicePaymentStatus | null | undefined =
		instance.parameters?.[ids.invoicePaymentStatus];

	const problemInvoices = await getInstanceInvoices(instanceId, {
		filters: {
			$or: [
				{ status: InvoiceStatus.PartiallyPaid },
				{ status: InvoiceStatus.Paid },
			],
		},
	});

	if (
		(invoicePaymentStatus &&
			(invoicePaymentStatus === InvoicePaymentStatus.PartiallyPaid ||
				invoicePaymentStatus === InvoicePaymentStatus.Paid)) ||
		problemInvoices.length
	) {
		throw new Error("امکان لغو درخواست پس از پرداخت فاکتور وجود ندارد.");
	}

	// verify locked incomes/invoices
	const [lockedIncomes, lockedInvoices] = await Promise.all([
		getIncomes({
			filters: {
				instanceId,
				$and: [{ lock: { $exists: true } }, { lock: { $ne: null } }],
			},
		}).then((incomes) => incomes.filter(isEntityLocked)),

		getInstanceInvoices(instanceId, {
			filters: {
				$and: [{ lock: { $exists: true } }, { lock: { $ne: null } }],
			},
		}).then((incomes) => incomes.filter(isEntityLocked)),
	]);

	if (lockedIncomes.length || lockedInvoices.length) {
		throw new Error("امکان انجام این عملیات وجود ندارد.");
	}

	// cancel invoices
	const invoices = await getInstanceInvoices(instanceId, {
		filters: { status: { $ne: InvoiceStatus.Cancelled } },
	}).then(parseInvoice);
	for (const invoice of invoices) {
		await cancelInvoice(invoice.id);
	}

	// cancel debts
	await cancelDebts(instanceId);

	// remove costs
	await deleteCostsByCase(instanceId);

	// cancel inspection operation instance if exists
	const inspectionInstanceId: string | null | undefined =
		instance.parameters?.[ids.inspectionInstanceId];

	if (inspectionInstanceId) {
		await cancelInstance(inspectionInstanceId, { reason, description });
	}

	// delete incomes if exist
	const incomes = await getIncomes({
		filters: { instanceId },
	});

	await Promise.all(
		incomes.map(async (income) => {
			await deleteIncome(income.id);
		}),
	);

	// set instance parameters
	const parameters: ObjectType = {};

	instance.parameters?.[ids.inspectionFeeInRial] &&
		(parameters[ids.inspectionFeeInRial] = "0");

	await updateInstanceData(instanceId, parameters);
	await setStageOfInstance(instanceId, "canceled");
	await cancelInstance(instanceId, { reason, description });
}

export { cancelInspectionByInstance };
