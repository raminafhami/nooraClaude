"use client";

import moment from "jalali-moment";
import { useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { getInstances } from "@/felo/instances/services/getInstances";
import { updateInstanceData } from "@/felo/instances/services/updateInstanceData";
import { useTaskContext } from "@/felo/tasks/hooks/useTaskContext";
import { VoucherItem } from "@/financial/sepidar/vouchers/models/VoucherItem";
import createVoucher from "@/financial/sepidar/vouchers/services/createVoucher";
import { FieldError } from "@/form/FieldError";
import { Input } from "@/form/Input";
import { CaseType } from "@/inspection/models/CaseType";
import { InvoicePaymentRequests } from "@/inspection/models/InvoicePaymentRequest";
import { messages } from "@/messages";
import { Loading } from "@/ui/Loader";
import { Seperator } from "@/ui/Seperator";

import { CaseData } from "../../../models/CaseData";
import { ids } from "../../../models/Ids";
import { PaymentType } from "../../../models/PaymentTypes";
import { FormData } from "../PhasePage";

export default function CaseVoucher() {
	const { task, save } = useTaskContext();
	const { data } = task;

	const {
		formState: { errors },
		register,
		setValue,
		watch,
	} = useFormContext<FormData>();

	const {
		[ids.inspectionCases]: cases,
		[ids.payerSepidarId]: payerSepidarId,
		[ids.voucherNo]: voucherNo,
	} = watch();

	const isAutoDisabled = useMemo(() => {
		let result: boolean = true;

		if (data[ids.caseType] === CaseType.Official) {
			cases.forEach((caseItem) => {
				if (caseItem.buyer.sepidarId) {
					result = false;
				}
			});
		} else {
			result = !payerSepidarId;
		}

		return result;
	}, [cases, data, payerSepidarId]);

	const [isProcessing, setProcessing] = useState<boolean>(false);
	const [isSendingAuto, setSendingAuto] = useState<boolean>(false);
	const [isSendingManual, setSendingManual] = useState<boolean>(false);

	function prepareOfficialItems(): VoucherItem[] {
		const items: VoucherItem[] = [];

		const groupedData = cases.reduce(
			(acc: { [key: string]: number[] }, obj: CaseData, index) => {
				const key = obj.buyer.id;

				if (!acc[key]) {
					acc[key] = [];
				}
				acc[key].push(index);

				return acc;
			},
			{},
		);

		Object.keys(groupedData).forEach((k) => {
			const invoicesDescription = `فاکتور ${[
				...new Set(
					groupedData[k].map((x) => cases[x].invoiceNo as string).sort(),
				),
			].join("،")}`;

			const filesDescription = `فایل ${groupedData[k]
				.map((x) => cases[x].caseNo)
				.sort()
				.join("،")}`;

			const description = `دریافتی ${invoicesDescription} ${filesDescription}`;

			items.push({
				credit: groupedData[k]
					.map((x) => parseInt(cases[x].paymentAmount))
					.reduce((a, b) => a + b, 0),
				debit: 0,
				description,
				dlCode: cases[groupedData[k][0]].buyer.sepidarId as string,
				slCode: "111201",
			});
		});

		return items;
	}

	function prepareUnofficialItems(): VoucherItem[] {
		const invoicesDescription = `فاکتور ${[
			...new Set(cases.map((x) => x.invoiceNo as string).sort()),
		].join("،")}`;

		const filesDescription = `فایل ${cases
			.map((x) => x.caseNo)
			.sort()
			.join("،")}`;

		const description = `دریافتی ${invoicesDescription} ${filesDescription}`;

		return [
			{
				credit: parseInt(data[ids.paymentAmount]),
				debit: 0,
				description,
				dlCode: data[ids.payerSepidarId],
				slCode: "111201",
			},
		];
	}

	async function updateInspectionCases(voucherNo: string) {
		const caseIds = cases.map((x) => x.instanceId);

		const instances = await getInstances({
			filters: [{ name: "_id", value: caseIds }],
			props: ["InvoicePaymentRequests"],
		});

		await Promise.all(
			caseIds.map(async (caseId) => {
				const instance = instances.find((x) => x.id === caseId);

				if (!instance || !instance.parameters) {
					throw new Error();
				}

				const updatedRequests = (
					instance.parameters[
						"InvoicePaymentRequests"
					] as InvoicePaymentRequests
				).map((request) => {
					if (request.instanceId !== task.instanceId) {
						return request;
					}

					return {
						...request,
						payment: {
							paymentDate:
								request.payment?.paymentDate ?? data[ids.paymentDate],
							voucherNo,
						},
					};
				});

				await updateInstanceData(caseId, {
					InvoicePaymentRequests: updatedRequests,
				});
			}),
		);
	}

	async function updateInternalState(voucherNo: string) {
		await save({ [ids.voucherNo]: voucherNo });

		setValue(ids.voucherNo, voucherNo, {
			shouldDirty: true,
			shouldTouch: true,
			shouldValidate: true,
		});
	}

	async function handleAutoSubmit() {
		try {
			setProcessing(true);
			setSendingAuto(true);

			const invoicesDescription = `فاکتور ${[
				...new Set(cases.map((x) => x.invoiceNo as string).sort()),
			].join("،")}`;

			const filesDescription = `فایل ${cases
				.map((x) => x.caseNo)
				.sort()
				.join("،")}`;

			const description = `دریافتی ${invoicesDescription} ${filesDescription} رهگیری ${
				data[ids.receiptNo]
			}`;

			const items: VoucherItem[] = [];

			items.push({
				credit: 0,
				debit: parseInt(data[ids.paymentAmount]),
				description,
				dlCode: data[ids.bankAccount],
				slCode: "111005",
			});

			const casesItems =
				data[ids.caseType] === CaseType.Official
					? prepareOfficialItems()
					: prepareUnofficialItems();

			items.push(...casesItems);

			const voucherNo = await createVoucher({
				date: moment(data[ids.paymentDate], "jYYYY/jMM/jDD").format(
					"YYYY/MM/DD",
				),
				description,
				items,
			});

			await Promise.all([
				updateInspectionCases(voucherNo),
				updateInternalState(voucherNo),
			]);
		} catch (err: any) {
			console.error(err);
		} finally {
			setProcessing(false);
			setSendingAuto(false);
		}
	}

	async function handleManualSubmit() {
		try {
			setProcessing(true);
			setSendingManual(true);

			await Promise.all([
				updateInspectionCases(voucherNo),
				updateInternalState(voucherNo),
			]);
		} catch (err: any) {
			console.error(err);
		} finally {
			setProcessing(false);
			setSendingManual(false);
		}
	}

	return (
		<>
			<Seperator className="mt-5" />

			<div className="col-span-3 col-start-1">
				<label htmlFor={ids.voucherNo}>شماره سند حسابداری:</label>
				<Input
					className="mt-2"
					disabled={isAutoDisabled || isProcessing}
					id={ids.voucherNo}
					{...register(ids.voucherNo, {
						required: messages.validation.required,
					})}
				/>
				<FieldError error={errors[ids.voucherNo]} />
			</div>

			<div className="col-span-3 flex gap-x-2 pt-7">
				<Button
					className="flex h-10 items-center gap-x-2"
					disabled={isProcessing || !voucherNo}
					type="button"
					variant="outline"
					onClick={handleManualSubmit}
				>
					<span>ثبت سند دستی</span>
					{isSendingManual && <Loading size="xs" />}
				</Button>

				<Button
					className="flex h-10 items-center gap-x-2"
					disabled={
						isAutoDisabled ||
						isProcessing ||
						(data[ids.paymentType] !== PaymentType.BankDeposit &&
							data[ids.paymentType] !== PaymentType.BankGateway)
					}
					type="button"
					variant="outline"
					onClick={handleAutoSubmit}
				>
					<span>ثبت سند خودکار</span>
					{isSendingAuto && <Loading size="xs" />}
				</Button>
			</div>
		</>
	);
}
