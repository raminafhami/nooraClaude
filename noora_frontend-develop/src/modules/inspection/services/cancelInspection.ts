import { cancelInstance } from "@/felo/instances/services/cancelInstance";
import { getInstances } from "@/felo/instances/services/getInstances";
import { isFieldInTaskData } from "@/felo/tasks/utils/isFieldInTaskData";
import { isFieldInTaskForm } from "@/felo/tasks/utils/isFieldInTaskForm";
import { CostStatus } from "@/financial/costs/enums/CostStatus";
import { deleteCostsByCase } from "@/financial/costs/services/deleteCostsByCase";
import { getCosts } from "@/financial/costs/services/getCosts";
import { cancelDebts } from "@/financial/debts/services/cancelDebts";
import { deleteIncome } from "@/financial/incomes/services/deleteIncome";
import { getIncomes } from "@/financial/incomes/services/getIncomes";
import { InvoiceStatus } from "@/financial/invoices/enums/InvoiceStatus";
import { cancelInvoice } from "@/financial/invoices/services/cancelInvoice";
import { getInstanceInvoices } from "@/financial/invoices/services/getInstanceInvoices";
import { isEntityLocked } from "@/utils/isEntityLocked";

import { InvoicePaymentStatus } from "../models/InvoicePaymentStatus";

const ids = {
	inspectionFeeInRial: "InspectionFeeInRial",
	invoicePaymentStatus: "InvoicePaymentStatus",
	inspectionInstanceId: "InspectionInstanceId",
} as const;

type TaskLike = {
	instanceId: string;
	properties: { key: string }[];
	data: { [key: string]: any };
};

type DataLike = Partial<{
	[ids.inspectionFeeInRial]: string;
}>;

async function cancelInspection(
	task: TaskLike,
	data: DataLike,
	details: {
		reason: string;
		description?: string;
	},
) {
	const { reason, description } = details;

	// abort if an invoice or payment exists for the request
	const instance = await getInstances({
		filters: [{ name: "_id", value: task.instanceId }],
		props: [ids.invoicePaymentStatus, ids.inspectionInstanceId],
	}).then((x) => x.at(0));

	if (!instance) {
		throw new Error("instance is not found.");
	}

	// verify invoices status
	let invoicePaymentStatus: string | null | undefined = undefined;

	if (isFieldInTaskData(task, ids.invoicePaymentStatus)) {
		invoicePaymentStatus = task.data[ids.invoicePaymentStatus];
	} else {
		invoicePaymentStatus = instance.parameters?.[ids.invoicePaymentStatus];
	}

	const problemInvoices = await getInstanceInvoices(task.instanceId, {
		filters: {
			$or: [
				{ status: InvoiceStatus.Pending },
				{
					status: { $ne: InvoiceStatus.Cancelled },
					$and: [{ issueNo: { $exists: true } }, { issueNo: { $ne: null } }],
				},
			],
		},
	});

	if (
		(invoicePaymentStatus &&
			invoicePaymentStatus !== InvoicePaymentStatus.Unpaid) ||
		problemInvoices.length
	) {
		throw new Error(
			"امکان لغو درخواست پس از درخواست، صدور و یا پرداخت فاکتور وجود ندارد.",
		);
	}

	// verify locked incomes/invoices
	const [lockedIncomes, lockedInvoices] = await Promise.all([
		getIncomes({
			filters: {
				instanceId: task.instanceId,
				$and: [{ lock: { $exists: true } }, { lock: { $ne: null } }],
			},
		}).then((incomes) => incomes.filter(isEntityLocked)),

		getInstanceInvoices(task.instanceId, {
			filters: {
				$and: [{ lock: { $exists: true } }, { lock: { $ne: null } }],
			},
		}).then((incomes) => incomes.filter(isEntityLocked)),
	]);

	if (lockedIncomes.length || lockedInvoices.length) {
		throw new Error("امکان انجام این عملیات وجود ندارد.");
	}

	// verify costs status
	const problemCosts = await getCosts({
		filters: { caseId: task.instanceId, status: { $ne: CostStatus.Unpaid } },
	});

	if (problemCosts.length) {
		throw new Error(
			"امکان لغو درخواست به دلیل وجود هزینه های در انتظار بررسی و یا پرداخت شده وجود ندارد.",
		);
	}

	// cancel debts
	await cancelDebts(task.instanceId);

	// remove costs
	await deleteCostsByCase(task.instanceId);

	// cancel inspection operation instance if exists
	let inspectionInstanceId: string | null | undefined;
	if (isFieldInTaskData(task, ids.inspectionInstanceId)) {
		inspectionInstanceId = task.data[ids.inspectionInstanceId];
	} else {
		inspectionInstanceId = instance.parameters?.[ids.inspectionInstanceId];
	}

	if (inspectionInstanceId) {
		await cancelInstance(inspectionInstanceId, { reason, description });
	}

	// cancel invoices and delete incomes if exist
	const invoices = await getInstanceInvoices(task.instanceId);
	await Promise.all(
		invoices.map(async (invoice) => {
			await cancelInvoice(invoice._id);
		}),
	);

	const incomes = await getIncomes({
		filters: { instanceId: task.instanceId },
	});
	await Promise.all(
		incomes.map(async (income) => {
			await deleteIncome(income.id);
		}),
	);

	// set fee and invoice numbers
	if (isFieldInTaskForm(task, ids.inspectionFeeInRial)) {
		data[ids.inspectionFeeInRial] = "0";
	}
}

export { cancelInspection };
