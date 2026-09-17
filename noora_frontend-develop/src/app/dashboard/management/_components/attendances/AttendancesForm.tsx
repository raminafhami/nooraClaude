import { memo, useEffect } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { FaFileLines } from "react-icons/fa6";

import { Button } from "@/components/ui/button";
import { DateInput } from "@/form/DateInput";
import { FieldError } from "@/form/FieldError";
import { Select } from "@/form/select";
import { AttendanceDateString } from "@/hrm/attendance/models/AttendanceDateString";
import { messages } from "@/messages";
import { Card } from "@/ui/Card";

import { AttendancesPersonnel } from "./AttendancesPersonnel";
import { AttendancesQuery } from "./Reports";

interface Props {
	onQuerySubmit: (query: AttendancesQuery) => void;
}

const reportTypes = [
	{
		name: "aggregateReport",
		label: "گزارش تجمیعی",
		value: "aggregateReport",
	},
	{
		name: "personalReport",
		label: "گزارش فردی",
		value: "personalReport",
	},
];

export const AttendancesForm = memo(function AttendancesForm({
	onQuerySubmit,
}: Props): React.ReactNode {
	const methods = useForm<AttendancesQuery>({ mode: "onTouched" });
	const { formState, handleSubmit, register, setValue, watch } = methods;
	const { errors } = formState;
	const fields = watch();

	useEffect(() => {
		if (fields["type"] === "aggregateReport")
			setValue("personnel", [], {
				shouldDirty: true,
				shouldTouch: true,
				shouldValidate: true,
			});
	}, [fields["type"]]);

	return (
		<FormProvider {...methods}>
			<form
				onSubmit={handleSubmit((values) => {
					onQuerySubmit(values);
				})}
			>
				<Card className="max-w-[20rem] space-y-5 pb-5" padding="xl">
					<div className="space-y-3">
						<div className="flex">
							<label className="shrink-0 basis-20 py-2" htmlFor="type">
								نوع گزارش:
							</label>
							<div className="grow">
								<Controller
									name="type"
									control={methods.control}
									render={({ field: { onChange, value } }) => (
										<Select
											className="rounded-lg"
											id="type"
											items={reportTypes}
											value={fields["type"]}
											onLeave={() => {
												methods.trigger("type");
											}}
											onMutate={(v) => {
												methods.reset({ type: v as AttendancesQuery["type"] });
												methods.setValue(
													"type",
													v! as AttendancesQuery["type"],
													{
														shouldDirty: true,
														shouldTouch: true,
														shouldValidate: true,
													},
												);
											}}
										/>
									)}
								/>
							</div>
						</div>
						<div className="flex">
							<label className="shrink-0 basis-20 py-2" htmlFor="dateFrom">
								از تاریخ:
							</label>
							<div className="grow">
								<DateInput
									value={fields["dateFrom"] || ""}
									onBlur={() => {
										methods.trigger("dateFrom");
									}}
									onMutate={(v) => {
										methods.setValue("dateFrom", v as AttendanceDateString, {
											shouldDirty: true,
											shouldTouch: true,
											shouldValidate: true,
										});
									}}
									{...((ref, ...register) => register)(
										methods.register("dateFrom", {
											deps: ["dateTo"],
											required: messages.validation.required,
										}),
									)}
								/>
								<FieldError error={methods.formState.errors["dateFrom"]} />
							</div>
						</div>

						<div className="flex">
							<label className="shrink-0 basis-20 py-2" htmlFor="dateTo">
								تا تاریخ:
							</label>
							<div className="grow">
								<DateInput
									value={fields["dateTo"] || ""}
									onBlur={() => {
										methods.trigger("dateTo");
									}}
									onMutate={(v) => {
										methods.setValue("dateTo", v as AttendanceDateString, {
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
												if (v && values["dateFrom"]) {
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
					</div>

					{fields["type"] === "personalReport" && <AttendancesPersonnel />}

					<div className="relative flex h-0 items-center justify-center">
						<Button className="relative top-5">
							<FaFileLines className="mx-1" />
							نمایش گزارش
						</Button>
					</div>
				</Card>
			</form>
		</FormProvider>
	);
});
