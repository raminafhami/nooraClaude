"use client";
import moment from "moment-jalaali";
import { UseFormReturn } from "react-hook-form";

import { DateInput } from "@/form/DateInput";
import { FieldError } from "@/form/FieldError";
import { Input } from "@/form/Input";
import { MaskInput } from "@/form/MaskInput";
import { PersonnelRequestType } from "@/hrm/personnelRequests/models/personnelRequestType";
import { messages } from "@/messages";
import { getTimeStringInNum } from "@/time/getTimeStringInNum";
import { TimeString } from "@/time/TimeString";
import { validateTimeString } from "@/time/validateTimeString";

import { FormData } from "./ProfileAttendanceRequestsForm";

function ProfileAttendanceRequestHourlyMission({
	methods,
}: {
	methods: UseFormReturn<FormData, any>;
}) {
	const fields = methods.watch();

	function validateTime(time: string): boolean | string | undefined {
		const value = time.replaceAll("_", "");

		if (value.length < 8) {
			return false;
		}

		if (!validateTimeString(value)) {
			return "فرمت زمان وارد شده صحیح نمی باشد.";
		}
	}
	const todayDate = String(new Date().toLocaleDateString());
	console.log(todayDate);
	const todayJDate = moment(todayDate, "MM/DD/YYYY").format("jYYYY/jMM/jDD");
	console.log(todayJDate);
	return (
		fields.type === PersonnelRequestType.hourlyMission && (
			<>
				<div className="flex w-full flex-col gap-y-4">
					<div className="flex w-full min-w-[11rem] grow flex-col justify-between gap-x-2 gap-y-2 sm:flex-row">
						<label className="pt-2 sm:basis-28" htmlFor="date">
							تاریخ:
						</label>
						<div className="min-w-[11rem] grow">
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
									}),
								)}
							/>
							<FieldError error={methods.formState.errors["date"]} />
						</div>
					</div>
					<div className="flex flex-col gap-x-2 gap-y-2 sm:flex-row">
						<label className="pt-2 sm:basis-28" htmlFor="timeFrom">
							زمان شروع:
						</label>
						<div className="min-w-[11rem] grow">
							<MaskInput
								className="text-right tracking-widest"
								dir="ltr"
								id="timeFrom"
								mask="00{:}00"
								maskOptions={{ lazy: false }}
								value={fields["timeFrom"]}
								onBlur={() => {
									methods.trigger("timeFrom");
								}}
								onMutate={(v) => {
									methods.setValue("timeFrom", (v + ":00") as TimeString, {
										shouldDirty: true,
										shouldTouch: true,
										shouldValidate: true,
									});
								}}
								{...((ref, ...register) => register)(
									methods.register("timeFrom", {
										required: messages.validation.required,
										validate: validateTime,
									}),
								)}
							/>
							<FieldError error={methods.formState.errors["timeFrom"]} />
						</div>
					</div>

					<div className="flex flex-col gap-x-2 gap-y-2 sm:flex-row">
						<label className="pt-2 sm:basis-28" htmlFor="timeTo">
							زمان پایان:
						</label>
						<div className="min-w-[11rem] grow">
							<MaskInput
								className="text-right tracking-widest"
								dir="ltr"
								id="timeTo"
								mask="00{:}00"
								maskOptions={{ lazy: false }}
								value={fields["timeTo"]}
								onBlur={() => {
									methods.trigger("timeTo");
								}}
								onMutate={(v) => {
									methods.setValue("timeTo", (v + ":00") as TimeString, {
										shouldDirty: true,
										shouldTouch: true,
										shouldValidate: true,
									});
								}}
								{...((ref, ...register) => register)(
									methods.register("timeTo", {
										required: messages.validation.required,
										deps: ["timeFrom"],
										validate: (v, values) => {
											if (v) {
												const isValid = validateTime(v);

												if (isValid !== undefined) {
													return isValid;
												}

												const timeFrom = getTimeStringInNum(
													values["timeFrom"] || "00:00:00",
												);
												const timeTo = getTimeStringInNum(v);

												if (timeFrom >= timeTo) {
													return "زمان پایان باید که بزرگ تر از زمان شروع باشد.";
												}
											}
										},
									}),
								)}
							/>
							<FieldError error={methods.formState.errors["timeTo"]} />
						</div>
					</div>
					<div className="flex flex-col gap-x-2 gap-y-2 sm:flex-row">
						<label className="pt-2 sm:basis-28" htmlFor="description">
							توضیحات:
						</label>
						<div className="min-w-[11rem] grow">
							<Input
								id="description"
								{...methods.register("description", {
									required: messages.validation.required,
								})}
							/>
							<FieldError error={methods.formState.errors["description"]} />
						</div>
					</div>
				</div>
			</>
		)
	);
}

export default ProfileAttendanceRequestHourlyMission;
