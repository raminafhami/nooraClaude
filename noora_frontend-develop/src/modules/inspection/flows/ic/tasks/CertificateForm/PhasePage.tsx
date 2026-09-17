"use client";

import { useEffect, useRef, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { FaExclamationTriangle } from "react-icons/fa";
import { z } from "zod";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTaskContext } from "@/felo/tasks/hooks/useTaskContext";
import { DateInput } from "@/form/DateInput";
import { FieldError } from "@/form/FieldError";
import { Input } from "@/form/Input";
import { Textarea } from "@/form/textarea";
import Referrer from "@/inspection/flows/_module/referrer/Referrer";
import { CaseType, caseType } from "@/inspection/models/CaseType";
import { reviewStatusOptions } from "@/inspection/models/ReviewStatus";
import { messages } from "@/messages";
import { Loading } from "@/ui/Loader";
import Select from "@/ui/Select/Select";
import { Seperator } from "@/ui/Seperator";

import { GoodsCustomTariffNosWidget } from "../../components/GoodsCustomTariffNos/GoodsCustomTariffNosWidget";
import { GoodsDescriptionsWidget } from "../../components/GoodsDescriptions/GoodsDescriptionsWidget";
import { certificateDefaults } from "../../data/Certificate";
import { assigneesTemplate, AssigneeType } from "../../models/Assignee";
import { ids } from "../../models/Ids";
import {
	InspectionMethod,
	inspectionMethod as inspectionMethodType,
} from "../../models/InspectionMethod";
import { validateUniqueBlNo } from "../../utils/validateUniqueBlNo";
import { schema } from "./PhaseSchema";

type FormData = z.infer<typeof schema>;

