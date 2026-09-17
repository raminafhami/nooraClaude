"use client";

import { useEffect, useRef, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { setStageOfInstance } from "@/felo/instances/services/setStageOfInstance";
import { useTaskContext } from "@/felo/tasks/hooks/useTaskContext";
import { getTemplateString } from "@/felo/templates/services/getTemplateString";
import { getTemplateUrl } from "@/felo/templates/services/getTemplateUrl";
import { FieldError } from "@/form/FieldError";
import { Input } from "@/form/Input";
import { CaseType, caseType } from "@/inspection/models/CaseType";
import Select from "@/ui/Select/Select";
import { Seperator } from "@/ui/Seperator";

import { AssigneeType } from "../../models/Assignee";
import { ids } from "../../models/Ids";
import {
  InspectionMethod,
  inspectionMethod,
} from "../../models/InspectionMethod";
import { schema } from "./PhaseSchema";
import { reviewStatusOptions } from "./ReviewStatus";

const TEMPLATE_PATH = "inspection/ic/Certificate.html";
const TEMPLATE_KEYS =
	"caseNo,CertificateIssueNo,CertificateIssueDate,BuyerNameEn,Seller,Applicant,Shipper,ProformaNo,ProformaDate,InvoiceNo,InvoiceDate,RegistrationOrderNo,GoodsCustomTariffNos,GoodsDescriptions,InsuranceCompany,InsurancePolicyNo,DischargerName,BillOfLadingNo,BillOfLadingDate,BillOfLadingQuantity,GrossWeight,NetWeight,Packing,ShippedFrom,ShippedTo,CountryOfOrigin,InspectionPlace,InspectionDate,InspectionQualityDescription,InspectionRemarkDescription,CertificateConclusion".split(
		",",
	);

type FormData = z.infer<typeof schema>;

export function PhasePage() {
	const { task, hooks } = useTaskContext();

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
	}, [task.instanceId]);

	useEffect(() => {
		if (hooks.get().length === 0) {
			hooks.registerHook("submit", async ({ task }) => {
				await setStageOfInstance(task.instanceId, "certificate-issuance");
			});
		}
	}, [hooks]);

	return (
		<div className="grid grid-cols-12 gap-x-10 gap-y-6">
			{task.data[ids.inspectionMethod] && (
				<div className="col-span-3 col-start-1 space-y-2">
					<label>روش بازرسی:</label>
					<Input
						defaultValue={
							inspectionMethod[
								task.data[ids.inspectionMethod] as InspectionMethod
							]
						}
						disabled
					/>
				</div>
			)}

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
			</div>

			<Seperator className="my-5" />

			<div className="col-span-3 col-start-1 space-y-2">
				<label htmlFor={ids.certificateDraftPreviewStatus}>وضعیت:</label>
				<Controller
					control={control}
					name={ids.certificateDraftPreviewStatus}
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
