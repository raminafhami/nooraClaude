"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";

import { useTaskContext } from "@/felo/tasks/hooks/useTaskContext";
import { Input } from "@/form/Input";
import { CaseType } from "@/inspection/models/CaseType";
import { InspectionType } from "@/inspection/models/InspectionType";
import { Seperator } from "@/ui/Seperator";

import { ids } from "../../../models/Ids";
import { FormData } from "../PhasePage";
import CaseInvoiceAggregate from "./CaseInvoiceAggregate";
import CaseInvoiceSeperate from "./CaseInvoiceSeperate";

export default function CaseInvoice() {
	const {
		task: { data },
	} = useTaskContext();

	const { watch } = useFormContext<FormData>();
	const {
		[ids.inspectionCases]: caseItems,
		[ids.payerSepidarId]: payerSepidarId,
	} = watch();

	const [invoiceNo, setInvoiceNo] = useState<string>("");
	const isSeperateDisabled = useMemo(() => {
		let result: boolean = true;

		if (data[ids.caseType] === CaseType.Official) {
			caseItems.forEach((caseItem) => {
				if (caseItem.buyer.sepidarId) {
					result = false;
				}
			});
		} else {
			result = !payerSepidarId;
		}

		return result;
	}, [caseItems, data, payerSepidarId]);
	const isAggregateDisabled = useMemo(() => {
		let sepidarIds: string[] | null = null;

		if (data[ids.caseType] === CaseType.Official) {
			sepidarIds = [
				...new Set(
					caseItems.map((x) => x.buyer.sepidarId).filter((x) => x) as string[],
				),
			];
		} else {
			sepidarIds = payerSepidarId ? [payerSepidarId] : null;
		}

		return (
			sepidarIds?.length !== 1 ||
			!!caseItems.find(
				(item) => item.inspectionType === InspectionType.Sampling,
			)
		);
	}, [caseItems, data, payerSepidarId]);

	const [isSending, setSending] = useState<boolean>(false);

	const invoiceNoInp = useRef<HTMLInputElement>(null);

	const handleInvoiceClear = useCallback(() => {
		setInvoiceNo("");
	}, []);

	if (caseItems.filter((x) => x.invoiceNo === null).length === 0) {
		return <></>;
	}

	return (
		<>
			<Seperator className="mt-5" />

			<div className="col-span-3 col-start-1 space-y-2">
				<label htmlFor="invoice">شماره فاکتور:</label>
				<div>
					<Input
						disabled={isSeperateDisabled && isAggregateDisabled}
						id="invoice"
						ref={invoiceNoInp}
						value={invoiceNo}
						onChange={(e) => setInvoiceNo(e.target.value)}
					/>
				</div>
			</div>
			<div className="col-span-3 flex gap-x-2 pt-7">
				<CaseInvoiceSeperate
					invoiceNo={invoiceNo}
					isDisabled={isSeperateDisabled}
					isSending={isSending}
					setSending={setSending}
					onFinish={() => {
						handleInvoiceClear();
					}}
				/>

				<CaseInvoiceAggregate
					invoiceNo={invoiceNo}
					isDisabled={isAggregateDisabled}
					isSending={isSending}
					setSending={setSending}
					onFinish={() => {
						handleInvoiceClear();
					}}
				/>
			</div>
		</>
	);
}
