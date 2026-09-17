import { useRef, useState } from "react";

import { getBuyerById } from "@/buyers/services/getBuyerById";
import { Button } from "@/components/ui/button";
import { getInstances } from "@/felo/instances/services/getInstances";
import { MaskInput } from "@/form/MaskInput";
import getUserById from "@/identity/users/services/getUserById";
import { CaseType } from "@/inspection/models/CaseType";
import { InspectionType } from "@/inspection/models/InspectionType";
import { InvoicePaymentStatus } from "@/inspection/models/InvoicePaymentStatus";
import detectInspectionType from "@/inspection/utils/detectInspectionType";
import { Loading } from "@/ui/Loader";

import { ActionName } from "../../../models/ActionName";
import { CaseBuyer, CaseData } from "../../../models/CaseData";
import { CasePayer } from "../../../models/CasePayer";
import { InstanceData } from "../../../models/InstanceData";
import { instanceIds } from "../../../models/InstanceIds";

interface Props {
	actionName: ActionName | undefined;
	caseNos: string[];
	caseType: CaseType | null;
	payerId: string | null;
	onAdd: (type: CaseType, data: CaseData, payer: CasePayer | null) => void;
}

export default function CaseFormAdd({
	actionName,
	caseNos,
	caseType,
	payerId,
	onAdd,
}: Props) {
	const [isSending, setSending] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const [caseNo, setCaseNo] = useState<string>("");

	const caseNoInp = useRef<HTMLInputElement>(null);
	const addBtn = useRef<HTMLButtonElement>(null);

	async function handleSubmit() {
		if (!caseNo) {
			return;
		}

		setSending(true);
		setError(null);

		try {
			if (!actionName) {
				throw new Error("عملیات مورد نظر را در ابتدای فرم مشخص نمایید.");
			}

			const duplicateCaseById = caseNos.indexOf(caseNo) !== -1;
			if (duplicateCaseById) {
				throw new Error("شماره درخواست مورد نظر در جدول زیر موجود است.");
			}

			const instance = await fetchInstance(caseNo);

			if (
				actionName === ActionName.Invoice &&
				instance.parameters?.[instanceIds.caseType] === CaseType.Unofficial
			) {
				throw new Error(
					"عملیات صدور فاکتور برای درخواست های غیررسمی امکان پذیر نمی باشد.",
				);
			}

			if (instance.processKey.startsWith("Inspection_Case")) {
				const data = await prepareCaseData(caseType, instance.parameters);

				// payer
				const payer = await prepareCasePayer(
					instance.parameters[instanceIds.caseType],
					payerId,
					instance.parameters[instanceIds.branch]?.managerId ?? null,
					instance.parameters[instanceIds.assignees].customer.id,
				);

				onAdd(
					instance.parameters[instanceIds.caseType],
					{
						...data,
						instanceId: instance.id,
						caseNo: instance.caseNo,
						inspectionType: detectInspectionType(instance.processKey),
						previousPaymentStatus:
							instance.parameters[instanceIds.paymentStatus],
					} as CaseData,
					payer,
				);
			} else {
				onAdd(
					CaseType.Official,
					{
						instanceId: instance.id,
						caseNo: instance.caseNo,
						buyer: instance.parameters[instanceIds.buyerData],
						invoiceDate:
							instance.parameters[instanceIds.caseInvoiceDate] ?? null,
						invoiceNo: instance.parameters[instanceIds.caseInvoiceNo] ?? null,
						inspectionFee: instance.parameters[instanceIds.inspectionFee],
						invoiceTax: instance.parameters[instanceIds.invoiceTax],
						invoiceDuty: instance.parameters[instanceIds.invoiceDuty],
						invoiceTotal: instance.parameters[instanceIds.invoiceTotal],
						invoiceRemaining: instance.parameters[instanceIds.invoiceRemaining],
						inspectionType: InspectionType.Sampling,
						previousPaymentStatus:
							instance.parameters[instanceIds.paymentStatus] ??
							InvoicePaymentStatus.Unpaid,
					} as CaseData,
					null,
				);
			}

			setCaseNo("");
		} catch (err: any) {
			console.error(err);
			setError(err?.message || "خطایی رخ داد.");
		} finally {
			setSending(false);
			caseNoInp.current?.focus();
		}
	}

	return (
		<div className="col-span-3 col-start-1">
			<label htmlFor="caseNo">شماره درخواست:</label>
			<div className="mt-2 flex gap-x-2">
				<MaskInput
					className="rounded-lg text-right"
					dir="ltr"
					id="caseNo"
					mask={/^\d+$/}
					ref={caseNoInp}
					value={caseNo}
					onMutate={(v) => setCaseNo(v)}
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							e.preventDefault();
							addBtn.current?.click();
						}
					}}
				/>

				<Button
					className="w-20 shrink-0"
					disabled={!caseNo || isSending}
					ref={addBtn}
					size="lg"
					type="button"
					variant="outline"
					onClick={handleSubmit}
				>
					{isSending ? (
						<Loading horizontalPlacement="center" size="sm" />
					) : (
						"افزودن"
					)}
				</Button>
			</div>
			{error && <div className="mt-2 text-xs text-red-700">{error}</div>}
		</div>
	);
}

