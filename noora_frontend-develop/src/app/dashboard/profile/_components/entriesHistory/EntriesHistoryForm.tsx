import moment from "moment-jalaali";
import { memo } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { FaFileLines } from "react-icons/fa6";

import { Button } from "@/components/ui/button";
import { DateInput } from "@/form/DateInput";
import { FieldError } from "@/form/FieldError";
import { Select } from "@/form/select";
import { messages } from "@/messages";
import { TimeString } from "@/time/TimeString";

import { dateQuery } from "./EntriesHistoryWidget";

interface Props {
	onQuerySubmit: (query: dateQuery) => void;
}
const reportTypes = [
	{
		name: "detailed",
		label: "گزارش جزییات یک روز",
		value: "detailed",
	},
	{
		name: "general",
		label: "گزارش چند روز",
		value: "general",
	},
	{
		name: "workshift",
		label: "گزارش شیفت کاری",
		value: "workshift",
	},
];

export const EntriesHistoryForm = memo(function EntriesForm({
	onQuerySubmit,
}: Props): React.ReactNode {
	const methods = useForm<dateQuery>({ mode: "onTouched" });
	const { formState, handleSubmit, register, setValue, watch } = methods;
	const { errors } = formState;
	const fields = watch();
	const todayDate = String(new Date().toLocaleDateString());
	console.log(todayDate);
	const todayJDate = moment(todayDate, "MM/DD/YYYY").format("jYYYY/jMM/jDD");
	return (
		<FormProvider {...methods}>
			<form
				onSubmit={handleSubmit((values) => {
					onQuerySubmit(values);
				})}
				className="mb-10 flex min-w-[12rem] max-w-[19rem] flex-col gap-y-4 xl:mb-0"
			>
				<div className="flex flex-col gap-y-3 sm:flex-row">
					<label
						htmlFor="requestType"
						id="requestType"
						className="min-w-[6rem] pt-2"
					>
						نوع گزارش:
					</label>
					<div className="grow">
						<Controller
							name="type"
							control={methods.control}
							render={({ field: { onChange, value } }) => (
								<Select
									id="type"
									items={reportTypes}
									value={fields["type"]}
									onLeave={() => {
										methods.trigger("type");
									}}
									onMutate={(v) => {
										methods.reset({ type: v });
										methods.setValue("type", v!, {
											shouldDirty: true,
											shouldTouch: true,
											shouldValidate: true,
										});
									}}
								/>
							)}
						/>
					</div>
				</div>

				{fields.type === "detailed" && (
					<div className="flex flex-col gap-y-3 sm:flex-row">
						<label className="min-w-[6rem] pt-2" htmlFor="date">
							تاریخ:
						</label>
						<div className="grow">
							<DateInput
								maxDate={todayJDate}
								value={fields["date"]}
								onBlur={() => {
									methods.trigger("date");
								}}
								onMutate={(v) => {
									methods.setValue("date", v as TimeString, {
										shouldDirty: true,
										shouldTouch: true,
										shouldValidate: true,
									});
								}}
								{...((ref, ...register) => register)(
									methods.register("date", {
										deps: [],
										required: messages.validation.required,
										// validate: validateDate,
									}),
								)}
							/>
							<FieldError error={methods.formState.errors["date"]} />
						</div>
					</div>
				)}

				{(fields.type === "general" || fields.type === "workshift") && (
					<>
						<div className="flex w-full flex-col gap-y-3 sm:flex-row">
							<label className="min-w-[6rem] pt-2" htmlFor="dateFrom">
								تاریخ شروع:
							</label>
							<div className="grow">
								<DateInput
									maxDate={fields.type === "general" ? todayJDate : undefined}
									value={fields["dateFrom"]}
									onBlur={() => {
										methods.trigger("dateFrom");
									}}
									onMutate={(v) => {
										methods.setValue("dateFrom", v as TimeString, {
											shouldDirty: true,
											shouldTouch: true,
											shouldValidate: true,
										});
									}}
									{...((ref, ...register) => register)(
										methods.register("dateFrom", {
											deps: [],
											required: messages.validation.required,
											// validate: validateDate,
										}),
									)}
								/>
								<FieldError error={methods.formState.errors["dateFrom"]} />
							</div>
						</div>
						<div className="flex w-full flex-col gap-y-3 sm:flex-row">
							<label className="min-w-[6rem] pt-2" htmlFor="dateFrom">
								تاریخ پایان:
							</label>
							<div className="grow">
								<DateInput
									maxDate={fields.type === "general" ? todayJDate : undefined}
									value={fields["dateTo"]}
									onBlur={() => {
										methods.trigger("dateTo");
									}}
									onMutate={(v) => {
										methods.setValue("dateTo", v as TimeString, {
											shouldDirty: true,
											shouldTouch: true,
											shouldValidate: true,
										});
									}}
									{...((ref, ...register) => register)(
										methods.register("dateTo", {
											deps: ["dateFrom"],
											required: messages.validation.required,

											validate: (v, values) => {
												if (v) {
													const dateFrom = new Date(values["dateFrom"]);
													const dateTo = new Date(v);

													if (dateFrom > dateTo) {
														return "تاریخ پایان باید که بزرگ تر از تاریخ شروع باشد.";
													}
												}
											},
										}),
									)}
								/>
								<FieldError error={methods.formState.errors["dateTo"]} />
							</div>
						</div>
					</>
				)}
				<Button className="w-fit self-end">
					<FaFileLines className="mx-1" />
					نمایش گزارش
				</Button>
			</form>
		</FormProvider>
	);
});
