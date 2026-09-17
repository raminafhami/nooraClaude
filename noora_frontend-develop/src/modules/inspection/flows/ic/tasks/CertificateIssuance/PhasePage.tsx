"use client";

import moment from "jalali-moment";
import { useEffect } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { z } from "zod";

import { setStageOfInstance } from "@/felo/instances/services/setStageOfInstance";
import { useTaskContext } from "@/felo/tasks/hooks/useTaskContext";
import { FieldError } from "@/form/FieldError";
import { Input } from "@/form/Input";
import { Textarea } from "@/form/textarea";
import { getIndicatorCounterByKey } from "@/indicator/services/getIndicatorCounterByKey";
import Referrer from "@/inspection/flows/_module/referrer/Referrer";
import { CaseType, caseType } from "@/inspection/models/CaseType";
import { checkCoordinatorAndCustomerBalance } from "@/inspection/services/checkCoordinatorAndCustomerBalance";
import { messages } from "@/messages";
import { routes } from "@/routes";
import Select from "@/ui/Select/Select";
import { Seperator } from "@/ui/Seperator";

import { assigneesTemplate, AssigneeType } from "../../models/Assignee";
import {
  CertificateReviewStatus,
  certificateReviewStatuses,
} from "../../models/CertificateReviewStatus";
import { ids } from "../../models/Ids";
import {
  InspectionMethod,
  inspectionMethod,
} from "../../models/InspectionMethod";
import { schema } from "./PhaseSchema";

type FormData = z.infer<typeof schema>;

export function PhasePage() {
	const { task, hooks } = useTaskContext();

	const { control, register, resetField, watch } = useFormContext<FormData>();

	const { [ids.certificateIssuanceStatus]: reviewStatus } = watch();

	function getTemplateUrl(download: boolean): string {
		return new URL(
			`/files/${
				task.instanceId
			}/export/vars/caseNo,CertificateIssueNo,CertificateIssueDate,BuyerNameEn,Seller,Applicant,Shipper,ProformaNo,ProformaDate,InvoiceNo,InvoiceDate,RegistrationOrderNo,GoodsCustomTariffNos,GoodsDescriptions,InsuranceCompany,InsurancePolicyNo,DischargerName,BillOfLadingNo,BillOfLadingDate,BillOfLadingQuantity,GrossWeight,NetWeight,Packing,ShippedFrom,ShippedTo,CountryOfOrigin,InspectionPlace,InspectionDate,InspectionQualityDescription,InspectionRemarkDescription,CertificateConclusion?template=inspection/ic/Certificate.html&download=${
				download ? "1" : "0"
			}`,
			routes.externalApi,
		).toString();
	}

	useEffect(() => {
		register(ids.certificateIssuanceNote);
		register(ids.certificateIssueDate);
		register(ids.certificateIssueNo);
	}, [register]);

	useEffect(() => {
		if (reviewStatus === CertificateReviewStatus.Confirm) {
			resetField(ids.certificateIssuanceNote, { defaultValue: "" });
		}
	}, [reviewStatus, resetField]);

	useEffect(() => {
		if (hooks.get().length === 0) {
			hooks.registerHook("pre-submit", async ({ task, data }) => {
				if (
					data[ids.certificateIssuanceStatus] ===
					CertificateReviewStatus.Confirm
				) {
					await checkCoordinatorAndCustomerBalance(task);

					data[ids.certificateIssueDate] = moment().format("YYYY-MM-DD");
					data[ids.certificateIssueNo] =
						await getIndicatorCounterByKey("ic-certificate");
				}
			});

			hooks.registerHook("submit", async ({ task, data }) => {
				if (
					data[ids.certificateIssuanceStatus] ===
					CertificateReviewStatus.Confirm
				) {
					await setStageOfInstance(task.instanceId, "certificate-issued");
				}
			});
		}
	}, [hooks]);

	return (
		<>
			<div className="grid grid-cols-12 gap-x-10 gap-y-6">
				<Referrer
					assigneeKey={AssigneeType.TechnicalExpert}
					noteId={ids.certificateFormNote}
					title={assigneesTemplate[AssigneeType.TechnicalExpert]}
				/>

				<Seperator className="mt-5" />

				{task.data[ids.inspectionMethod] && (
					<div className="col-span-3 col-start-1 space-y-2">
						<label htmlFor={ids.buyerNameEn}>روش بازرسی:</label>
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
							defaultValue={
								task.data[ids.assignees][AssigneeType.Customer].name
							}
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
								src={getTemplateUrl(false)}
							></iframe>
						</div>
					</div>
				</div>

				<Seperator className="mt-5" />

				<div className="col-span-3 col-start-1 space-y-2">
					<label htmlFor={ids.certificateIssuanceStatus}>نتیجه بررسی:</label>
					<Controller
						control={control}
						name={ids.certificateIssuanceStatus}
						render={({ field, fieldState }) => (
							<>
								<Select<CertificateReviewStatus>
									items={certificateReviewStatuses}
									{...field}
								/>
								<FieldError error={fieldState.error} />
							</>
						)}
						rules={{
							deps: [ids.certificateIssuanceNote],
							required: messages.validation.required,
						}}
					/>
				</div>

				{reviewStatus === CertificateReviewStatus.Return && (
					<div className="col-span-full space-y-2">
						<label htmlFor={ids.certificateIssuanceNote}>توضیحات بررسی:</label>
						<Controller
							control={control}
							name={ids.certificateIssuanceNote}
							render={({ field, fieldState }) => (
								<>
									<Textarea {...field} />
									<FieldError error={fieldState.error} />
								</>
							)}
							rules={{
								required:
									reviewStatus === CertificateReviewStatus.Return &&
									messages.validation.required,
							}}
						/>
					</div>
				)}
			</div>
		</>
	);
}
