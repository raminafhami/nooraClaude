"use client";
import { useEffect, useState } from "react";
import { Controller, UseFormReturn } from "react-hook-form";

import { DateInput } from "@/form/DateInput";
import { FieldError } from "@/form/FieldError";
import { SelectDynamic } from "@/form/select";
import { Personnel } from "@/hrm/personnel/models/Personnel";
import { getPersonnel } from "@/hrm/personnel/services/getPersonnel";
import { PersonnelRequestType } from "@/hrm/personnelRequests/models/personnelRequestType";
import { messages } from "@/messages";
import { TimeString } from "@/time/TimeString";
import { compareById } from "@/utils";

import { FormData } from "./ProfileAttendanceRequestsForm";

function ProfileAttendanceRequestDailyLeave({
	methods,
}: {
	methods: UseFormReturn<FormData, any>;
}) {
	const fields = methods.watch();
	const [people, setPeople] = useState<Personnel[]>([]);

	useEffect(() => {
		const fetchPersonnel = async () => {
			try {
				setPeople(await getPersonnel({ sort: { personnelCode: "asc" } }));
			} catch {}
		};
		fetchPersonnel();
	}, []);

	return (
		fields.type === PersonnelRequestType.dailyLeave && (
			<div className="flex w-full flex-col gap-4">
				<div className="flex w-full min-w-[11rem] grow flex-col justify-between gap-x-2 gap-y-2 sm:flex-row">
					<label className="pt-2 sm:basis-28" htmlFor="dateFrom">
						تاریخ شروع:
					</label>
					<div className="min-w-[11rem] grow">
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

				<div className="flex w-full min-w-[11rem] grow flex-col justify-between gap-x-2 gap-y-2 sm:flex-row">
					<label className="pt-2 sm:basis-28" htmlFor="dateTo">
						تاریخ پایان:
					</label>
					<div className="min-w-[11rem] grow">
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
				<div className="flex w-full min-w-[11rem] grow flex-col justify-between gap-x-2 gap-y-2 sm:flex-row">
					<label className="pt-2 sm:basis-28" htmlFor="substitute">
						جانشین
					</label>
					<div className="flex grow flex-col">
						<Controller
							name="substitute"
							control={methods.control}
							render={({ field: { onChange, value } }) => (
								<SelectDynamic<Personnel>
									id="substitute"
									value={fields["substitute"]}
									onCompare={compareById}
									onLabel={(x) => x.fullname}
									onLeave={() => {
										methods.trigger("substitute");
									}}
									onMutate={(v) => {
										methods.setValue("substitute", v!, {
											shouldDirty: true,
											shouldTouch: true,
										});
										methods.register("substitute", {
											required: messages.validation.required,
										});
									}}
									onSearch={(v) => {
										return people.filter((x) => x.fullname.includes(v));
									}}
								/>
							)}
						/>
						<FieldError error={methods.formState.errors["substitute"]} />
					</div>
				</div>
			</div>
		)
	);
}

export default ProfileAttendanceRequestDailyLeave;
