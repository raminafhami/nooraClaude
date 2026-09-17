"use client";
import moment from "moment-jalaali";
import { UseFormReturn } from "react-hook-form";

import { DateInput } from "@/form/DateInput";
import { FieldError } from "@/form/FieldError";
import { MaskInput } from "@/form/MaskInput";
import { PersonnelRequestType } from "@/hrm/personnelRequests/models/personnelRequestType";
import { messages } from "@/messages";
import { getTimeStringInNum } from "@/time/getTimeStringInNum";
import { TimeString } from "@/time/TimeString";
import { validateTimeString } from "@/time/validateTimeString";

import { FormData } from "./ProfileAttendanceRequestsForm";

function ProfileAttendanceRequestManualTime({
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
		fields.type === "manualEntry" && (
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
						<label className="pt-2 sm:basis-28" htmlFor="entryTime">
							زمان ورود:
						</label>
						<div className="min-w-[11rem] grow">
							<MaskInput
								className="text-right tracking-widest"
								dir="ltr"
								id="entryTime"
								mask="00{:}00"
								maskOptions={{ lazy: false }}
								value={fields["entryTime"]}
								onBlur={() => {
									methods.trigger("entryTime");
								}}
								onMutate={(v) => {
									methods.setValue("entryTime", (v + ":00") as TimeString, {
										shouldDirty: true,
										shouldTouch: true,
										shouldValidate: true,
									});
								}}
								{...((ref, ...register) => register)(
									methods.register("entryTime", {
										required: messages.validation.required,
										validate: validateTime,
									}),
								)}
							/>
							<FieldError error={methods.formState.errors["entryTime"]} />
						</div>
					</div>

					<div className="flex flex-col gap-x-2 gap-y-2 sm:flex-row">
						<label className="pt-2 sm:basis-28" htmlFor="exitTime">
							زمان خروج:
						</label>
						<div className="min-w-[11rem] grow">
							<MaskInput
								className="text-right tracking-widest"
								dir="ltr"
								id="exitTime"
								mask="00{:}00"
								maskOptions={{ lazy: false }}
								value={fields["exitTime"]}
								onBlur={() => {
									methods.trigger("exitTime");
								}}
								onMutate={(v) => {
									methods.setValue("exitTime", (v + ":00") as TimeString, {
										shouldDirty: true,
										shouldTouch: true,
										shouldValidate: true,
									});
								}}
								{...((ref, ...register) => register)(
									methods.register("exitTime", {
										required: messages.validation.required,
										deps: ["entryTime"],
										validate: (v, values) => {
											if (v) {
												const isValid = validateTime(v);

												if (isValid !== undefined) {
													return isValid;
												}

												const entryTime = getTimeStringInNum(
													values["entryTime"] || "00:00:00",
												);
												const exitTime = getTimeStringInNum(v);

												if (entryTime >= exitTime) {
													return "زمان پایان باید که بزرگ تر از زمان شروع باشد.";
												}
											}
										},
									}),
								)}
							/>
							<FieldError error={methods.formState.errors["exitTime"]} />
						</div>
					</div>
				</div>
			</>
		)
	);
}

export default ProfileAttendanceRequestManualTime;
