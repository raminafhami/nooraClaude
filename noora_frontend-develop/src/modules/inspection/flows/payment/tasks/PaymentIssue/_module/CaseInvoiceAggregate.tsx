"use client";

import moment from "jalali-moment";
import { Dispatch, SetStateAction, useState } from "react";
import { useFormContext } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { updateInstanceData } from "@/felo/instances/services/updateInstanceData";
import { useTaskContext } from "@/felo/tasks/hooks/useTaskContext";
import createInvoice from "@/financial/sepidar/invoices/services/createInvoice";
import { CaseType } from "@/inspection/models/CaseType";
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

export default function CaseInvoiceAggregate({
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

	function getSepidarId(cases: CaseData[]) {
		let sepidarId: string | null = null;

		if (data[ids.caseType] === CaseType.Official) {
			const sepidarIds = [
				...new Set(
					cases.map((x) => x.buyer.sepidarId).filter((x) => x) as string[],
				),
			];

			if (sepidarIds.length > 1) {
			}

			sepidarId = sepidarIds[0] ?? null;
		} else {
			sepidarId = payerSepidarId ?? null;
		}

		if (!sepidarId) {
			throw new Error();
		}

		return sepidarId;
	}

	async function addInvoice(
		invoiceNo: number,
		casesWithoutInvoice: CaseData[],
		sepidarId: string,
	): Promise<string[]> {
		const invoiceDate = (
			data[ids.caseType] === CaseType.Official
				? moment()
				: moment(data[ids.paymentDate], "jYYYY/jMM/jDD")
		).format("YYYY/MM/DD");

		const createdInvoiceNo = await createInvoice({
			number: !isNaN(invoiceNo) ? invoiceNo.toString() : null,
			caseNos: casesWithoutInvoice.map((x) => x.caseNo).join("، "),
			date: invoiceDate,
			description: "",
			items: [
				{
					code: "015",
					description: "",
					duty: casesWithoutInvoice
						.map((x) => parseInt(x.invoiceDuty))
						.reduce((a, b) => a + b, 0)
						.toString(),
					fee: casesWithoutInvoice
						.map((x) => parseInt(x.inspectionFee))
						.reduce((a, b) => a + b, 0)
						.toString(),
					quantity: "1",
					tax: casesWithoutInvoice
						.map((x) => parseInt(x.invoiceTax))
						.reduce((a, b) => a + b, 0)
						.toString(),
				},
			],
			saleTypeNumber: "1",
			sepidarId,
		});

		return [createdInvoiceNo, invoiceDate];
	}

	async function updateInspectionCases(
		caseIds: string[],
		invoiceNo: string,
		invoiceDate: string,
	) {
		await Promise.all(
			caseIds.map(async (caseId) => {
				await updateInstanceData(caseId, {
					CaseInvoiceNo: invoiceNo,
					CaseInvoiceDate: invoiceDate,
				});
			}),
		);
	}

	async function updateInternalCases(
		caseIds: string[],
		invoiceNo: string,
		invoiceDate: string,
	) {
		const updatedCases = cases.map((x) =>
			!caseIds.includes(x.instanceId) ? x : { ...x, invoiceNo, invoiceDate },
		);

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
			const sepidarId = getSepidarId(casesWithoutInvoice);
			const [createdInvoiceNo, invoiceDate] = await addInvoice(
				invoiceNo,
				casesWithoutInvoice,
				sepidarId,
			);

			const updatedCaseIds = casesWithoutInvoice.map((x) => x.instanceId);
			// await Promise.all([
			//   updateInspectionCases(updatedCaseIds, createdInvoiceNo, invoiceDate),
			//   updateInternalCases(updatedCaseIds, createdInvoiceNo, invoiceDate),
			// ]);
			await updateInternalCases(updatedCaseIds, createdInvoiceNo, invoiceDate);

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
			<span>ثبت فاکتور تجمیعی</span>
			{isProcessing && <Loading size="xs" />}
		</Button>
	);
}
