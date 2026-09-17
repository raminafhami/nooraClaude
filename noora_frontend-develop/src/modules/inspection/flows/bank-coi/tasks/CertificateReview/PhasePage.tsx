"use client";

import moment from "jalali-moment";
import { useEffect, useRef, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { setStageOfInstance } from "@/felo/instances/services/setStageOfInstance";
import { useTaskContext } from "@/felo/tasks/hooks/useTaskContext";
import { getTemplateString } from "@/felo/templates/services/getTemplateString";
import { getTemplateUrl } from "@/felo/templates/services/getTemplateUrl";
import { FieldError } from "@/form/FieldError";
import { Textarea } from "@/form/textarea";
import { getIndicatorCounterByKey } from "@/indicator/services/getIndicatorCounterByKey";
import Referrer from "@/inspection/flows/_module/referrer/Referrer";
import { checkCoordinatorAndCustomerBalance } from "@/inspection/services/checkCoordinatorAndCustomerBalance";
import { messages } from "@/messages";
import Select from "@/ui/Select/Select";
import { Seperator } from "@/ui/Seperator";

import { assigneesTemplate, AssigneeType } from "../../models/Assignee";
import {
  ReviewStatus,
  reviewStatusOptions,
} from "../../models/CertificateReviewStatus";
import { ids } from "../../models/Ids";
import { schema } from "./PhaseSchema";

type FormData = z.infer<typeof schema>;

const TEMPLATE_PATH = "inspection/bank-coi/Certificate.html";
const TEMPLATE_KEYS =
	"caseNo,BillOfLadingDate,BillOfLadingNo,CertificateConclusion,CertificateIssueDate,CertificateIssueNo,Consignee,CountryOfOrigin,Goods,GrossWeight,Exporter,InspectionDateEnd,InspectionDateStart,InspectionPlace,Importer,PortOfEntry,ProformaNo,ProformaDate,RegistrationOrderNo,SamplingDate,Shipper,TestDateEnd,TestDateStart".split(
		",",
	);

export function PhasePage() {
	const { task, hooks } = useTaskContext();

	const { control, register, resetField, watch } = useFormContext<FormData>();

	const { [ids.certificateReviewStatus]: reviewStatus } = watch();

	const [content, setContent] = useState<string>("");
	const iframeRef = useRef<HTMLIFrameElement | null>(null);

	useEffect(() => {
		register(ids.certificateIssueDate);
		register(ids.certificateIssueNo);
	}, [register]);

	useEffect(() => {
		if (reviewStatus === ReviewStatus.Confirm) {
			resetField(ids.certificateReviewNote, { defaultValue: "" });
		}
	}, [reviewStatus, resetField]);

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
			hooks.registerHook("pre-submit", async ({ task, data }) => {
				if (data[ids.certificateReviewStatus] === ReviewStatus.Confirm) {
					await checkCoordinatorAndCustomerBalance(task);

					data[ids.certificateIssueDate] = moment().format("YYYY-MM-DD");
					data[ids.certificateIssueNo] =
						await getIndicatorCounterByKey("ic-certificate");
				}
			});

			hooks.registerHook("submit", async ({ task, data }) => {
				if (data[ids.certificateReviewStatus] === ReviewStatus.Confirm) {
					await setStageOfInstance(task.instanceId, "certificate-issued");
				}
			});
		}
	}, [hooks]);

	return (
		<>
			<div className="grid grid-cols-12 gap-x-10 gap-y-6">
				<Referrer
					assigneeKey={AssigneeType.Expert}
					noteId={ids.certificateFormNote}
					title={assigneesTemplate[AssigneeType.Expert]}
				/>

				<Seperator className="my-5" />

				<div className="col-span-full">
					<div className="w-fit rounded-xl border-e-8 border-s-8 border-gray-200">
						<div className="overflow-hidden border border-gray-200">
							<iframe
								className="h-[32rem] w-a4-portrait overflow-y-auto"
								ref={iframeRef}
								srcDoc={content}
							></iframe>
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
						دانلود
					</Button>
				</div>

				<Seperator className="mt-5" />

				<div className="col-span-3 col-start-1">
					<label htmlFor={ids.certificateReviewStatus}>نتیجه بررسی:</label>
					<div className="mt-2">
						<Controller
							control={control}
							name={ids.certificateReviewStatus}
							render={({ field, fieldState }) => (
								<>
									<Select items={reviewStatusOptions} {...field} />
									<FieldError error={fieldState.error} />
								</>
							)}
							rules={{
								deps: [ids.certificateReviewNote],
								required: messages.validation.required,
							}}
						/>
					</div>
				</div>

				{reviewStatus === ReviewStatus.Return && (
					<div className="col-span-full">
						<label htmlFor={ids.certificateReviewNote}>توضیحات بررسی:</label>
						<div className="mt-2">
							<Controller
								control={control}
								name={ids.certificateReviewNote}
								render={({ field, fieldState }) => (
									<>
										<Textarea {...field} />
										<FieldError error={fieldState.error} />
									</>
								)}
								rules={{
									required:
										reviewStatus === ReviewStatus.Return &&
										messages.validation.required,
								}}
							/>
						</div>
					</div>
				)}
			</div>
		</>
	);
}
