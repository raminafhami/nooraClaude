"use client";

import { memo, useRef } from "react";
import { useForm } from "react-hook-form";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/form/FieldError";
import { Input } from "@/form/Input";
import { MaskInput } from "@/form/MaskInput";
import { Workshift } from "@/hrm/attendance/models/Workshift";
import { createWorkshift } from "@/hrm/attendance/services/createWorkshift";
import { messages } from "@/messages";
import { getTimeStringInNum } from "@/time/getTimeStringInNum";
import { TimeString } from "@/time/TimeString";
import { validateTimeString } from "@/time/validateTimeString";
import { Head } from "@/ui/Head";
import { Loading } from "@/ui/Loader";

interface FormData {
	entryTime: TimeString;
	exitTime: TimeString;
	flexible: TimeString;
	title: string;
	legalExtra: string;
}

function validateTime(time: string): boolean | string | undefined {
	const value = time.replaceAll("_", "") + ":00";

	if (value.length < 8) {
		return false;
	}

	if (!validateTimeString(value)) {
		return "فرمت زمان وارد شده صحیح نمی باشد.";
	}
}

export const WorkshiftAddForm = memo(function WorkshiftAddForm({
	onWorkshiftAdd,
}: {
	onWorkshiftAdd: (workshift: Workshift) => void;
}): React.ReactNode {
	const {
		formState,
		handleSubmit,
		register,
		reset,
		setError,
		setValue,
		trigger,
		watch,
	} = useForm<FormData>({
		mode: "onTouched",
	});
	const { errors, isDirty, isSubmitting, isSubmitSuccessful, isValid } =
		formState;
	const fields = watch();
	console.log(fields);
	const entryTimeInp = useRef<HTMLInputElement | null>(null);

	return (
		<div className="mb-10 space-y-8 xl:mb-0">
			<Head.Root>
				<Head.Title>افزودن شیفت کاری جدید</Head.Title>
			</Head.Root>
			<form
				onSubmit={handleSubmit(async (data) => {
					try {
						const entryTime = data.entryTime + ":00";
						const exitTime = data.exitTime + ":00";
						const flexible = data.flexible + ":00";
						const legalExtra = data.legalExtra + ":00";
						const workshift = await createWorkshift({
							entryTime,
							exitTime,
							flexible,
							title: data.title,
							legalExtra,
						});
						onWorkshiftAdd(workshift);
						reset(undefined);
						entryTimeInp.current?.focus();
					} catch (err) {
						setError("root.server", { message: "Something went wrong..." });
					}
				})}
			>
				<div className="grid grid-cols-3 gap-y-4">
					{!isSubmitting && isSubmitSuccessful && (
						<Alert
							className="col-span-1 col-start-1 mb-4 xl:col-span-3"
							variant="info"
						>
							<AlertDescription>
								شیفت کاری مورد نظر با موفقیت افزوده شد.
							</AlertDescription>
						</Alert>
					)}
					<div className="col-span-1 col-start-1 flex gap-x-4 xl:col-span-3">
						<label className="shrink-0 basis-24 pt-2" htmlFor="title">
							عنوان شیفت:
						</label>
						<div className="grow">
							<Input
								id="title"
								{...register("title", {
									required: messages.validation.required,
								})}
							/>
							<FieldError error={formState.errors["title"]} />
						</div>
					</div>
					<div className="col-span-1 col-start-1 flex gap-x-4 xl:col-span-3">
						<label className="shrink-0 basis-24 pt-2" htmlFor="entryTime">
							زمان شروع:
						</label>
						<div className="grow">
							<MaskInput
								className="text-right tracking-widest"
								dir="ltr"
								id="entryTime"
								mask="00{:}00"
								maskOptions={{ lazy: false }}
								ref={entryTimeInp}
								value={fields["entryTime"]}
								onBlur={() => {
									trigger("entryTime");
								}}
								onMutate={(v) => {
									setValue("entryTime", v as TimeString, {
										shouldDirty: true,
										shouldTouch: true,
										shouldValidate: true,
									});
								}}
								{...((ref, ...register) => register)(
									register("entryTime", {
										deps: ["exitTime"],
										required: messages.validation.required,
										validate: validateTime,
									}),
								)}
							/>
							<FieldError error={errors["entryTime"]} />
						</div>
					</div>

					<div className="col-span-1 col-start-1 flex gap-x-4 xl:col-span-3">
						<label className="shrink-0 basis-24 pt-2" htmlFor="exitTime">
							زمان پایان:
						</label>
						<div className="grow">
							<MaskInput
								className="text-right tracking-widest"
								dir="ltr"
								id="exitTime"
								mask="00{:}00"
								maskOptions={{ lazy: false }}
								value={fields["exitTime"]}
								onBlur={() => {
									trigger("exitTime");
								}}
								onMutate={(v) => {
									setValue("exitTime", v as TimeString, {
										shouldDirty: true,
										shouldTouch: true,
										shouldValidate: true,
									});
								}}
								{...((ref, ...register) => register)(
									register("exitTime", {
										required: messages.validation.required,
										validate: (v, values) => {
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
										},
									}),
								)}
							/>
							<FieldError error={errors["exitTime"]} />
						</div>
					</div>

					<div className="col-span-1 col-start-1 flex gap-x-4 xl:col-span-3">
						<label className="shrink-0 basis-24 pt-2" htmlFor="flexible">
							شناوری:
						</label>
						<div className="grow">
							<MaskInput
								className="text-right tracking-widest"
								dir="ltr"
								id="flexible"
								mask="00{:}00"
								maskOptions={{ lazy: false }}
								value={fields["flexible"]}
								onBlur={() => {
									trigger("flexible");
								}}
								onMutate={(v) => {
									setValue("flexible", v as TimeString, {
										shouldDirty: true,
										shouldTouch: true,
										shouldValidate: true,
									});
								}}
								{...((ref, ...register) => register)(
									register("flexible", {
										required: messages.validation.required,
										validate: validateTime,
									}),
								)}
							/>
							<FieldError error={errors["flexible"]} />
						</div>
					</div>
					<div className="col-span-1 col-start-1 flex gap-x-4 xl:col-span-3">
						<label className="shrink-0 basis-24 pt-2" htmlFor="legalExtra">
							اضافه کاری قانونی:
						</label>
						<div className="grow">
							<MaskInput
								className="text-right tracking-widest"
								dir="ltr"
								id="legalExtra"
								mask="00{:}00"
								maskOptions={{ lazy: false }}
								value={fields["legalExtra"]}
								onBlur={() => {
									trigger("legalExtra");
								}}
								onMutate={(v) => {
									setValue("legalExtra", v as TimeString, {
										shouldDirty: true,
										shouldTouch: true,
										shouldValidate: true,
									});
								}}
								{...((ref, ...register) => register)(
									register("legalExtra", {
										required: messages.validation.required,
										validate: validateTime,
									}),
								)}
							/>
							<FieldError error={errors["legalExtra"]} />
						</div>
					</div>
					<div className="col-span-1 col-start-1 mt-4 xl:col-span-3">
						<div className="ms-28">
							<Button className="w-24" disabled={!isDirty || isSubmitting}>
								{isSubmitting ? (
									<Loading
										horizontalPlacement="center"
										intent="white"
										size="sm"
									/>
								) : isSubmitSuccessful && !isDirty ? (
									"افزوده شد!"
								) : (
									"افزودن"
								)}
							</Button>
						</div>
					</div>
				</div>
			</form>
		</div>
	);
});
