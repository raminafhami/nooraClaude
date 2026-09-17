"use client";

import moment from "jalali-moment";
import { PlusIcon } from "lucide-react";
import { useEffect } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { CgRemove } from "react-icons/cg";
import { FaAngleDoubleLeft } from "react-icons/fa";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { banks } from "@/data/banks";
import { useTaskContext } from "@/felo/tasks/hooks/useTaskContext";
import { Task } from "@/felo/tasks/models/Task";
import { CalendarInput } from "@/form/CalendarInput";
import { DateInput } from "@/form/DateInput";
import { FieldError } from "@/form/FieldError";
import { Input } from "@/form/Input";
import { Textarea } from "@/form/textarea";
import Referrer from "@/inspection/flows/_module/referrer/Referrer";
import { CaseType, caseType } from "@/inspection/models/CaseType";
import { reviewStatusOptions } from "@/inspection/models/ReviewStatus";
import { messages } from "@/messages";
import Select from "@/ui/Select/Select";
import { Seperator } from "@/ui/Seperator";

import { assigneesTemplate, AssigneeType } from "../../models/Assignee";
import { CertificateReviewStatus } from "../../models/CertificateReviewStatus";
import { ids } from "../../models/Ids";
import { GoodsDescriptionsWidget } from "../_components/GoodsDescriptionsWidget";
import { schema } from "./PhaseSchema";

type FormData = z.infer<typeof schema>;

