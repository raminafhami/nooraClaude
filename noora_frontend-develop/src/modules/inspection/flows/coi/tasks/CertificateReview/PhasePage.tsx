"use client";

import { useEffect } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { z } from "zod";

import { customs } from "@/data/customs";
import { addWatcherToInstance } from "@/felo/instances/services/addWatcherToInstance";
import { useTaskContext } from "@/felo/tasks/hooks/useTaskContext";
import { Task } from "@/felo/tasks/models/Task";
import { DateInput } from "@/form/DateInput";
import { FieldError } from "@/form/FieldError";
import { Input } from "@/form/Input";
import { Textarea } from "@/form/textarea";
import PreviousTaskReferrer from "@/inspection/flows/_module/referrer/PreviousTaskReferrer";
import Referrer from "@/inspection/flows/_module/referrer/Referrer";
import { CaseType, caseType } from "@/inspection/models/CaseType";
import {
  ReviewStatus,
  reviewStatusOptions,
} from "@/inspection/models/ReviewStatus";
import { messages } from "@/messages";
import Select from "@/ui/Select/Select";
import { Seperator } from "@/ui/Seperator";
import { getTodayDate } from "@/utils/date/getTodayDate";
import { allowEnglishChars } from "@/utils/string/allowEnglishChars";

import { assigneesTemplate, AssigneeType } from "../../models/Assignee";
import { ids } from "../../models/Ids";
import {
  InspectionMethod,
  inspectionMethod,
} from "../../models/InspectionMethod";
import { validateDatesOrder } from "../../utils/validateDatesOrder";
import { validateSamplingToIssueDate } from "../../utils/validateSamplingToIssueDate";
import { validateUniqueBlNo } from "../../utils/validateUniqueBlNo";
import { validateWeekdayIssueDate } from "../../utils/validateWeekdayIssueDate";
import GoodsList from "../_components/GoodsList";
import { schema } from "./PhaseSchema";

type FormData = z.infer<typeof schema>;

