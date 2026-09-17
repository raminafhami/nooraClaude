"use client";

import { useEffect, useRef, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import docxGenerator from "@/docx/docxGenerator";
import { setStageOfInstance } from "@/felo/instances/services/setStageOfInstance";
import { useTaskContext } from "@/felo/tasks/hooks/useTaskContext";
import { getTemplateString } from "@/felo/templates/services/getTemplateString";
import { getTemplateUrl } from "@/felo/templates/services/getTemplateUrl";
import { FieldError } from "@/form/FieldError";
import { Input } from "@/form/Input";
import { CaseType, caseType } from "@/inspection/models/CaseType";
import { reviewStatusOptions } from "@/inspection/models/ReviewStatus";
import Select from "@/ui/Select/Select";
import { Seperator } from "@/ui/Seperator";
import { toFarsiNum } from "@/utils/string/toFarsiNum";

import { AssigneeType } from "../../models/Assignee";
import { ids } from "../../models/Ids";
import { schema } from "./PhaseSchema";

const TEMPLATE_PATH = "inspection/lc/Certificate.html";
const TEMPLATE_KEYS =
	"Buyer,caseNo,CertificateConclusion,CertificateIssueDate,CertificateIssueNo,CertificateQualityDescription,CertificateRemarkDescription,CreditDocumentExpireDate,CreditDocumentNo,CreditDocumentStartDate,CreditNegotiatingBankBranch,CreditNegotiatingBankName,CreditOpeningBankBranch,CreditOpeningBankName,GoodsDescriptions,GoodsGrossWeight,GoodsShippingBasis,GoodsShippingDestinationSite,GoodsShippingDueDate,GoodsShippingMethod,GoodsShippingSourceSite,InspectionDate,InspectionPlace,InvoiceDate,InvoiceNo,InvoiceNoArray,ProceedingsDate,ProceedingsNo,ProformaDate,ProformaNo,Seller".split(
		",",
	);

type FormData = z.infer<typeof schema>;

export function PhasePage() {
	const { task, hooks } = useTaskContext();

	const TEMPLATE_PATH =
		task.instanceVersion <= 5
			? "inspection/lc/Certificate.html"
			: "inspection/lc/CertificateV6Plus.html";

	const { control } = useFormContext<FormData>();

	const [content, setContent] = useState<string>("");
	const iframeRef = useRef<HTMLIFrameElement | null>(null);

	useEffect(() => {
		(async () => {
			try {
				const content = await getTemplateString(
					task.instanceId,
					TEMPLATE_PATH,
					TEMPLATE_KEYS,
				);

				if (content) {
					setContent(content);
				}
			} catch (err: any) {
				console.error(err);
			}
		})();
	}, [TEMPLATE_PATH, task.instanceId]);

	useEffect(() => {
		if (hooks.get().length === 0) {
			hooks.registerHook("submit", async ({ task }) => {
				await setStageOfInstance(task.instanceId, "certificate-issuance");
			});
		}
	}, [hooks]);

	const downloadWord = () => {
		const certificateData = {
			buyer: task.data[ids.buyer].name,
			certificateConclusion: task.data[ids.certificateConclusion],
			certificateIssueDate: toFarsiNum(task.data[ids.certificateIssueDate]),
			certificateIssueNo: task.data[ids.certificateIssueNo] || "-",
			certificateQualityDescription:
				task.data[ids.certificateQualityDescription],
			certificateRemarkDescription: task.data[ids.certificateRemarkDescription],
			creditDocumentExpireDate: toFarsiNum(
				task.data[ids.creditDocumentExpireDate],
			),
			creditDocumentNo: toFarsiNum(task.data[ids.creditDocumentNo]),
			creditDocumentStartDate: toFarsiNum(
				task.data[ids.creditDocumentStartDate],
			),
			creditNegotiatingBankBranch: toFarsiNum(
				task.data[ids.creditNegotiatingBankBranch],
			),
			creditNegotiatingBankName: task.data[ids.creditNegotiatingBankName],
			creditOpeningBankBranch: toFarsiNum(
				task.data[ids.creditOpeningBankBranch],
			),
			creditOpeningBankName: task.data[ids.creditOpeningBankName],
			goodsDescriptions: task.data[ids.goodsDescriptions],
			goodsGrossWeight: toFarsiNum(task.data[ids.goodsGrossWeight]),
			goodsShippingBasis: task.data[ids.goodsShippingBasis],
			goodsShippingDestinationSite: task.data[ids.goodsShippingDestinationSite],
			goodsShippingDueDate: toFarsiNum(task.data[ids.goodsShippingDueDate]),
			goodsShippingMethod: task.data[ids.goodsShippingMethod],
			goodsShippingSourceSite: task.data[ids.goodsShippingSourceSite],
			inspectionDate: toFarsiNum(task.data[ids.inspectionDate]),
			inspectionPlace: task.data[ids.inspectionPlace],
			invoiceDate: toFarsiNum(task.data[ids.invoiceDate] ?? ""),
			invoiceNo: toFarsiNum(task.data[ids.invoiceNo] ?? ""),
			invoiceNoArray: task.data[ids.invoiceNoArray]?.map((x: any) => ({
				date: toFarsiNum(x.date),
				no: toFarsiNum(x.no),
			})),
			proceedingsDate: toFarsiNum(task.data[ids.proceedingsDate]),
			proceedingsNo: toFarsiNum(task.data[ids.proceedingsNo]),
			proformaDate: toFarsiNum(task.data[ids.proformaDate]),
			proformaNo: toFarsiNum(task.data[ids.proformaNo]),
			seller: task.data[ids.seller],
			caseNo: toFarsiNum(task.caseNo),
			showProceedings:
				task.data[ids.proceedingsDate] || task.data[ids.proceedingsNo],
			showOptionalDates:
				task.data[ids.goodsShippingDueDate] ||
				task.data[ids.creditDocumentExpireDate],
			date: toFarsiNum(new Date().toLocaleDateString("fa-IR")),
		};

		const templatePath =
			task.instanceVersion <= 5
				? "/docx/inspection/lc/Certificate.docx"
				: "/docx/inspection/lc/CertificateV6+.docx";

		docxGenerator({
			docxPath: templatePath,
			outPutFileName: `${task.caseNo} Certificate (Draft)`,
			data: certificateData,
		});
	};

	return (
		<div className="grid grid-cols-12 gap-x-10 gap-y-6">
			{task.data[ids.caseType] && (
				<div className="col-span-3 col-start-1 space-y-2">
					<div>نوع درخواست:</div>
					<Input
						defaultValue={caseType[task.data[ids.caseType] as CaseType]}
						disabled
					/>
				</div>
			)}

			{task.data[ids.assignees] && (
				<div className="col-span-3 col-start-1 space-y-2">
					<label>مشتری:</label>
					<Input
						defaultValue={task.data[ids.assignees][AssigneeType.Customer].name}
						disabled
					/>
				</div>
			)}

			<Seperator className="mt-5" />

			{task.data[ids.buyer] && (
				<div className="col-span-3 col-start-1 space-y-2">
					<label>خریدار:</label>
					<Input defaultValue={task.data[ids.buyer].name} disabled />
				</div>
			)}

			<Seperator className="my-5" />

			<div className="col-span-full">
				<div className="w-fit rounded-xl border-e-8 border-s-8 border-gray-200">
					<div className="overflow-hidden border border-gray-200">
						<iframe
							className="h-[32rem] w-a4-portrait overflow-y-auto"
							ref={iframeRef}
							srcDoc={content}
						/>
					</div>
				</div>
			</div>

			<div className="col-span-full col-start-1 flex gap-x-3">
				<Button
					className="min-w-28"
					type="button"
					onClick={() => {
						iframeRef.current?.contentWindow?.print();
					}}
				>
					پرینت
				</Button>

				<Button
					className="min-w-28"
					type="button"
					onClick={async () => {
						const link = document.createElement("a");
						link.href = getTemplateUrl(
							task.instanceId,
							TEMPLATE_PATH,
							TEMPLATE_KEYS,
							true,
						);

						link.click();
					}}
				>
					دانلود PDF
				</Button>

				<Button type="button" onClick={downloadWord}>
					دانلود Word
				</Button>
			</div>

			<Seperator className="my-5" />

			<div className="col-span-3 col-start-1 space-y-2">
				<label htmlFor={ids.certificatePreviewStatus}>وضعیت:</label>
				<Controller
					control={control}
					name={ids.certificatePreviewStatus}
					render={({ field, fieldState }) => (
						<>
							<Select items={reviewStatusOptions} {...field} />
							<FieldError error={fieldState.error} />
						</>
					)}
				/>
			</div>
		</div>
	);
}
