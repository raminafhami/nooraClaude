"use client";

import { memo } from "react";
import { Controller, useForm } from "react-hook-form";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { DestructiveAlert } from "@/components/ui/alert/destructive-alert";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/form/FieldError";
import { MaskInput } from "@/form/MaskInput";
import { AttendanceDateString } from "@/hrm/attendance/models/AttendanceDateString";
import { createUpdateWholeTimes } from "@/hrm/personnelRequests/services/createUpdateWholeTimes";
import { messages } from "@/messages";
import { getTimeStringInNum } from "@/time/getTimeStringInNum";
import { validateTimeString } from "@/time/validateTimeString";
import { Loading } from "@/ui/Loader";

interface Props {
	userId: string;
	date: string;
	onReset: () => void;
}

interface FormData {
	entryTime: string;
	exitTime: string;
}

export const AttendanceManualResetForm = memo(
	function AttendanceManualResetForm({ userId, date, onReset }: Props) {
		const {
			control,
			formState: { errors, isSubmitting, isSubmitSuccessful },
			handleSubmit: onFormSubmit,
			setError,
		} = useForm<FormData>();

		function handleTimeValidation(time: string) {
			const value = time.replaceAll("_", "");

			if (!validateTimeString(`${value}:00`)) {
				return "فرمت زمان وارد شده صحیح نمی باشد.";
			}
		}

		async function handleSubmit(data: FormData) {
			try {
				await createUpdateWholeTimes({
					userId: userId,
					date: date as AttendanceDateString,
					times: `${data.entryTime}:00,${data.exitTime}:00`,
				});
			} catch (err: any) {
				console.error(err);
				setError("root.server", {
					message: err?.message || "خطای نامشخصی رخ داد.",
				});
			}
		}

		return (
			<form className="space-y-6" onSubmit={onFormSubmit(handleSubmit)}>
				<div className="space-y-3">
					<div className="flex gap-x-2">
						<label className="mt-2 shrink-0 basis-20" htmlFor="entryTime">
							زمان ورود:
						</label>
						<div className="grow space-y-2">
							<Controller
								control={control}
								name="entryTime"
								render={({
									field: { name, value, onBlur, onChange },
									fieldState: { error },
								}) => (
									<>
										<MaskInput
											className="text-right tracking-widest"
											dir="ltr"
											disabled={isSubmitSuccessful}
											id={name}
											mask="00{:}00"
											maskOptions={{ lazy: false }}
											value={value}
											onBlur={onBlur}
											onMutate={onChange}
										/>
										<FieldError error={error} />
									</>
								)}
								rules={{
									required: messages.validation.required,
									validate: handleTimeValidation,
								}}
							/>
						</div>
					</div>

					<div className="flex gap-x-2">
						<label className="mt-2 shrink-0 basis-20" htmlFor="exitTime">
							زمان خروج:
						</label>
						<div className="grow space-y-2">
							<Controller
								control={control}
								name="exitTime"
								render={({
									field: { name, value, onBlur, onChange },
									fieldState: { error },
								}) => (
									<>
										<MaskInput
											className="text-right tracking-widest"
											dir="ltr"
											disabled={isSubmitSuccessful}
											id={name}
											mask="00{:}00"
											maskOptions={{ lazy: false }}
											value={value}
											onBlur={onBlur}
											onMutate={onChange}
										/>
										<FieldError error={error} />
									</>
								)}
								rules={{
									required: messages.validation.required,
									validate: (v, values) => {
										const isValidTime = handleTimeValidation(v);

										if (isValidTime !== undefined) {
											return isValidTime;
										}

										const entryTime = getTimeStringInNum(
											values["entryTime"] || "00:00:00",
										);
										const exitTime = getTimeStringInNum(v);

										if (entryTime >= exitTime) {
											return "زمان خروج باید که پس از از زمان ورود باشد.";
										}
									},
								}}
							/>
						</div>
					</div>
				</div>

				{errors["root"]?.server && (
					<div className="ms-20 ps-2">
						<DestructiveAlert>
							<AlertDescription>
								{errors["root"].server.message}
							</AlertDescription>
						</DestructiveAlert>
					</div>
				)}

				{isSubmitSuccessful && (
					<div className="ms-20 ps-2">
						<Alert variant="success">
							<AlertDescription>
								زمان ورود و خروج جدید با موفقیت ثبت گردید.
							</AlertDescription>
						</Alert>
					</div>
				)}

				<div className="ms-20 flex items-center gap-x-5 ps-2">
					{!isSubmitSuccessful ? (
						<>
							<Button className="min-w-24" disabled={isSubmitting}>
								{isSubmitting ? (
									<Loading horizontalPlacement="center" size="sm" />
								) : (
									"ثبت"
								)}
							</Button>

							<span
								className="cursor-pointer underline underline-offset-2"
								onClick={() => onReset()}
							>
								انصراف
							</span>
						</>
					) : (
						<Button className="min-w-24" onClick={() => onReset()}>
							بازگشت
						</Button>
					)}
				</div>
			</form>
		);
	},
);