export function PhasePage() {
	const { task, hooks, dispatch } = useTaskContext();

	const { data } = task;

	const { control, register, setValue, watch } = useFormContext<FormData>();

	const inspectionMethod = data[ids.inspectionMethod];

	const { [ids.proformaDate]: proformaDate, [ids.billOfLadingNo]: blNo } =
		watch();

	useEffect(() => {
		dispatch({ type: "update", options: { saveBtn: true } });
	}, [dispatch]);

	useEffect(() => {
		register(ids.certificateIssueDate);
		register(ids.certificateIssueNo);
	}, [register]);

	useEffect(() => {
		if (task.data[ids.applicant] === undefined) {
			setValue(ids.applicant, task.data[ids.buyerNameEn], {
				shouldDirty: true,
				shouldTouch: true,
				shouldValidate: true,
			});
		}

		if (task.data[ids.packing] === undefined) {
			setValue(ids.packing, certificateDefaults.packing, {
				shouldDirty: true,
				shouldTouch: true,
				shouldValidate: true,
			});
		}

		if (task.data[ids.inspectionQualityDescription] === undefined) {
			setValue(ids.inspectionQualityDescription, certificateDefaults.quality, {
				shouldDirty: true,
				shouldTouch: true,
				shouldValidate: true,
			});
		}

		if (task.data[ids.inspectionRemarkDescription] === undefined) {
			setValue(ids.inspectionRemarkDescription, certificateDefaults.remark, {
				shouldDirty: true,
				shouldTouch: true,
				shouldValidate: true,
			});
		}
	}, [setValue, task.data]);

	useEffect(() => {
		if (task.data[ids.certificateConclusion] === undefined) {
			setValue(
				ids.certificateConclusion,
				inspectionMethod === "destination"
					? certificateDefaults.conclusion.destination
					: inspectionMethod === "source"
						? certificateDefaults.conclusion.source
						: "",
				{
					shouldDirty: true,
					shouldTouch: true,
					shouldValidate: true,
				},
			);
		}
	}, [inspectionMethod, setValue, task.data]);

	useEffect(() => {
		if (hooks.get().length === 0) {
			hooks.registerHook("pre-submit", async ({ data }: { data: FormData }) => {
				// set certificate fields
				data[ids.certificateIssueDate] = null;
				data[ids.certificateIssueNo] = null;

				// set optional fields' values
				!data[ids.insuranceCompany] && (data[ids.insuranceCompany] = "");
				!data[ids.insurancePolicyNo] && (data[ids.insurancePolicyNo] = "");
			});
		}
	}, [hooks]);

	const [isCheckingBlNo, setIsCheckingBlNo] = useState<boolean>(false);
	const [isUniqueBlNo, setIsUniqueBlNo] = useState<true | string[]>(true);
	const blNoTimeout = useRef<NodeJS.Timeout>();

	useEffect(() => {
		(async () => {
			try {
				if (!blNo) {
					setIsUniqueBlNo(true);
					return;
				}

				await new Promise((resolve) => {
					blNoTimeout.current = setTimeout(async () => {
						setIsCheckingBlNo(true);
						const duplicates = await validateUniqueBlNo(task.instanceId, blNo);
						setIsUniqueBlNo(duplicates.length ? duplicates : true);
						resolve(null);
					}, 500);
				});
			} catch (err) {
				console.error(err);
			} finally {
				setIsCheckingBlNo(false);
			}
		})();

		return () => clearTimeout(blNoTimeout.current);
	}, [blNo, task.instanceId]);

	return (
		<div className="grid grid-cols-12 gap-x-10 gap-y-6">
			{task.data[ids.certificateIssuanceStatus] ? (
				<Referrer
					assigneeKey={AssigneeType.Manager}
					noteId={ids.certificateIssuanceNote}
					noteType="danger"
					title={assigneesTemplate[AssigneeType.Manager]}
				/>
			) : (
				<Referrer
					assigneeKey={AssigneeType.Manager}
					noteId={ids.informationReviewNote}
					title={assigneesTemplate[AssigneeType.Manager]}
				/>
			)}

			<Seperator className="mt-5" />

			<div className="col-span-3 col-start-1 space-y-2">
				<label htmlFor={ids.buyerNameEn}>روش بازرسی:</label>
				<Input
					defaultValue={
						inspectionMethodType[
							task.data[ids.inspectionMethod] as InspectionMethod
						]
					}
					disabled
				/>
			</div>

			<div className="col-span-3 col-start-1 space-y-2">
				<div>نوع درخواست:</div>
				<Input
					defaultValue={caseType[task.data[ids.caseType] as CaseType]}
					disabled
				/>
			</div>

			<div className="col-span-3 col-start-1 space-y-2">
				<label>مشتری:</label>
				<Input
					defaultValue={task.data[ids.assignees][AssigneeType.Customer].name}
					disabled
				/>
			</div>

			<Seperator className="mt-5" />

			<div className="col-span-3 col-start-1 space-y-2">
				<label htmlFor={ids.buyerNameEn}>
					خریدار <span className="text-xs">(Buyer)</span>:
				</label>
				<Controller
					control={control}
					name={ids.buyerNameEn}
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

			<div className="col-span-3 col-start-1 space-y-2">
				<label htmlFor={ids.seller}>
					فروشنده <span className="text-xs">(Seller)</span>:
				</label>
				<Controller
					control={control}
					name={ids.seller}
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

			<div className="col-span-3 col-start-1 space-y-2">
				<label htmlFor={ids.applicant}>
					متقاضی <span className="text-xs">(Applicant)</span>:
				</label>
				<Controller
					control={control}
					name={ids.applicant}
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
					rules={{
						required: messages.validation.required,
					}}
				/>
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
					rules={{
						required: messages.validation.required,
					}}
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
						fieldState: { error },
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
							<FieldError error={error} />
						</>
					)}
					rules={{
						// deps: [ids.invoiceDate],
						required: messages.validation.required,
					}}
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
					rules={{
						required: messages.validation.required,
					}}
				/>
			</div>

			<Seperator className="mt-5" />

			<div className="col-span-3 col-start-1 space-y-2">
				<label htmlFor={ids.invoiceNo}>
					شماره فاکتور{" "}
					<span className="text-xs" dir="ltr">
						(Invoice No.)
					</span>
					:
				</label>
				<Controller
					control={control}
					name={ids.invoiceNo}
					render={({ field, fieldState }) => (
						<>
							<Input className="text-right" dir="ltr" {...field} />
							<FieldError error={fieldState.error} />
						</>
					)}
					rules={{}}
				/>
			</div>

			<div className="col-span-3 col-start-1 space-y-2">
				<label htmlFor={ids.invoiceDate}>
					تاریخ فاکتور <span className="text-xs">(Invoice Date)</span>:
				</label>
				<Controller
					control={control}
					name={ids.invoiceDate}
					render={({
						field: { name, value, onBlur, onChange },
						fieldState: { error },
					}) => (
						<>
							<DateInput
								calendarType="gregorian"
								lang="en"
								id={name}
								value={value}
								onLeave={onBlur}
								onMutate={onChange}
							/>
							<FieldError error={error} />
						</>
					)}
					rules={
						{
							// deps: [ids.billOfLadingDate],
							// validate: (v) => {
							//   const a = new Date(proformaDate);
							//   const b = new Date(v);
							//   if (a && b && a > b) {
							//     return "تاریخ فاکتور باید بعد از تاریخ پروفرما باشد.";
							//   }
							// },
						}
					}
				/>
			</div>

			<Seperator className="mt-5" />

			<div className="col-span-3 col-start-1 space-y-2">
				<label htmlFor={ids.insuranceCompany}>
					شرکت بیمه <span className="text-xs">(Insurance Company)</span>:
				</label>
				<Controller
					control={control}
					name={ids.insuranceCompany}
					render={({ field, fieldState }) => (
						<>
							<Input className="text-right" dir="ltr" {...field} />
							<FieldError error={fieldState.error} />
						</>
					)}
					rules={{}}
				/>
			</div>

			<div className="col-span-3 col-start-1 space-y-2">
				<label htmlFor={ids.insurancePolicyNo}>
					شماره بیمه نامه{" "}
					<span className="text-xs" dir="ltr">
						(Insurance Policy No.)
					</span>
					:
				</label>
				<Controller
					control={control}
					name={ids.insurancePolicyNo}
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
							{typeof isUniqueBlNo === "object" && (
								<Alert variant="warn">
									<FaExclamationTriangle />
									<AlertDescription>
										شماره بارنامه مورد نظر در شماره درخواست های ذیل ثبت شده است:
										<br />
										{isUniqueBlNo.join("، ")}
									</AlertDescription>
								</Alert>
							)}
							{isCheckingBlNo && (
								<div className="flex items-center gap-2 text-muted-foreground">
									<Loading className="w-fit" size="xs" />
									<span className="text-xs">
										در حال بررسی تکراری نبودن شماره بارنامه...
									</span>
								</div>
							)}
							<FieldError error={fieldState.error} />
						</>
					)}
					rules={{
						required: messages.validation.required,
					}}
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
						fieldState: { error },
					}) => (
						<>
							<DateInput
								calendarType="gregorian"
								lang="en"
								id={name}
								value={value}
								onLeave={onBlur}
								onMutate={onChange}
							/>
							<FieldError error={error} />
						</>
					)}
					rules={{
						deps: [ids.inspectionDate],
						required: messages.validation.required,
						// validate: (v, values) => {
						//   const a = new Date(values[ids.invoiceDate]);
						//   const b = new Date(v);

						//   if (a && b && a > b) {
						//     return "تاریخ بارنامه باید بعد از تاریخ فاکتور باشد.";
						//   }
						// },
					}}
				/>
			</div>

			<div className="col-span-3 col-start-1 space-y-2">
				<label htmlFor={ids.billOfLadingQuantity}>
					مقدار ارسال شده به ازای هر بارنامه{" "}
					<span className="text-xs" dir="ltr">
						(Quantity Shipped as per B/L)
					</span>
					:
				</label>
				<Controller
					control={control}
					name={ids.billOfLadingQuantity}
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
					rules={{
						required: messages.validation.required,
					}}
				/>
			</div>

			<div className="col-span-3 col-start-1 space-y-2">
				<label htmlFor={ids.netWeight}>
					وزن خالص <span className="text-xs">(Net Weight)</span>:
				</label>
				<Controller
					control={control}
					name={ids.netWeight}
					render={({ field, fieldState }) => (
						<>
							<Input className="text-right" dir="ltr" {...field} />
							<FieldError error={fieldState.error} />
						</>
					)}
					rules={{}}
				/>
			</div>

			<div className="col-span-3 col-start-1 space-y-2">
				<label htmlFor={ids.packing}>
					بسته بندی <span className="text-xs">(Packing)</span>:
				</label>
				<Controller
					control={control}
					name={ids.packing}
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

			<div className="col-span-3 col-start-1 space-y-2">
				<label htmlFor={ids.shippedFrom}>
					ارسال شده از <span className="text-xs">(Shipped from)</span>:
				</label>
				<Controller
					control={control}
					name={ids.shippedFrom}
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

			<div className="col-span-3 col-start-1 space-y-2">
				<label htmlFor={ids.shippedTo}>
					ارسال شده به <span className="text-xs">(Shipped to)</span>:
				</label>
				<Controller
					control={control}
					name={ids.shippedTo}
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

			<div className="col-span-3 col-start-1 space-y-2">
				<label htmlFor={ids.countryOfOrigin}>
					کشور مبدأ <span className="text-xs">(Country of Origin)</span>:
				</label>
				<Controller
					control={control}
					name={ids.countryOfOrigin}
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

			<Seperator className="mt-5" />

			<GoodsCustomTariffNosWidget />

			<GoodsDescriptionsWidget />

			<Seperator className="mt-5" />

			<div className="col-span-3 col-start-1 space-y-2">
				<label htmlFor={ids.inspectionPlace}>
					محل بازرسی <span className="text-xs">(Place of Inspection)</span>:
				</label>
				<Controller
					control={control}
					name={ids.inspectionPlace}
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

			<div className="col-span-3 col-start-1 space-y-2">
				<label htmlFor={ids.inspectionDate}>
					تاریخ بازرسی <span className="text-xs">(Inspection Date)</span>:
				</label>
				<Controller
					control={control}
					name={ids.inspectionDate}
					render={({
						field: { name, value, onBlur, onChange },
						fieldState: { error },
					}) => (
						<>
							<DateInput
								calendarType="gregorian"
								lang="en"
								id={name}
								value={value}
								onLeave={onBlur}
								onMutate={onChange}
							/>
							<FieldError error={error} />
						</>
					)}
					rules={{
						required: messages.validation.required,
						validate: (v, values) => {
							const a = new Date(v);
							const b = new Date(values[ids.billOfLadingDate]);
							const c = new Date(values[ids.invoiceDate]);

							if (inspectionMethod === "source" && (a < c || a > b)) {
								return "تاریخ بازرسی باید بین تاریخ فاکتور و تاریخ بارنامه باشد.";
							} else if (inspectionMethod === "destination" && a < b) {
								return "تاریخ بازرسی باید بعد از تاریخ بارنامه باشد.";
							}
						},
					}}
				/>
			</div>

			<div className="col-span-full space-y-2">
				<label htmlFor={ids.inspectionQualityDescription}>
					کیفیت <span className="text-xs">(Quality)</span>:
				</label>
				<Controller
					control={control}
					name={ids.inspectionQualityDescription}
					render={({ field, fieldState }) => (
						<>
							<Input dir="ltr" {...field} />
							<FieldError error={fieldState.error} />
						</>
					)}
					rules={{
						required: messages.validation.required,
					}}
				/>
			</div>

			<div className="col-span-full space-y-2">
				<label htmlFor={ids.inspectionRemarkDescription}>
					ملاحظات <span className="text-xs">(Remark)</span>:
				</label>
				<Controller
					control={control}
					name={ids.inspectionRemarkDescription}
					render={({ field, fieldState }) => (
						<>
							<Input dir="ltr" {...field} />
							<FieldError error={fieldState.error} />
						</>
					)}
					rules={{
						required: messages.validation.required,
					}}
				/>
			</div>

			<div className="col-span-full space-y-2">
				<label htmlFor={ids.certificateConclusion}>
					نتیجه <span className="text-xs">(Conclusion)</span>:
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
					rules={{
						required: messages.validation.required,
					}}
				/>
			</div>

			<Seperator className="my-5" />

			<div className="col-span-3 col-start-1 space-y-2">
				<label htmlFor={ids.certificateFormStatus}>وضعیت:</label>
				<Controller
					control={control}
					name={ids.certificateFormStatus}
					render={({ field, fieldState }) => (
						<>
							<Select items={reviewStatusOptions} {...field} />
							<FieldError error={fieldState.error} />
						</>
					)}
				/>
			</div>

			<div className="col-span-full col-start-1 space-y-2">
				<label htmlFor={ids.certificateFormNote}>توضیحات:</label>
				<Controller
					control={control}
					name={ids.certificateFormNote}
					render={({ field, fieldState }) => (
						<>
							<Textarea {...field} />
							<FieldError error={fieldState.error} />
						</>
					)}
				/>
			</div>
		</div>
	);
}