async function fetchInstance(caseNo: string) {
	const instances = await getInstances({
		filters: [
			{ name: "caseNo", value: caseNo },
			{
				name: "$or",
				value: [
					{
						processDefinitionKey: { $regex: "^Inspection_Case" },
					},
					{
						processDefinitionKey: { $regex: "Sampling$" },
					},
				],
			},
		],
		props: Object.values(instanceIds),
	});

	const instance = instances.at(0);

	if (!instance) {
		throw new Error("شماره درخواست مورد نظر پیدا نشد.");
	}

	if (typeof instance.parameters !== "object") {
		throw new Error();
	}

	return instance;
}

async function prepareCaseBuyer(
	caseType: CaseType,
	buyerId: string,
): Promise<CaseBuyer> {
	const buyer = await getBuyerById(buyerId);
	if (!buyer) {
		throw new Error("خریدار مورد نظر یافت نشد.");
	}

	const result: CaseBuyer = {
		id: buyer.id,
		name: buyer.name,
	};

	if (caseType === CaseType.Official) {
		result.sepidarId = buyer.sepidarId;
	}

	return result;
}

async function prepareCasePayer(
	caseType: CaseType,
	payerId: string | null,
	branchManagerId: string | null,
	customerId: string,
) {
	if (caseType === CaseType.Official) {
		return null;
	}

	const userId = branchManagerId || customerId;

	if (payerId && payerId !== userId) {
		throw new Error(
			"شماره درخواست مورد نظر از بابت پرداخت کننده دارای مغایرت است.",
		);
	}

	const user = await getUserById(userId);

	if (!user) {
		throw new Error("نماینده/مشتری مورد نظر یافت نشد.");
	}

	const payer = {
		id: user.id,
		name: user.fullname,
		sepidarId: user.sepidarId || null,
	};

	return payer;
}

async function prepareCaseData(
	caseType: CaseType | null,
	data: InstanceData,
): Promise<CaseData> {
	// validate case type
	if (caseType && data[instanceIds.caseType] !== caseType) {
		throw new Error("درخواست مورد نظر از لحاظ نوع درخواست دارای مغایرت است.");
	}

	// validate case payment status
	if (
		data[instanceIds.paymentStatus] !== InvoicePaymentStatus.Unpaid &&
		data[instanceIds.paymentStatus] !== InvoicePaymentStatus.PartiallyPaid
	) {
		throw new Error("درخواست مورد نظر در مرحله مجاز جهت ثبت وصول نمی باشد.");
	}

	// buyer
	const buyer = await prepareCaseBuyer(
		data[instanceIds.caseType],
		data[instanceIds.buyer].id,
	);

	const result: CaseData = {
		buyer: buyer,
		invoiceDate: data[instanceIds.caseInvoiceDate] ?? null,
		invoiceNo: data[instanceIds.caseInvoiceNo] ?? null,
		inspectionFee:
			data[instanceIds.inspectionFeeInRial] ?? data[instanceIds.inspectionFee],
		invoiceTax: data[instanceIds.invoiceTax],
		invoiceDuty: data[instanceIds.invoiceToll] ?? data[instanceIds.invoiceDuty],
		invoiceTotal: data[instanceIds.invoiceTotal],
		invoiceRemaining: data[instanceIds.invoiceRemaining],
	} as CaseData;

	// backward compatibility
	if (typeof result.invoiceRemaining === "undefined") {
		result.invoiceRemaining = result.invoiceTotal;
	}

	return result;
}
