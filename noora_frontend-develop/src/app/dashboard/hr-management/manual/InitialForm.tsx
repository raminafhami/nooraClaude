"use client";

import moment from "jalali-moment";
import { memo } from "react";
import { Controller, useForm } from "react-hook-form";

import { AlertDescription } from "@/components/ui/alert";
import { DestructiveAlert } from "@/components/ui/alert/destructive-alert";
import { Button } from "@/components/ui/button";
import { DateInput } from "@/form/DateInput";
import { FieldError } from "@/form/FieldError";
import { SelectDynamic } from "@/form/select/SelectDynamic";
import { searchPersonnelByName } from "@/hrm/personnel/services/searchPersonnelByName";
import { User } from "@/identity/users/models/User";
import { messages } from "@/messages";
import { Loading } from "@/ui/Loader";
import { compareById } from "@/utils/Comparators";

interface Props {
	disabled: boolean;
	onSubmit: (user: User, date: string) => Promise<void>;
}

interface FormData {
	user: User;
	date: string;
}

export const AttendanceManualInitialForm = memo(
	function AttendanceManualInitialForm({ disabled, onSubmit }: Props) {
		const {
			control,
			formState: { errors, isSubmitting },
			handleSubmit: onFormSubmit,
			setError,
		} = useForm<FormData>();

		async function handleSubmit(data: FormData) {
			try {
				await onSubmit(
					data.user,
					moment(data.date, "jYYYY/jMM/jDD").format("YYYY-MM-DD"),
				);
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
						<label className="mt-2 shrink-0 basis-20" htmlFor="user">
							کاربر:
						</label>
						<div className="grow space-y-2">
							<Controller
								control={control}
								name="user"
								render={({
									field: { name, value, onBlur, onChange },
									fieldState: { error },
								}) => (
									<>
										<SelectDynamic
											disabled={disabled}
											id={name}
											value={value}
											onCompare={compareById}
											onLabel={(x) => x.fullname}
											onLeave={onBlur}
											onMutate={onChange}
											onSearch={async (v) =>
												// Todo: delayed search
												v ? await searchPersonnelByName({ name: v }) : []
											}
										/>
										<FieldError error={error} />
									</>
								)}
								rules={{ required: messages.validation.required }}
							/>
						</div>
					</div>

					<div className="flex gap-x-2">
						<label className="mt-2 shrink-0 basis-20" htmlFor="date">
							تاریخ:
						</label>
						<div className="grow space-y-2">
							<Controller
								control={control}
								name="date"
								render={({
									field: { name, value, onBlur, onChange },
									fieldState: { error },
								}) => (
									<>
										<DateInput
											disabled={disabled}
											id={name}
											maxDate={moment(new Date()).format("jYYYY/jMM/jDD")}
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

				{!disabled && (
					<div className="ms-20 ps-2">
						<Button className="min-w-24" disabled={isSubmitting}>
							{isSubmitting ? (
								<Loading horizontalPlacement="center" size="sm" />
							) : (
								"بررسی"
							)}
						</Button>
					</div>
				)}
			</form>
		);
	},
);
