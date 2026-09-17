"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Task } from "@/felo/tasks/models/Task";
import { TaskInnerProvider } from "@/felo/tasks/providers/TaskInnerProvider";
import { TaskOuterProvider } from "@/felo/tasks/providers/TaskOuterProvider";
import { getMyTaskById } from "@/felo/tasks/services/getMyTaskById";
import { renderTaskOfInvoiceCancellation } from "@/financial/invoices/flows/invoice-cancellation/services/renderTask";
import { renderTaskOfInvoicePayment } from "@/financial/invoices/flows/invoice-payment/services/renderTask";
import { renderTaskOfPersonnelContract } from "@/hrm/contract/flows/personnel-contract/services/renderTask";
import { renderTaskOfBandarAbbasSampling } from "@/inspection/flows/bandarabbas-sampling/services/renderTask";
import { renderTaskOfInspectionBankCOI } from "@/inspection/flows/bank-coi/services/renderTask";
import { getBoushehrSamplingTaskDetails } from "@/inspection/flows/boushehrSampling/CustomsSamplingService";
import { renderTaskOfInspectionCoi } from "@/inspection/flows/coi/services/renderTask";
import { getCustomsSamplingTaskDetails } from "@/inspection/flows/customsSampling/CustomsSamplingService";
import { renderTaskOfInspectionIC } from "@/inspection/flows/ic/services/renderTask";
import { getImamSamplingTaskDetails } from "@/inspection/flows/imamSampling/CustomsSamplingService";
import { renderTaskOfInspectionCancellation } from "@/inspection/flows/inspection-cancellation/services/renderTask";
import { renderTaskOfInspectionFeasibility } from "@/inspection/flows/inspection-feasibility/services/renderTask";
import { getInspectionReport } from "@/inspection/flows/inspectionReport/TaskSelector";
import { renderTaskOfInspectionLC } from "@/inspection/flows/lc/services/renderTask";
import { renderTaskOfInspectionPayment } from "@/inspection/flows/payment/services/renderTask";
import { getPaymentOrderTaskDetails } from "@/inspection/flows/paymentOrder/TaskSelector";
import { getProductiveSamplingTaskDetails } from "@/inspection/flows/productiveSampling/ProductiveSamplingService";
import { renderTaskOfInspectionSC } from "@/inspection/flows/sc/services/renderTask";
import { renderTaskOfSourceProcess } from "@/inspection/flows/source/services/renderTask";
import { getSecretariatOutgoingOutsideLetterTaskDetails } from "@/secretariat/flows/archive/outgoing-letter-v1";
import { renderTaskOfOutgoingLetter } from "@/secretariat/flows/outgoing-letter/services/renderTask";
import { Layout, Wait } from "@/ui/Layout";
import { getDynamicUrl } from "@/utils/url/getDynamicUrl";

import TaskNavigation from "./TaskNavigation";

interface Props {
	id: string;
}

function TaskClient({ id }: Props) {
	const router = useRouter();

	const searchParams = useSearchParams();
	const debug = searchParams.get("debug") === "true";

	const [isLoading, setLoading] = useState<boolean>(true);
	const [task, setTask] = useState<Task>();

	useEffect(() => {
		(async () => {
			try {
				const task = await getMyTaskById(id);

				if (!task) {
					throw new Error(`task with id {${id}} is not found.`);
				}

				setTask(task);
			} catch (err: any) {
				console.log(err);
			} finally {
				setLoading(false);
			}
		})();
	}, [id, router]);

	if (isLoading) {
		return <Wait title="در حال دریافت اطلاعات..." />;
	}

	if (!task) {
		router.push(getDynamicUrl("/dashboard/tasks"));
		return;
	}

	const details =
		(task.processKey === "Inspection_Case_IC" &&
			renderTaskOfInspectionIC(task)) ||
		(task.processKey === "Inspection_Case_LC" &&
			renderTaskOfInspectionLC(task)) ||
		(task.processKey === "Inspection_Case_SC" &&
			renderTaskOfInspectionSC(task)) ||
		(task.processKey === "Inspection_Case_Bank_COI" &&
			renderTaskOfInspectionBankCOI(task)) ||
		(task.processKey === "Inspection_Case_COI" &&
			renderTaskOfInspectionCoi(task)) ||
		(task.processKey === "Inspection_Payment_ReceiptRecord" &&
			renderTaskOfInspectionPayment(task)) ||
		(task.processKey === "SecretariatOutgoingLetter" &&
			getSecretariatOutgoingOutsideLetterTaskDetails(task)) ||
		(task.processKey === "paymentOrder" &&
			getPaymentOrderTaskDetails(task, debug)) ||
		(task.processKey === "Inspectors" && getInspectionReport(task)) ||
		(task.processKey === "PersonnelContract" &&
			renderTaskOfPersonnelContract(task)) ||
		(task.processKey === "ProductiveSampling" &&
			getProductiveSamplingTaskDetails(task)) ||
		(task.processKey === "CustomsSampling" &&
			getCustomsSamplingTaskDetails(task)) ||
		(task.processKey === "BoushehrSampling" &&
			getBoushehrSamplingTaskDetails(task)) ||
		(task.processKey === "ImamSampling" && getImamSamplingTaskDetails(task)) ||
		(task.processKey === "Inspection_Cancellation" &&
			renderTaskOfInspectionCancellation(task)) ||
		(task.processKey === "Inspection_Case_Source" &&
			renderTaskOfSourceProcess(task)) ||
		(task.processKey === "BandarAbbasSampling" &&
			renderTaskOfBandarAbbasSampling(task)) ||
		(task.processKey === "Financial_Invoice_Payment" &&
			renderTaskOfInvoicePayment(task)) ||
		(task.processKey === "Financial_Invoice_Cancellation" &&
			renderTaskOfInvoiceCancellation(task)) ||
		(task.processKey === "Secretariat_Letter_Outgoing" &&
			renderTaskOfOutgoingLetter(task)) ||
		(task.processKey === "Inspection_Feasibility" &&
			renderTaskOfInspectionFeasibility(task));

	if (!details) {
		throw new Error();
	}

	const { render, ...detailsRest } = details;

	return (
		<TaskOuterProvider task={task}>
			<Layout.Root>
				<Layout.Head
					title={`درخواست ${task?.caseNo} ${task.processName} » ${task.name}`}
				>
					<TaskNavigation />
				</Layout.Head>
				<Layout.Content>
					<TaskInnerProvider {...detailsRest}>
						{details.render}
					</TaskInnerProvider>
				</Layout.Content>
			</Layout.Root>
		</TaskOuterProvider>
	);
}

export default TaskClient;