export function PhasePage() {
	const { task, hooks, dispatch } = useTaskContext();
	const { data } = task;

	const { control, register, resetField, setValue, watch } =
		useFormContext<FormData>();

	const { [ids.invoiceNoArray]: invoiceNoArray } = watch();

	function handleInvoiceArray(mode: "add" | "remove", index: number) {
		let nextArray = [...invoiceNoArray];

		if (mode === "add") {
			nextArray.push({ date: "", no: "" });
		} else {
			nextArray.splice(index, 1);
		}

		setValue("InvoiceNoArray", nextArray, {
			shouldDirty: true,
			shouldTouch: true,
		});
	}

	useEffect(() => {
		dispatch({ type: "update", options: { saveBtn: true } });
	}, [dispatch]);

	useEffect(() => {
		register(ids.certificateIssueDate);
		register(ids.certificateIssueNo);
	}, [register]);

	useEffect(() => {
		setValue(ids.certificateIssueDate, moment().format("jYYYY/jMM/jDD"));
		setValue(ids.certificateIssueNo, null);
	}, [setValue]);

	useEffect(() => {
		if (!task.data[ids.goodsShippingBasis]) {
			setValue(ids.goodsShippingBasis, "EX-WORKS", {
				shouldDirty: true,
				shouldTouch: true,
			});
		}
	}, [setValue, task.data]);

	useEffect(() => {
		if (!invoiceNoArray?.length) {
			setValue(ids.invoiceNoArray, [{ date: "", no: "" }], {
				shouldDirty: true,
				shouldTouch: true,
			});
		}
	}, [invoiceNoArray, setValue, task.data]);

	useEffect(() => {
		if (!task.data[ids.certificateQualityDescription]) {
			resetField(ids.certificateQualityDescription, {
				defaultValue:
					"لازم به توضیح است، صدور این گواهی نشان دهنده تأیید قیمت پیش فاکتور مربوطه نمی باشد.",
			});
		}
	}, [task.data, resetField]);

	useEffect(() => {
		if (!task.data[ids.certificateRemarkDescription]) {
			resetField(ids.certificateRemarkDescription, {
				defaultValue:
					"بدینوسیله گواهی می شود کمیت، کیفیت و بسته بندی کالای بازدید شده تماماً منطبق با مشخصات درج شده کالا در پیش فاکتور و بندهای اعتبار اسنادی (L/C) و هر گونه اصلاحیه مربوط به آن می باشد که توسط خریدار به شرکت بازرسی نورا آزما بین الملل ارائه شده است.",
			});
		}
	}, [task.data, resetField]);

	useEffect(() => {
		if (!task.data[ids.certificateConclusion]) {
			resetField(ids.certificateConclusion, {
				defaultValue:
					"بر اساس استاندارد ملی و بین المللی، بازرسی کالا از نظر کمیت و کیفیت (ظاهری)، بسته بندی به صورت رندوم (اتفاقی) انجام می گیرد و از نظر تعداد و یا وزن کالا خریدار می بایستی راسا نسبت به شمارش کنترل و تحویل کالا از فروشنده اقدام نماید. در صورت بروز هر گونه اختلاف بین خریدار و فروشنده در مورد عدم تحویل قسمت و یا تمامی کالا از طرف فروشنده به خریدار به هر عنوان و دلیلی که باشد هیچگونه ارتباطی به شرکت نورا آزما بین الملل نداشته و شرکت بازرسی هیچگونه مسئولیتی در خصوص تحویل و یا عدم تحویل کالا از طرف فروشنده به خریدار ندارد.",
			});
		}
	}, [task.data, resetField]);

	useEffect(() => {
		if (hooks.get().length === 0) {
			hooks.registerHook(
				"pre-submit",
				({ task, data }: { task: Task; data: FormData }) => {
					// set optional fields
					!data[ids.goodsShippingMethod] &&
						(data[ids.goodsShippingMethod] = "");
				},
			);
		}
	}, [hooks]);

	return (
		<div className="grid grid-cols-12 gap-x-10 gap-y-6">
			{task.data[ids.certificateIssuanceStatus] ===
			CertificateReviewStatus.Return ? (
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
				<label>خریدار:</label>
				<Input defaultValue={data[ids.buyer]?.name} disabled />
			</div>

			<div className="col-span-3 col-start-1 space-y-2">
				<label htmlFor={ids.seller}>فروشنده:</label>
				<Controller
					control={control}
					name={ids.seller}
					render={({ field, fieldState }) => (
						<>
							<Input {...field} />
							<FieldError error={fieldState.error} />
						</>
					)}
					rules={{ required: messages.validation.required }}
				/>
			</div>

			<Seperator className="mt-5" />

			<div className="col-span-3 col-start-1 space-y-2">
				<label htmlFor={ids.creditOpeningBankName}>
					نام بانک گشایش کننده اعتبار:
				</label>
				<Controller
					control={control}
					name={ids.creditOpeningBankName}
					render={({ field, fieldState }) => (
						<>
							<Select items={banks} {...field} />
							<FieldError error={fieldState.error} />
						</>
					)}
					rules={{ required: messages.validation.required }}
				/>
			</div>

			<div className="col-span-3 col-start-1 space-y-2">
				<label htmlFor={ids.creditOpeningBankBranch}>
					شعبه بانک گشایش کننده اعتبار:
				</label>
				<Controller
					control={control}
					name={ids.creditOpeningBankBranch}
					render={({ field, fieldState }) => (
						<>
							<Input {...field} />
							<FieldError error={fieldState.error} />
						</>
					)}
					rules={{ required: messages.validation.required }}
				/>
			</div>

			<div className="col-span-3 col-start-1 space-y-2">
				<label htmlFor={ids.creditNegotiatingBankName}>
					نام بانک معامله کننده اعتبار:
				</label>
				<Controller
					control={control}
					name={ids.creditNegotiatingBankName}
					render={({ field, fieldState }) => (
						<>
							<Select items={banks} {...field} />
							<FieldError error={fieldState.error} />
						</>
					)}
					rules={{ required: messages.validation.required }}
				/>
			</div>

			<div className="col-span-3 col-start-1 space-y-2">
				<label htmlFor={ids.creditNegotiatingBankBranch}>
					شعبه بانک معامله کننده اعتبار:
				</label>
				<Controller
					control={control}
					name={ids.creditNegotiatingBankBranch}
					render={({ field, fieldState }) => (
						<>
							<Input {...field} />
							<FieldError error={fieldState.error} />
						</>
					)}
					rules={{ required: messages.validation.required }}
				/>
			</div>

			<Seperator className="mt-5" />

			<div className="col-span-3 col-start-1 space-y-2">
				<label htmlFor={ids.proformaNo}>شماره پیش فاکتور:</label>
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
				<label htmlFor={ids.proformaDate}>تاریخ پیش فاکتور:</label>
				<Controller
					control={control}
					name={ids.proformaDate}
					render={({
						field: { name, value, onBlur, onChange },
						fieldState: { error },
					}) => (
						<>
							<DateInput
								id={name}
								value={value}
								onLeave={onBlur}
								onMutate={onChange}
							/>
							<FieldError error={error} />
						</>
					)}
					rules={{ required: messages.validation.required }}
				/>
			</div>

			<Seperator className="mt-5" />

			<div className="col-span-3 col-start-1 space-y-2">
				<label htmlFor={ids.creditDocumentNo}>شماره اعتبار اسنادی:</label>
				<Controller
					control={control}
					name={ids.creditDocumentNo}
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
				<label htmlFor={ids.creditDocumentStartDate}>تاریخ گشایش اعتبار:</label>
				<Controller
					control={control}
					name={ids.creditDocumentStartDate}
					render={({
						field: { name, value, onBlur, onChange },
						fieldState: { error },
					}) => (
						<>
							<DateInput
								id={name}
								value={value}
								onLeave={onBlur}
								onMutate={onChange}
							/>
							<FieldError error={error} />
						</>
					)}
					rules={{ required: messages.validation.required }}
				/>
			</div>

			<div className="col-span-3 col-start-1 space-y-2">
				<label htmlFor={ids.creditDocumentExpireDate}>
					تاریخ سررسید اعتبار:
				</label>
				<Controller
					control={control}
					name={ids.creditDocumentExpireDate}
					render={({ field, fieldState: { error } }) => (
						<>
							<CalendarInput id={field.name} {...field} />
							<FieldError error={error} />
						</>
					)}
					rules={{}}
				/>
			</div>

			<Seperator className="mt-5" />

			{task.instanceVersion <= 5 ? (
				<>
					<div className="col-span-3 col-start-1 space-y-2">
						<label htmlFor={ids.invoiceNo}>شماره فاکتور:</label>
						<Controller
							control={control}
							name={ids.invoiceNo}
							render={({ field, fieldState: { error } }) => (
								<>
									<Input
										className="text-right"
										dir="ltr"
										id={field.name}
										{...field}
									/>
									<FieldError error={error} />
								</>
							)}
							rules={{ required: messages.validation.required }}
						/>
					</div>

					<div className="col-span-3 col-start-1 space-y-2">
						<label htmlFor={ids.invoiceDate}>تاریخ فاکتور:</label>
						<Controller
							control={control}
							name={ids.invoiceDate}
							render={({
								field: { name, value, onBlur, onChange },
								fieldState: { error },
							}) => (
								<>
									<DateInput
										id={name}
										value={value}
										onLeave={onBlur}
										onMutate={onChange}
									/>
									<FieldError error={error} />
								</>
							)}
							rules={{ required: messages.validation.required }}
						/>
					</div>
				</>
			) : (
				<>
					<div className="col-span-3 col-start-1 space-y-2">
						<Button onClick={() => handleInvoiceArray("add", 0)} type="button">
							<PlusIcon className="size-3" />
							<span className="ms-1">افزودن فاکتور جدید</span>
						</Button>
					</div>

					<Seperator className="col-span-3 col-start-1" />

					{invoiceNoArray?.map((item, index) => (
						<>
							<div className="col-span-3 col-start-1 mt-2 space-y-2">
								<div className="flex items-center gap-3">
									<div className="flex items-center gap-2">
										<FaAngleDoubleLeft size={10} />
										<span>فاکتور {index + 1}</span>
									</div>
									{invoiceNoArray.length !== 1 && (
										<Button
											className="flex h-6 items-center gap-1 rounded-2xl !border-red-600 !bg-white px-2 py-0 text-xs !text-red-600"
											type="button"
											variant="outline"
											onClick={() => handleInvoiceArray("remove", index)}
										>
											<CgRemove size={12} />
											حذف
										</Button>
									)}
								</div>
							</div>

							<div className="col-span-3 col-start-1 space-y-2">
								<label htmlFor={ids.invoiceNo}>شماره فاکتور:</label>
								<Controller
									control={control}
									name={`${ids.invoiceNoArray}.${index}.no`}
									render={({ field, fieldState: { error } }) => (
										<>
											<Input
												className="text-right"
												dir="ltr"
												id={field.name}
												{...field}
											/>
											<FieldError error={error} />
										</>
									)}
									rules={{ required: messages.validation.required }}
								/>
							</div>

							<div className="col-span-3 col-start-1 space-y-2">
								<label htmlFor={ids.invoiceDate}>تاریخ فاکتور:</label>
								<Controller
									control={control}
									name={`${ids.invoiceNoArray}.${index}.date`}
									render={({
										field: { name, value, onBlur, onChange },
										fieldState: { error },
									}) => (
										<>
											<DateInput
												id={name}
												value={value}
												onLeave={onBlur}
												onMutate={onChange}
											/>
											<FieldError error={error} />
										</>
									)}
									rules={{ required: messages.validation.required }}
								/>
							</div>

							{index != invoiceNoArray.length - 1 && (
								<Seperator className="col-span-3 col-start-1 mt-5" />
							)}
						</>
					))}
				</>
			)}

			<Seperator className="mt-5" />

			<div className="col-span-3 col-start-1 space-y-2">
				<label htmlFor={ids.proceedingsNo}>شماره صورتمجلس:</label>
				<Controller
					control={control}
					name={ids.proceedingsNo}
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
				<label htmlFor={ids.proceedingsDate}>تاریخ صورتمجلس:</label>
				<Controller
					control={control}
					name={ids.proceedingsDate}
					render={({
						field: { name, value, onBlur, onChange },
						fieldState: { error },
					}) => (
						<>
							<DateInput
								id={name}
								value={value}
								onLeave={onBlur}
								onMutate={onChange}
							/>
							<FieldError error={error} />
						</>
					)}
					rules={{}}
				/>
			</div>

			<Seperator className="mt-5" />

			<GoodsDescriptionsWidget />

			<Seperator className="mt-5" />

			<div className="col-span-3 col-start-1 space-y-2">
				<label htmlFor={ids.goodsGrossWeight}>مقدار وزن حمل شده:</label>
				<Controller
					control={control}
					name={ids.goodsGrossWeight}
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
				<label htmlFor={ids.goodsShippingDueDate}>آخرین مهلت حمل کالا:</label>
				<Controller
					control={control}
					name={ids.goodsShippingDueDate}
					render={({ field, fieldState: { error } }) => (
						<>
							<CalendarInput id={field.name} {...field} />
							<FieldError error={error} />
						</>
					)}
					rules={{}}
				/>
			</div>

			<div className="col-span-3 col-start-1 space-y-2">
				<label htmlFor={ids.goodsShippingSourceSite}>مبدأ حمل کالا:</label>
				<Controller
					control={control}
					name={ids.goodsShippingSourceSite}
					render={({ field, fieldState }) => (
						<>
							<Input {...field} />
							<FieldError error={fieldState.error} />
						</>
					)}
					rules={{ required: messages.validation.required }}
				/>
			</div>

			<div className="col-span-3 col-start-1 space-y-2">
				<label htmlFor={ids.goodsShippingSourceCity}>شهر مبدأ حمل کالا:</label>
				<Controller
					control={control}
					name={ids.goodsShippingSourceCity}
					render={({ field, fieldState }) => (
						<>
							<Input {...field} />
							<FieldError error={fieldState.error} />
						</>
					)}
					rules={{}}
				/>
			</div>

			<div className="col-span-3 col-start-1 space-y-2">
				<label htmlFor={ids.goodsShippingDestinationSite}>
					مقصد تخلیه کالا:
				</label>
				<Controller
					control={control}
					name={ids.goodsShippingDestinationSite}
					render={({ field, fieldState }) => (
						<>
							<Input {...field} />
							<FieldError error={fieldState.error} />
						</>
					)}
					rules={{ required: messages.validation.required }}
				/>
			</div>

			<div className="col-span-3 col-start-1 space-y-2">
				<label htmlFor={ids.goodsShippingDestinationCity}>
					شهر مقصد تخلیه کالا:
				</label>
				<Controller
					control={control}
					name={ids.goodsShippingDestinationCity}
					render={({ field, fieldState }) => (
						<>
							<Input {...field} />
							<FieldError error={fieldState.error} />
						</>
					)}
					rules={{}}
				/>
			</div>

			<div className="col-span-3 col-start-1 space-y-2">
				<label htmlFor={ids.goodsShippingMethod}>روش حمل:</label>
				<Controller
					control={control}
					name={ids.goodsShippingMethod}
					render={({ field, fieldState }) => (
						<>
							<Input {...field} />
							<FieldError error={fieldState.error} />
						</>
					)}
					rules={{}}
				/>
			</div>

			<div className="col-span-3 col-start-1 space-y-2">
				<label htmlFor={ids.goodsShippingBasis}>مبنای حمل:</label>
				<Controller
					control={control}
					name={ids.goodsShippingBasis}
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
				<label htmlFor={ids.inspectionPlace}>محل بازرسی:</label>
				<Controller
					control={control}
					name={ids.inspectionPlace}
					render={({ field, fieldState }) => (
						<>
							<Input {...field} />
							<FieldError error={fieldState.error} />
						</>
					)}
					rules={{ required: messages.validation.required }}
				/>
			</div>

			<div className="col-span-3 col-start-1 space-y-2">
				<label htmlFor={ids.inspectionDate}>تاریخ بازرسی:</label>
				<Controller
					control={control}
					name={ids.inspectionDate}
					render={({
						field: { name, value, onBlur, onChange },
						fieldState: { error },
					}) => (
						<>
							<DateInput
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
					}}
				/>
			</div>

			<Seperator className="mt-5" />

			<div className="col-span-full space-y-2">
				<label htmlFor={ids.certificateQualityDescription}>کیفیت:</label>
				<Controller
					control={control}
					name={ids.certificateQualityDescription}
					render={({ field, fieldState }) => (
						<>
							<Input {...field} />
							<FieldError error={fieldState.error} />
						</>
					)}
					rules={{ required: messages.validation.required }}
				/>
			</div>

			<div className="col-span-full space-y-2">
				<label htmlFor={ids.certificateRemarkDescription}>ملاحظات:</label>
				<Controller
					control={control}
					name={ids.certificateRemarkDescription}
					render={({ field, fieldState }) => (
						<>
							<Input {...field} />
							<FieldError error={fieldState.error} />
						</>
					)}
					rules={{ required: messages.validation.required }}
				/>
			</div>

			<div className="col-span-full space-y-2">
				<label htmlFor={ids.certificateConclusion}>نتیجه:</label>
				<Controller
					control={control}
					name={ids.certificateConclusion}
					render={({ field, fieldState }) => (
						<>
							<Textarea {...field} />
							<FieldError error={fieldState.error} />
						</>
					)}
					rules={{ required: messages.validation.required }}
				/>
			</div>

			<Seperator className="mt-5" />

			<div className="col-span-3 col-start-1 space-y-2">
				<label htmlFor={ids.certificateFormStatus}>نتیجه:</label>
				<Controller
					control={control}
					name={ids.certificateFormStatus}
					render={({ field, fieldState }) => (
						<>
							<Select items={reviewStatusOptions} {...field} />
							<FieldError error={fieldState.error} />
						</>
					)}
					rules={{ required: messages.validation.required }}
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
					rules={{}}
				/>
			</div>
		</div>
	);
}
