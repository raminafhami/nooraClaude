"use client";

import { useEffect } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { z } from "zod";

import { useTaskContext } from "@/felo/tasks/hooks/useTaskContext";
import { isFieldInTaskForm } from "@/felo/tasks/utils/isFieldInTaskForm";
import { DateInput } from "@/form/DateInput";
import { FieldError } from "@/form/FieldError";
import { Input } from "@/form/Input";
import { Textarea } from "@/form/textarea";
import Referrer from "@/inspection/flows/_module/referrer/Referrer";
import ReferrerNote from "@/inspection/flows/_module/referrer/ReferrerNote";
import { messages } from "@/messages";
import { Seperator } from "@/ui/Seperator";

import { AssigneeType } from "../../models/Assignee";
import { ids } from "../../models/Ids";
import GoodsList from "./_module/GoodsList";
import { schema } from "./PhaseSchema";

export type FormData = z.infer<typeof schema>;

export function PhasePage() {
	const { task, hooks, dispatch } = useTaskContext();

	const { control, register, resetField } = useFormContext<FormData>();

	useEffect(() => {
		dispatch({ type: "update", options: { saveBtn: true } });
	}, [dispatch]);

	useEffect(() => {
		register(ids.certificateIssueDate);
		register(ids.certificateIssueNo);
	}, [register]);

	useEffect(() => {
		if (!task.data[ids.certificateConclusion]) {
			resetField(ids.certificateConclusion, {
				defaultValue:
					"THE ORIGINAL INSPECTION CERTIFICATE ISSUED NOT PRIOR TO BILL OF LADING DATE BY NOORA AZMA INTERNATIONAL INSPECTION & TESTING CO. OR ITS AUTHORIZED AGENTS ON NOORA AZMA INTERNATIONAL INSPECTION & TESTING CO. LETTER HEAD CERTIFYING THAT THE GOODS SHIPPED/INSPECTED ARE IN CONFORMITY WITH THE QUALITY, QUANTITY AND PACKING OF THE GOODS LOADED/DELIVERED AND ARE STRICTLY COMPLYING WITH SPECIFICATIONS OF THE GOODS INDICATED IN THE RELATIVE PROFORMA INVOICE (P/I) AND THE TERMS OF THE LETTER OF CREDIT AND ALL SUBSEQUENT AMENDMENTS AS PRESENTED TO US BY THE BUYER. SUCH INSPECTION CERTIFICATE SHALL VERIFY THAT THE GOODS ARE IN CONFORMITY WITH INSO ACCEPTABLE STANDARD(S) / NORMATIVE DOCUMENT(S) AS MENTIONED IN P/I AND SHOULD BE ATTESTED BY THE LOCAL CHAMBER OF COMMERCE, WHERE IT HAS BEEN ISSUED.",
			});
		}
	}, [task.data, resetField]);

	useEffect(() => {
		if (hooks.get().length === 0) {
			hooks.registerHook("pre-submit", ({ data }: { data: FormData }) => {
				// set certificate fields
				data[ids.certificateIssueDate] = null;
				data[ids.certificateIssueNo] = null;

				// set optional fields' values
				!data[ids.testDateEnd] && (data[ids.testDateEnd] = "");
				!data[ids.inspectionDateEnd] && (data[ids.inspectionDateEnd] = "");
				!data[ids.grossWeight] && (data[ids.grossWeight] = "");
			});
		}
	}, [hooks]);

	return (
		<>
			<div className="grid grid-cols-12 gap-x-10 gap-y-6">
				{task.data[ids.certificateReviewStatus] ? (
					<>
						<Referrer
							assigneeKey={AssigneeType.Manager}
							noteId={ids.certificateReviewNote}
							noteType="danger"
						/>

						<ReferrerNote
							assigneeKey={AssigneeType.Manager}
							noteId={ids.initialReviewNote}
						/>
					</>
				) : (
					<Referrer
						assigneeKey={AssigneeType.Manager}
						noteId={ids.initialReviewNote}
					/>
				)}

				<Seperator className="mt-5" />

				<div className="col-span-3 col-start-1 space-y-2">
					<label>
						خریدار <span className="text-xs">(Buyer)</span>:
					</label>
					<Input defaultValue={task.data[ids.buyer].nameEn} disabled />
				</div>

				<Seperator className="mt-5" />

				<div className="col-span-3 col-start-1 space-y-2">
					<label htmlFor={ids.proformaNo}>
						شماره پروفرما{" "}
						<span className="text-xs" dir="ltr">
							(Proforma No.)
						</span>
						:
					</label>
					<Controller
						control={control}
						name={ids.proformaNo}
						render={({ field, fieldState }) => (
							<>
								<Input className="text-right" dir="ltr" {...field} />
								<FieldError error={fieldState.error} />
							</>
						)}
						rules={{ required: messages.validation.required }}
					/>
				</div>

				<div className="col-span-3 col-start-1 space-y-2">
					<label htmlFor={ids.proformaDate}>
						تاریخ پروفرما <span className="text-xs">(Proforma Date)</span>:
					</label>
					<Controller
						control={control}
						name={ids.proformaDate}
						render={({
							field: { name, value, onBlur, onChange },
							fieldState,
						}) => (
							<>
								<DateInput
									calendarType="gregorian"
									id={name}
									lang="en"
									value={value}
									onLeave={onBlur}
									onMutate={onChange}
								/>
								<FieldError error={fieldState.error} />
							</>
						)}
						rules={{ required: messages.validation.required }}
					/>
				</div>

				<div className="col-span-3 col-start-1 space-y-2">
					<label htmlFor={ids.registrationOrderNo}>
						شماره ثبت سفارش{" "}
						<span className="text-xs" dir="ltr">
							(Registration Order No.)
						</span>
						:
					</label>
					<Controller
						control={control}
						name={ids.registrationOrderNo}
						render={({ field, fieldState }) => (
							<>
								<Input className="text-right" dir="ltr" {...field} />
								<FieldError error={fieldState.error} />
							</>
						)}
						rules={{ required: messages.validation.required }}
					/>
				</div>

				<Seperator className="mt-5" />

				<div className="col-span-3 col-start-1 space-y-2">
					<label htmlFor={ids.importer}>
						وارد کننده <span className="text-xs">(Importer)</span>:
					</label>
					<Controller
						control={control}
						name={ids.importer}
						render={({ field, fieldState }) => (
							<>
								<Input className="text-right" dir="ltr" {...field} />
								<FieldError error={fieldState.error} />
							</>
						)}
						rules={{ required: messages.validation.required }}
					/>
				</div>

				<div className="col-span-3 col-start-1 space-y-2">
					<label htmlFor={ids.consignee}>
						گیرنده <span className="text-xs">(Consignee)</span>:
					</label>
					<Controller
						control={control}
						name={ids.consignee}
						render={({ field, fieldState }) => (
							<>
								<Input className="text-right" dir="ltr" {...field} />
								<FieldError error={fieldState.error} />
							</>
						)}
						rules={{ required: messages.validation.required }}
					/>
				</div>

				<div className="col-span-3 col-start-1 space-y-2">
					<label htmlFor={ids.exporter}>
						صادر کننده <span className="text-xs">(Exporter)</span>:
					</label>
					<Controller
						control={control}
						name={ids.exporter}
						render={({ field, fieldState }) => (
							<>
								<Input className="text-right" dir="ltr" {...field} />
								<FieldError error={fieldState.error} />
							</>
						)}
						rules={{ required: messages.validation.required }}
					/>
				</div>

				<div className="col-span-3 col-start-1 space-y-2">
					<label htmlFor={ids.shipper}>
						ارسال کننده <span className="text-xs">(Shipper)</span>:
					</label>
					<Controller
						control={control}
						name={ids.shipper}
						render={({ field, fieldState }) => (
							<>
								<Input className="text-right" dir="ltr" {...field} />
								<FieldError error={fieldState.error} />
							</>
						)}
						rules={{ required: messages.validation.required }}
					/>
				</div>

				<Seperator className="mt-5" />

				<div className="col-span-3 col-start-1 space-y-2">
					<label htmlFor={ids.samplingDate}>
						تاریخ نمونه گیری <span className="text-xs">(Sampling Date)</span>:
					</label>
					<Controller
						control={control}
						name={ids.samplingDate}
						render={({
							field: { name, value, onBlur, onChange },
							fieldState,
						}) => (
							<>
								<DateInput
									calendarType="gregorian"
									id={name}
									lang="en"
									value={value}
									onLeave={onBlur}
									onMutate={onChange}
								/>
								<FieldError error={fieldState.error} />
							</>
						)}
						rules={{ required: messages.validation.required }}
					/>
				</div>

				<div className="col-span-3 col-start-1 space-y-2">
					<label htmlFor={ids.testDateStart}>
						تاریخ شروع تست <span className="text-xs">(Test Start Date)</span>:
					</label>
					<Controller
						control={control}
						name={ids.testDateStart}
						render={({
							field: { name, value, onBlur, onChange },
							fieldState,
						}) => (
							<>
								<DateInput
									calendarType="gregorian"
									id={name}
									lang="en"
									value={value}
									onLeave={onBlur}
									onMutate={onChange}
								/>
								<FieldError error={fieldState.error} />
							</>
						)}
						rules={{ required: messages.validation.required }}
					/>
				</div>

				<div className="col-span-3 col-start-1 space-y-2">
					<label htmlFor={ids.testDateEnd}>
						تاریخ پایان تست <span className="text-xs">(Test End Date)</span>:
					</label>
					<Controller
						control={control}
						name={ids.testDateEnd}
						render={({
							field: { name, value, onBlur, onChange },
							fieldState,
						}) => (
							<>
								<DateInput
									calendarType="gregorian"
									id={name}
									lang="en"
									value={value}
									onLeave={onBlur}
									onMutate={onChange}
								/>
								<FieldError error={fieldState.error} />
							</>
						)}
						rules={{}}
					/>
				</div>

				<div className="col-span-3 col-start-1 space-y-2">
					<label htmlFor={ids.inspectionDateStart}>
						تاریخ شروع بازرسی{" "}
						<span className="text-xs">(Inspection Start Date)</span>:
					</label>
					<Controller
						control={control}
						name={ids.inspectionDateStart}
						render={({
							field: { name, value, onBlur, onChange },
							fieldState,
						}) => (
							<>
								<DateInput
									calendarType="gregorian"
									id={name}
									lang="en"
									value={value}
									onLeave={onBlur}
									onMutate={onChange}
								/>
								<FieldError error={fieldState.error} />
							</>
						)}
						rules={{ required: messages.validation.required }}
					/>
				</div>

				<div className="col-span-3 col-start-1 space-y-2">
					<label htmlFor={ids.inspectionDateEnd}>
						تاریخ پایان بازرسی{" "}
						<span className="text-xs">(Inspection End Date)</span>:
					</label>
					<Controller
						control={control}
						name={ids.inspectionDateEnd}
						render={({
							field: { name, value, onBlur, onChange },
							fieldState,
						}) => (
							<>
								<DateInput
									calendarType="gregorian"
									id={name}
									lang="en"
									value={value}
									onLeave={onBlur}
									onMutate={onChange}
								/>
								<FieldError error={fieldState.error} />
							</>
						)}
						rules={{}}
					/>
				</div>

				<Seperator className="mt-5" />

				{isFieldInTaskForm(task, ids.goodsCustomTariffNos) && (
					<div className="col-span-4 col-start-1 space-y-2">
						<label htmlFor={ids.goodsCustomTariffNos}>
							شماره تعرفه گمرکی کالاها:
						</label>
						<Controller
							control={control}
							name={ids.goodsCustomTariffNos}
							render={({ field, fieldState }) => (
								<>
									<Input className="text-right" dir="ltr" {...field} />
									<FieldError error={fieldState.error} />
								</>
							)}
							rules={{ required: messages.validation.required }}
						/>
					</div>
				)}

				{isFieldInTaskForm(task, ids.goodsDescriptions) && (
					<div className="col-span-6 col-start-1 space-y-2">
						<label htmlFor={ids.goodsDescriptions}>شرح کالاها:</label>
						<Controller
							control={control}
							name={ids.goodsDescriptions}
							render={({ field, fieldState }) => (
								<>
									<Input className="text-right" dir="ltr" {...field} />
									<FieldError error={fieldState.error} />
								</>
							)}
							rules={{
								required: messages.validation.required,
							}}
						/>
					</div>
				)}

				<GoodsList />

				<Seperator className="mt-5" />

				<div className="col-span-3 col-start-1 space-y-2">
					<label>
						کشور مبدأ <span className="text-xs">(Country of Origin)</span>:
					</label>
					<Input
						className="text-right"
						defaultValue={task.data[ids.countryOfOrigin]}
						dir="ltr"
						disabled
					/>
				</div>

				<div className="col-span-3 col-start-1 space-y-2">
					<label>
						محل بازرسی <span className="text-xs">(Place of Inspection)</span>:
					</label>
					<Input
						className="text-right"
						defaultValue={task.data[ids.inspectionPlace]}
						dir="ltr"
						disabled
					/>
				</div>

				<div className="col-span-3 col-start-1 space-y-2">
					<label htmlFor={ids.portOfEntry}>
						بندر ورودی <span className="text-xs">(Port of Entry)</span>:
					</label>
					<Controller
						control={control}
						name={ids.portOfEntry}
						render={({ field, fieldState }) => (
							<>
								<Input className="text-right" dir="ltr" {...field} />
								<FieldError error={fieldState.error} />
							</>
						)}
						rules={{ required: messages.validation.required }}
					/>
				</div>

				<Seperator className="mt-5" />

				<div className="col-span-3 col-start-1 space-y-2">
					<label htmlFor={ids.billOfLadingNo}>
						شماره بارنامه{" "}
						<span className="text-xs" dir="ltr">
							(B/L No.)
						</span>
						:
					</label>
					<Controller
						control={control}
						name={ids.billOfLadingNo}
						render={({ field, fieldState }) => (
							<>
								<Input className="text-right" dir="ltr" {...field} />
								<FieldError error={fieldState.error} />
							</>
						)}
						rules={{ required: messages.validation.required }}
					/>
				</div>

				<div className="col-span-3 col-start-1 space-y-2">
					<label htmlFor={ids.billOfLadingDate}>
						تاریخ بارنامه <span className="text-xs">(B/L Date)</span>:
					</label>
					<Controller
						control={control}
						name={ids.billOfLadingDate}
						render={({
							field: { name, value, onBlur, onChange },
							fieldState,
						}) => (
							<>
								<DateInput
									calendarType="gregorian"
									id={name}
									lang="en"
									value={value}
									onLeave={onBlur}
									onMutate={onChange}
								/>
								<FieldError error={fieldState.error} />
							</>
						)}
						rules={{ required: messages.validation.required }}
					/>
				</div>

				<div className="col-span-3 col-start-1 space-y-2">
					<label htmlFor={ids.grossWeight}>
						وزن ناخالص <span className="text-xs">(Gross Weight)</span>:
					</label>
					<Controller
						control={control}
						name={ids.grossWeight}
						render={({ field, fieldState }) => (
							<>
								<Input className="text-right" dir="ltr" {...field} />
								<FieldError error={fieldState.error} />
							</>
						)}
						rules={{}}
					/>
				</div>

				<Seperator className="mt-5" />

				<div className="col-span-full col-start-1 space-y-2">
					<label htmlFor={ids.certificateConclusion}>
						نتیجه گواهی{" "}
						<span className="text-xs">(Certificate Conclusion)</span>:
					</label>
					<Controller
						control={control}
						name={ids.certificateConclusion}
						render={({ field, fieldState }) => (
							<>
								<Textarea dir="ltr" {...field} />
								<FieldError error={fieldState.error} />
							</>
						)}
						rules={{ required: messages.validation.required }}
					/>
				</div>

				<Seperator className="mt-5" />

				<div className="col-span-full col-start-1 space-y-2">
					<label htmlFor={ids.certificateFormNote}>توضیحات:</label>
					<Controller
						control={control}
						name={ids.certificateFormNote}
						render={({ field }) => <Textarea {...field} />}
					/>
				</div>
			</div>
		</>
	);
}
