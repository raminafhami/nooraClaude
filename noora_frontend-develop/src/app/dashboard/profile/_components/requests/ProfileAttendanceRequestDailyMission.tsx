"use client";
import { UseFormReturn } from "react-hook-form";

import { DateInput } from "@/form/DateInput";
import { FieldError } from "@/form/FieldError";
import { Input } from "@/form/Input";
import { PersonnelRequestType } from "@/hrm/personnelRequests/models/personnelRequestType";
import { messages } from "@/messages";
import { TimeString } from "@/time/TimeString";

import { FormData } from "./ProfileAttendanceRequestsForm";

function ProfileAttendanceRequestDailyMission({
	methods,
}: {
	methods: UseFormReturn<FormData, any>;
}) {
	const fields = methods.watch();

	return (
		fields.type === PersonnelRequestType.dailyMission && (
			<div className="flex w-full flex-col gap-y-4">
				<div className="flex w-full min-w-[11rem] grow flex-col justify-between gap-x-2 gap-y-2 sm:flex-row">
					<label className="pt-2 sm:basis-28" htmlFor="dateFrom">
						تاریخ شروع:
					</label>
					<div className="min-w-[11rem] grow">
						{" "}
						<DateInput
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
								}),
							)}
						/>
						<FieldError error={methods.formState.errors["dateFrom"]} />
					</div>
				</div>

				<div className="flex flex-col gap-x-2 gap-y-2 sm:flex-row">
					<label className="pt-2 sm:basis-28" htmlFor="dateTo">
						تاریخ پایان:
					</label>
					<div className="min-w-[11rem] grow">
						{" "}
						<DateInput
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
				<div className="flex flex-col gap-x-2 gap-y-2 sm:flex-row">
					<label className="pt-2 sm:basis-28" htmlFor="description">
						توضیحات:
					</label>
					<div className="min-w-[11rem] grow">
						{" "}
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
		)
	);
}

export default ProfileAttendanceRequestDailyMission;