export function PhasePage() {
	const { task, hooks, dispatch } = useTaskContext();

	const { control, watch } = useFormContext<FormData>();

	const { [ids.certificateReviewStatus]: reviewStatus } = watch();

	const requiredOnSubmit =
		reviewStatus !== ReviewStatus.Return && messages.validation.required;

	useEffect(() => {
		dispatch({ type: "update", options: { saveBtn: true } });
	}, [dispatch]);

	useEffect(() => {
		if (hooks.get().length === 0) {
			hooks.registerHook(
				"pre-submit",
				async ({ task, data }: { task: Task; data: FormData }) => {
					if (data[ids.certificateReviewStatus] === ReviewStatus.Return) {
						// set previous task
						data[ids.previousTask] = {
							taskKey: task.key,
							assigneeKey: AssigneeType.SeniorExpert,
							assigneeTitle: assigneesTemplate[AssigneeType.SeniorExpert],
							noteContent: data[ids.certificateReviewNote],
							noteType: "danger",
						};
					} else {
						// validate dates
						validateDatesOrder(task.data[ids.inspectionMethod], data);
						validateWeekdayIssueDate(data);
						validateSamplingToIssueDate(data);

						// validate b/l no. uniqueness
						await validateUniqueBlNo(task.instanceId, data[ids.billOfLadingNo]);
					}
				},
			);

			hooks.registerHook("submit", async ({ task }: { task: Task }) => {
				await addWatcherToInstance(
					task.instanceId,
					task.data[ids.assignees][AssigneeType.TechnicalManager]?.id,
				);
			});
		}
	}, [hooks]);

	return (
		<div className="grid grid-cols-12 gap-x-4 gap-y-6 md:gap-x-10">
			{task.data[ids.previousTask] ? (
				<PreviousTaskReferrer />
			) : (
				<Referrer
					assigneeKey={AssigneeType.TechnicalExpert}
					noteId={ids.certificateFormByTechExpertNote}
					title={assigneesTemplate[AssigneeType.TechnicalExpert]}
				/>
			)}

			<Seperator className="mt-5" />

			{task.data[ids.inspectionMethod] && (
				<>
					<div className="col-span-full !col-start-1 space-y-2 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
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

					<Seperator className="mt-5" />
				</>
			)}

			{task.data[ids.caseType] && (
				<div className="col-span-full !col-start-1 space-y-2 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
					<label>نوع درخواست:</label>
					<Input
						defaultValue={caseType[task.data[ids.caseType] as CaseType]}
						disabled
					/>
				</div>
			)}

			<div className="col-span-full !col-start-1 space-y-2 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
				<label>مشتری:</label>
				<Input
					defaultValue={task.data[ids.assignees][AssigneeType.Customer].name}
					disabled
				/>
			</div>

			<Seperator className="mt-5" />

			<div className="col-span-full !col-start-1 space-y-2 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
				<label>
					خریدار <span className="text-xs">(Buyer)</span>:
				</label>
				<Input
					className="text-right"
					defaultValue={task.data[ids.buyer]?.nameEn}
					dir="ltr"
					disabled
				/>
			</div>

			<Seperator className="mt-5" />

			{task.data[ids.customName] && (
				<>
					<div className="col-span-full !col-start-1 space-y-2 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
						<label>گمرک:</label>
						<Input
							defaultValue={
								customs.find((x) => x.value === task.data[ids.customName])
									?.label
							}
							disabled
						/>
					</div>

					<Seperator className="mt-5" />
				</>
			)}

			<div className="col-span-full !col-start-1 space-y-2 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
				<label htmlFor={ids.certificateIssueDate}>
					تاریخ صدور گواهی <span className="text-xs">(Issue Date)</span>:
				</label>
				<Controller
					control={control}
					name={ids.certificateIssueDate}
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
					rules={{ required: requiredOnSubmit }}
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
					rules={{ required: requiredOnSubmit }}
				/>
			</div>

			<Seperator className="mt-5" />

			<div className="col-span-full !col-start-1 space-y-2 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
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
								maxDate={getTodayDate()}
								value={value}
								onLeave={onBlur}
								onMutate={onChange}
							/>
							<FieldError error={fieldState.error} />
						</>
					)}
					rules={{ required: requiredOnSubmit }}
				/>
			</div>

			<div className="col-span-full !col-start-1 space-y-2 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
				<label htmlFor={ids.testDateStart}>
					تاریخ شروع آزمون <span className="text-xs">(Test Start Date)</span>:
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
								maxDate={getTodayDate()}
								value={value}
								onLeave={onBlur}
								onMutate={onChange}
							/>
							<FieldError error={fieldState.error} />
						</>
					)}
					rules={{ required: requiredOnSubmit }}
				/>
			</div>

			<div className="col-span-full !col-start-1 space-y-2 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
				<label htmlFor={ids.testDateEnd}>
					تاریخ پایان آزمون <span className="text-xs">(Test End Date)</span>:
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
								maxDate={getTodayDate()}
								value={value}
								onLeave={onBlur}
								onMutate={onChange}
							/>
							<FieldError error={fieldState.error} />
						</>
					)}
					rules={{ required: requiredOnSubmit }}
				/>
			</div>

			<div className="col-span-full !col-start-1 space-y-2 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
				<label htmlFor={ids.testIssuanceDate}>
					تاریخ صدور آزمون <span className="text-xs">(Test Issuance Date)</span>
					:
				</label>
				<Controller
					control={control}
					name={ids.testIssuanceDate}
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
					rules={{ required: requiredOnSubmit }}
				/>
			</div>

			<div className="col-span-full !col-start-1 space-y-2 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
				<label htmlFor={ids.loadingDate}>
					تاریخ بارگیری <span className="text-xs">(Loading Date)</span>:
				</label>
				<Controller
					control={control}
					name={ids.loadingDate}
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
					rules={{ required: requiredOnSubmit }}
				/>
			</div>

			<div className="col-span-full !col-start-1 space-y-2 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
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
								maxDate={getTodayDate()}
								value={value}
								onLeave={onBlur}
								onMutate={onChange}
							/>
							<FieldError error={fieldState.error} />
						</>
					)}
					rules={{ required: requiredOnSubmit }}
				/>
			</div>

			<div className="col-span-full !col-start-1 space-y-2 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
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
								maxDate={getTodayDate()}
								value={value}
								onLeave={onBlur}
								onMutate={onChange}
							/>
							<FieldError error={fieldState.error} />
						</>
					)}
					rules={{ required: requiredOnSubmit }}
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
					rules={{ required: requiredOnSubmit }}
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
					rules={{ required: requiredOnSubmit }}
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
					rules={{ required: requiredOnSubmit }}
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
					rules={{ required: requiredOnSubmit }}
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
					rules={{ required: requiredOnSubmit }}
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
					rules={{ required: requiredOnSubmit }}
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
					rules={{ required: requiredOnSubmit }}
				/>
			</div>

			<div className="col-span-full !col-start-1 space-y-2 md:col-span-10 lg:col-span-8 xl:col-span-6">
				<label>
					کشور مبدأ <span className="text-xs">(Country of Origin)</span>:
				</label>
				<Controller
					control={control}
					name={ids.countryOfOrigin}
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
					rules={{ required: requiredOnSubmit }}
				/>
			</div>

			<Seperator className="mt-5" />

			<div className="col-span-full !col-start-1 space-y-2 md:col-span-10 lg:col-span-8 xl:col-span-6">
				<label>
					محل بازرسی <span className="text-xs">(Place of Inspection)</span>:
				</label>
				<Controller
					control={control}
					name={ids.inspectionPlace}
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
					rules={{ required: requiredOnSubmit }}
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
					rules={{ required: requiredOnSubmit }}
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
					rules={{ required: requiredOnSubmit }}
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
					rules={{ required: requiredOnSubmit }}
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
					rules={{ required: requiredOnSubmit }}
				/>
			</div>

			<Seperator className="mt-5" />

			<div className="col-span-full !col-start-1 space-y-2 md:col-span-10 lg:col-span-8 xl:col-span-6">
				<label htmlFor={ids.goodsSerialNos}>
					شماره سریال/کد کالاها{" "}
					<span className="text-xs">(Serial/Code Number of Goods)</span>:
				</label>
				<Controller
					control={control}
					name={ids.goodsSerialNos}
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
					rules={{ required: requiredOnSubmit }}
				/>
			</div>

			<div className="col-span-full col-start-1 space-y-3">
				<GoodsList />
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
					rules={{ required: requiredOnSubmit }}
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
					rules={{ required: requiredOnSubmit }}
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
					rules={{ required: requiredOnSubmit }}
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
					rules={{ required: requiredOnSubmit }}
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
					rules={{ required: requiredOnSubmit }}
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
					rules={{ required: requiredOnSubmit }}
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
					rules={{ required: requiredOnSubmit }}
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
					rules={{ required: requiredOnSubmit }}
				/>
			</div>

			<Seperator className="mt-5" />

			{task.instanceVersion >= 6 && (
				<div className="col-span-full !col-start-1 space-y-2 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
					<label htmlFor={ids.certificateFormByTechExpertStatus}>وضعیت:</label>
					<Controller
						control={control}
						name={ids.certificateReviewStatus}
						render={({ field, fieldState }) => (
							<>
								<Select
									id={field.name}
									items={reviewStatusOptions}
									{...field}
								/>
								<FieldError error={fieldState.error} />
							</>
						)}
						rules={{ required: requiredOnSubmit }}
					/>
				</div>
			)}

			<div className="col-span-full space-y-2">
				<label htmlFor={ids.certificateReviewNote}>توضیحات:</label>
				<Controller
					control={control}
					name={ids.certificateReviewNote}
					render={({ field, fieldState }) => (
						<>
							<Textarea id={field.name} {...field} />
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
	);
}
