"use client";

import { useEffect } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { z } from "zod";

import { addWatcherToInstance } from "@/felo/instances/services/addWatcherToInstance";
import { useTaskContext } from "@/felo/tasks/hooks/useTaskContext";
import { Task } from "@/felo/tasks/models/Task";
import { DateInput } from "@/form/DateInput";
import { FieldError } from "@/form/FieldError";
import { Input } from "@/form/Input";
import { Textarea } from "@/form/textarea";
import Referrer from "@/inspection/flows/_module/referrer/Referrer";
import ReferrerNote from "@/inspection/flows/_module/referrer/ReferrerNote";
import { Seperator } from "@/ui/Seperator";
import { getTodayDate } from "@/utils/date/getTodayDate";
import { allowEnglishChars } from "@/utils/string/allowEnglishChars";

import { AssigneeType } from "../../models/Assignee";
import { ids } from "../../models/Ids";
import { schema } from "./PhaseSchema";

export type FormData = z.infer<typeof schema>;

export function PhasePage() {
	const { task, hooks, dispatch } = useTaskContext();

	const { control, resetField } = useFormContext<FormData>();

	useEffect(() => {
		dispatch({ type: "update", options: { saveBtn: true } });
	}, [dispatch]);

	useEffect(() => {
		if (!task.data[ids.certificateConclusion]) {
			resetField(ids.certificateConclusion, {
				defaultValue:
					"THE ORIGINAL INSPECTION CERTIFICATE ISSUED NOT PRIOR TO BILL OF LADING DATE BY NOORA AZMA INTERNATIONAL INSPECTION & TESTING CO. OR ITS AUTHORIZED AGENTS ON NOORA AZMA INTERNATIONAL INSPECTION & TESTING CO. LETTERHEAD CERTIFYING THAT THE GOODS SHIPPED/INSPECTED ARE IN CONFORMITY WITH THE QUALITY, AND QUANTITY AND PACKING OF THE GOODS LOADED/DELIVERED AND ARE STRICTLY COMPLYING WITH SPECIFICATIONS OF THE GOODS INDICATED IN THE RELATIVE PROFORMA INVOICE (P/I) AND THE TERMS OF THE LETTER OF CREDIT AND ALL SUBSEQUENT AMENDMENTS AS PRESENTED TO US BY THE BUYER. SUCH INSPECTION CERTIFICATE SHALL VERIFY THAT THE GOODS ARE IN CONFORMITY WITH INSO ACCEPTABLE STANDARD(S) / NORMATIVE DOCUMENT(S) AS MENTIONED IN P/I AND SHOULD BE ATTESTED BY THE LOCAL CHAMBER OF COMMERCE, WHERE IT HAS BEEN ISSUED.",
			});
		}
	}, [task.data, resetField]);

	useEffect(() => {
		if (hooks.get().length === 0) {
			hooks.registerHook(
				"submit",
				async ({ task, data }: { task: Task; data: FormData }) => {
					await addWatcherToInstance(
						task.instanceId,
						task.data[ids.assignees][AssigneeType.TechnicalExpert]?.id,
					);
				},
			);
		}
	}, [hooks]);

	return (
		<div className="grid grid-cols-12 gap-x-4 gap-y-6 md:gap-x-10">
			{task.data[ids.informationFinalReviewStatus] ? (
				<>
					<Referrer
						assigneeKey={AssigneeType.TechnicalManager}
						noteId={ids.informationFinalReviewNote}
						noteType="danger"
					/>

					<ReferrerNote
						assigneeKey={AssigneeType.Manager}
						noteId={ids.informationReviewNote}
					/>
				</>
			) : (
				<Referrer
					assigneeKey={AssigneeType.Manager}
					noteId={ids.informationReviewNote}
				/>
			)}

			<Seperator className="mt-5" />

			<div className="col-span-full !col-start-1 space-y-2 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
				<label>
					خریدار <span className="text-xs">(Buyer)</span>:
				</label>
				<Input defaultValue={task.data[ids.buyer].nameEn} disabled />
			</div>

			<Seperator className="mt-5" />

			<div className="col-span-full !col-start-1 space-y-2 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
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
					rules={{}}
				/>
			</div>

			<div className="col-span-full !col-start-1 space-y-2 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
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
								maxDate={getTodayDate()}
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

			<div className="col-span-full !col-start-1 space-y-2 md:col-span-10 lg:col-span-8 xl:col-span-6">
				<label htmlFor={ids.importer}>
					وارد کننده <span className="text-xs">(Importer)</span>:
				</label>
				<Controller
					control={control}
					name={ids.importer}
					render={({ field: { onChange, ...field }, fieldState }) => (
						<>
							<Input
								className="text-right"
								dir="ltr"
								onChange={(e) => onChange(allowEnglishChars(e, field.value))}
								{...field}
							/>
							<FieldError error={fieldState.error} />
						</>
					)}
					rules={{}}
				/>
			</div>

			<div className="col-span-full !col-start-1 space-y-2 md:col-span-10 lg:col-span-8 xl:col-span-6">
				<label htmlFor={ids.consignee}>
					گیرنده <span className="text-xs">(Consignee)</span>:
				</label>
				<Controller
					control={control}
					name={ids.consignee}
					render={({ field: { onChange, ...field }, fieldState }) => (
						<>
							<Input
								className="text-right"
								dir="ltr"
								onChange={(e) => onChange(allowEnglishChars(e, field.value))}
								{...field}
							/>
							<FieldError error={fieldState.error} />
						</>
					)}
					rules={{}}
				/>
			</div>

			<div className="col-span-full !col-start-1 space-y-2 md:col-span-10 lg:col-span-8 xl:col-span-6">
				<label htmlFor={ids.exporter}>
					صادر کننده <span className="text-xs">(Exporter)</span>:
				</label>
				<Controller
					control={control}
					name={ids.exporter}
					render={({ field: { onChange, ...field }, fieldState }) => (
						<>
							<Input
								className="text-right"
								dir="ltr"
								onChange={(e) => onChange(allowEnglishChars(e, field.value))}
								{...field}
							/>
							<FieldError error={fieldState.error} />
						</>
					)}
					rules={{}}
				/>
			</div>

			<div className="col-span-full !col-start-1 space-y-2 md:col-span-10 lg:col-span-8 xl:col-span-6">
				<label htmlFor={ids.seller}>
					فروشنده <span className="text-xs">(Seller)</span>:
				</label>
				<Controller
					control={control}
					name={ids.seller}
					render={({ field: { onChange, ...field }, fieldState }) => (
						<>
							<Input
								className="text-right"
								dir="ltr"
								onChange={(e) => onChange(allowEnglishChars(e, field.value))}
								{...field}
							/>
							<FieldError error={fieldState.error} />
						</>
					)}
					rules={{}}
				/>
			</div>

			<div className="col-span-full !col-start-1 space-y-2 md:col-span-10 lg:col-span-8 xl:col-span-6">
				<label htmlFor={ids.shipper}>
					ارسال کننده <span className="text-xs">(Shipper)</span>:
				</label>
				<Controller
					control={control}
					name={ids.shipper}
					render={({ field: { onChange, ...field }, fieldState }) => (
						<>
							<Input
								className="text-right"
								dir="ltr"
								onChange={(e) => onChange(allowEnglishChars(e, field.value))}
								{...field}
							/>
							<FieldError error={fieldState.error} />
						</>
					)}
					rules={{}}
				/>
			</div>

			<div className="col-span-full !col-start-1 space-y-2 md:col-span-10 lg:col-span-8 xl:col-span-6">
				<label htmlFor={ids.insuredBy}>
					بیمه شده توسط <span className="text-xs">(Insured by)</span>:
				</label>
				<Controller
					control={control}
					name={ids.insuredBy}
					render={({ field: { onChange, ...field }, fieldState }) => (
						<>
							<Input
								className="text-right"
								dir="ltr"
								onChange={(e) => onChange(allowEnglishChars(e, field.value))}
								{...field}
							/>
							<FieldError error={fieldState.error} />
						</>
					)}
					rules={{}}
				/>
			</div>

			<Seperator className="mt-5" />

			<div className="col-span-full !col-start-1 space-y-2 md:col-span-10 lg:col-span-8 xl:col-span-6">
				<label htmlFor={ids.manufacturer}>
					تولید کننده <span className="text-xs">(Manufacturer)</span>:
				</label>
				<Controller
					control={control}
					name={ids.manufacturer}
					render={({ field: { onChange, ...field }, fieldState }) => (
						<>
							<Input
								className="text-right"
								dir="ltr"
								onChange={(e) => onChange(allowEnglishChars(e, field.value))}
								{...field}
							/>
							<FieldError error={fieldState.error} />
						</>
					)}
					rules={{}}
				/>
			</div>

			<div className="col-span-full !col-start-1 space-y-2 md:col-span-10 lg:col-span-8 xl:col-span-6">
				<label htmlFor={ids.labName}>
					نام آزمایشگاه <span className="text-xs">(Lab Name)</span>:
				</label>
				<Controller
					control={control}
					name={ids.labName}
					render={({ field: { onChange, ...field }, fieldState }) => (
						<>
							<Input
								className="text-right"
								dir="ltr"
								onChange={(e) => onChange(allowEnglishChars(e, field.value))}
								{...field}
							/>
							<FieldError error={fieldState.error} />
						</>
					)}
					rules={{}}
				/>
			</div>

			<div className="col-span-full !col-start-1 space-y-2 md:col-span-10 lg:col-span-8 xl:col-span-6">
				<label htmlFor={ids.brand}>
					برند <span className="text-xs">(Brand)</span>:
				</label>
				<Controller
					control={control}
					name={ids.brand}
					render={({ field: { onChange, ...field }, fieldState }) => (
						<>
							<Input
								className="text-right"
								dir="ltr"
								onChange={(e) => onChange(allowEnglishChars(e, field.value))}
								{...field}
							/>
							<FieldError error={fieldState.error} />
						</>
					)}
					rules={{}}
				/>
			</div>

			<div className="col-span-full !col-start-1 space-y-2 md:col-span-10 lg:col-span-8 xl:col-span-6">
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

			<Seperator className="mt-5" />

			<div className="col-span-full !col-start-1 space-y-2 md:col-span-10 lg:col-span-8 xl:col-span-6">
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

			<div className="col-span-full !col-start-1 space-y-2 md:col-span-10 lg:col-span-8 xl:col-span-6">
				<label htmlFor={ids.testingPlace}>
					محل آزمون <span className="text-xs">(Place of Testing)</span>:
				</label>
				<Controller
					control={control}
					name={ids.testingPlace}
					render={({ field: { onChange, ...field }, fieldState }) => (
						<>
							<Input
								className="text-right"
								dir="ltr"
								onChange={(e) => onChange(allowEnglishChars(e, field.value))}
								{...field}
							/>
							<FieldError error={fieldState.error} />
						</>
					)}
					rules={{}}
				/>
			</div>

			<div className="col-span-full !col-start-1 space-y-2 md:col-span-10 lg:col-span-8 xl:col-span-6">
				<label htmlFor={ids.inspectorName}>
					نام بازرس <span className="text-xs">(Inspector Name)</span>:
				</label>
				<Controller
					control={control}
					name={ids.inspectorName}
					render={({ field: { onChange, ...field }, fieldState }) => (
						<>
							<Input
								className="text-right"
								dir="ltr"
								onChange={(e) => onChange(allowEnglishChars(e, field.value))}
								{...field}
							/>
							<FieldError error={fieldState.error} />
						</>
					)}
					rules={{}}
				/>
			</div>

			<div className="col-span-full !col-start-1 space-y-2 md:col-span-10 lg:col-span-8 xl:col-span-6">
				<label htmlFor={ids.portOfEntry}>
					بندر ورودی <span className="text-xs">(Port of Entry)</span>:
				</label>
				<Controller
					control={control}
					name={ids.portOfEntry}
					render={({ field: { onChange, ...field }, fieldState }) => (
						<>
							<Input
								className="text-right"
								dir="ltr"
								onChange={(e) => onChange(allowEnglishChars(e, field.value))}
								{...field}
							/>
							<FieldError error={fieldState.error} />
						</>
					)}
					rules={{}}
				/>
			</div>

			<div className="col-span-full !col-start-1 space-y-2 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
				<label htmlFor={ids.lcNo}>
					شماره L/C{" "}
					<span className="text-right text-xs" dir="ltr">
						(L/C No.)
					</span>
					:
				</label>
				<Controller
					control={control}
					name={ids.lcNo}
					render={({ field: { onChange, ...field }, fieldState }) => (
						<>
							<Input
								className="text-right"
								dir="ltr"
								onChange={(e) => onChange(allowEnglishChars(e, field.value))}
								{...field}
							/>
							<FieldError error={fieldState.error} />
						</>
					)}
					rules={{}}
				/>
			</div>

			<Seperator className="mt-5" />

			<div className="col-span-full !col-start-1 space-y-2 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
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
					render={({ field: { onChange, ...field }, fieldState }) => (
						<>
							<Input
								className="text-right"
								dir="ltr"
								onChange={(e) => onChange(allowEnglishChars(e, field.value))}
								{...field}
							/>
							<FieldError error={fieldState.error} />
						</>
					)}
					rules={{}}
				/>
			</div>

			<div className="col-span-full !col-start-1 space-y-2 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
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
								maxDate={getTodayDate()}
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

			<div className="col-span-full !col-start-1 space-y-2 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
				<label htmlFor={ids.packing}>
					نوع بسته بندی <span className="text-xs">(Type of Packing)</span>:
				</label>
				<Controller
					control={control}
					name={ids.packing}
					render={({ field: { onChange, ...field }, fieldState }) => (
						<>
							<Input
								className="text-right"
								dir="ltr"
								onChange={(e) => onChange(allowEnglishChars(e, field.value))}
								{...field}
							/>
							<FieldError error={fieldState.error} />
						</>
					)}
					rules={{}}
				/>
			</div>

			<div className="col-span-full !col-start-1 space-y-2 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
				<label htmlFor={ids.quantityTested}>
					مقدار آزمون شده <span className="text-xs">(Quantity Tested)</span>:
				</label>
				<Controller
					control={control}
					name={ids.quantityTested}
					render={({ field: { onChange, ...field }, fieldState }) => (
						<>
							<Input
								className="text-right"
								dir="ltr"
								onChange={(e) => onChange(allowEnglishChars(e, field.value))}
								{...field}
							/>
							<FieldError error={fieldState.error} />
						</>
					)}
					rules={{}}
				/>
			</div>

			<div className="col-span-full !col-start-1 space-y-2 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
				<label htmlFor={ids.quantityShipped}>
					مقدار ارسال شده <span className="text-xs">(Quantity Shipped)</span>:
				</label>
				<Controller
					control={control}
					name={ids.quantityShipped}
					render={({ field: { onChange, ...field }, fieldState }) => (
						<>
							<Input
								className="text-right"
								dir="ltr"
								onChange={(e) => onChange(allowEnglishChars(e, field.value))}
								{...field}
							/>
							<FieldError error={fieldState.error} />
						</>
					)}
					rules={{}}
				/>
			</div>

			<div className="col-span-full !col-start-1 space-y-2 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
				<label htmlFor={ids.grossWeight}>
					وزن ناخالص <span className="text-xs">(Gross Weight)</span>:
				</label>
				<Controller
					control={control}
					name={ids.grossWeight}
					render={({ field: { onChange, ...field }, fieldState }) => (
						<>
							<Input
								className="text-right"
								dir="ltr"
								onChange={(e) => onChange(allowEnglishChars(e, field.value))}
								{...field}
							/>
							<FieldError error={fieldState.error} />
						</>
					)}
					rules={{}}
				/>
			</div>

			<div className="col-span-full !col-start-1 space-y-2 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
				<label htmlFor={ids.netWeight}>
					وزن خالص <span className="text-xs">(Net Weight)</span>:
				</label>
				<Controller
					control={control}
					name={ids.netWeight}
					render={({ field: { onChange, ...field }, fieldState }) => (
						<>
							<Input
								className="text-right"
								dir="ltr"
								onChange={(e) => onChange(allowEnglishChars(e, field.value))}
								{...field}
							/>
							<FieldError error={fieldState.error} />
						</>
					)}
					rules={{}}
				/>
			</div>

			<Seperator className="mt-5" />

			<div className="col-span-full space-y-2">
				<label htmlFor={ids.certificateConclusion}>
					نتیجه گواهی <span className="text-xs">(Certificate Conclusion)</span>:
				</label>
				<Controller
					control={control}
					name={ids.certificateConclusion}
					render={({ field: { onChange, ...field }, fieldState }) => (
						<>
							<Textarea
								dir="ltr"
								onChange={(e) => onChange(allowEnglishChars(e, field.value))}
								{...field}
							/>
							<FieldError error={fieldState.error} />
						</>
					)}
					rules={{}}
				/>
			</div>

			<Seperator className="mt-5" />

			<div className="col-span-full space-y-2">
				<label htmlFor={ids.certificateFormByAdminNote}>توضیحات:</label>
				<Controller
					control={control}
					name={ids.certificateFormByAdminNote}
					render={({ field }) => <Textarea {...field} />}
				/>
			</div>
		</div>
	);
}
