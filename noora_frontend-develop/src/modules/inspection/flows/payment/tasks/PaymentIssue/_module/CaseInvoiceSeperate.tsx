"use client";

import moment from "jalali-moment";
import { Dispatch, SetStateAction, useState } from "react";
import { useFormContext } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { updateInstanceData } from "@/felo/instances/services/updateInstanceData";
import { useTaskContext } from "@/felo/tasks/hooks/useTaskContext";
import createInvoice from "@/financial/sepidar/invoices/services/createInvoice";
import { CaseType } from "@/inspection/models/CaseType";
import { inspectionType } from "@/inspection/models/InspectionType";
import { Loading } from "@/ui/Loader";

import { CaseData } from "../../../models/CaseData";
import { ids } from "../../../models/Ids";
import { FormData } from "../PhasePage";

interface Props {
	invoiceNo: string;
	isDisabled: boolean;
	isSending: boolean;
	setSending: Dispatch<SetStateAction<boolean>>;
	onFinish: () => void;
}

export default function CaseInvoiceSeperate({
	invoiceNo,
	isDisabled,
	isSending,
	setSending,
	onFinish,
}: Props) {
	const {
		task: { data },
		save,
	} = useTaskContext();
	const { setValue, watch } = useFormContext<FormData>();
	const { [ids.inspectionCases]: cases, [ids.payerSepidarId]: payerSepidarId } =
		watch();

	const [isProcessing, setProcessing] = useState<boolean>(false);

	function getInvoiceNo() {
		const invoiceNoNum = parseInt(invoiceNo);

		return invoiceNoNum;
	}

	function getSepidarId(caseItem: CaseData) {
		let sepidarId =
			(data[ids.caseType] === CaseType.Official
				? caseItem.buyer.sepidarId
				: payerSepidarId) ?? null;

		if (!sepidarId) {
			throw new Error();
		}

		return sepidarId;
	}

	async function addInvoices(
		casesWithoutInvoice: CaseData[],
		invoiceNo: number,
	) {
		const invoiceDate = (
			data[ids.caseType] === CaseType.Official
				? moment()
				: moment(data[ids.paymentDate], "jYYYY/jMM/jDD")
		).format("YYYY/MM/DD");

		const result: string[][] = [];
		let currentInvoiceNo = !isNaN(invoiceNo) ? invoiceNo : null;

		for (let i = 0; i < casesWithoutInvoice.length; i++) {
			try {
				const caseItem = casesWithoutInvoice[i];
				const sepidarId = getSepidarId(caseItem);

				const createdInvoiceNo = await createInvoice({
					number: currentInvoiceNo?.toString() ?? null,
					caseNos: caseItem.caseNo,
					date: invoiceDate,
					description: "",
					items: [
						{
							code: inspectionType[caseItem.inspectionType].serviceCode,
							description: "",
							duty: caseItem.invoiceDuty,
							fee: caseItem.inspectionFee,
							quantity: "1",
							tax: caseItem.invoiceTax,
						},
					],
					saleTypeNumber: "1",
					sepidarId,
				});

				result.push([caseItem.instanceId, createdInvoiceNo, invoiceDate]);

				if (currentInvoiceNo) {
					currentInvoiceNo++;
				}
			} catch (err: any) {}
		}

		return result;
	}

	async function updateInspectionCases(caseIdAndInvoiceData: string[][]) {
		await Promise.all(
			caseIdAndInvoiceData.map(async ([caseId, invoiceNo, invoiceDate]) => {
				await updateInstanceData(caseId, {
					CaseInvoiceNo: invoiceNo,
					CaseInvoiceDate: invoiceDate,
				});
			}),
		);
	}

	async function updateInternalCases(caseIdAndInvoiceData: string[][]) {
		const updatedCases = cases.map((x) => {
			const y = caseIdAndInvoiceData.find((z) => z?.[0] === x.instanceId);

			if (!y) {
				return x;
			}

			return { ...x, invoiceNo: y[1], invoiceDate: y[2] };
		});

		await save({ [ids.inspectionCases]: updatedCases });

		setValue(ids.inspectionCases, updatedCases, {
			shouldDirty: true,
			shouldTouch: true,
		});
	}

	async function handleSubmit() {
		setSending(true);
		setProcessing(true);

		try {
			const invoiceNo = getInvoiceNo();
			const casesWithoutInvoice = cases.filter((x) => !x.invoiceNo);
			const createdInvoices = await addInvoices(casesWithoutInvoice, invoiceNo);

			// await Promise.all([
			//   updateInspectionCases(createdInvoices),
			//   updateInternalCases(createdInvoices),
			// ]);
			await updateInternalCases(createdInvoices);

			onFinish();
		} catch (err: any) {
			console.error(err);
		} finally {
			setSending(false);
			setProcessing(false);
		}
	}

	return (
		<Button
			className="flex h-10 items-center gap-x-2"
			disabled={isDisabled || isSending}
			type="button"
			variant="outline"
			onClick={handleSubmit}
		>
			ثبت فاکتور به تفکیک
			{isProcessing && <Loading size="xs" />}
		</Button>
	);
}
