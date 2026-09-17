"use client";

import { useContext, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { AlertDescription } from "@/components/ui/alert";
import { DestructiveAlert } from "@/components/ui/alert/destructive-alert";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { FieldError } from "@/form/FieldError";
import updateUserPassword from "@/identity/users/services/updateUserPassword";
import { messages } from "@/messages";
import { Head } from "@/ui/Head";
import { Loading } from "@/ui/Loader";
import { zodResolver } from "@hookform/resolvers/zod";

import { PersonnelContext } from "../_components/PersonnelContext";

const schema = z
	.object({
		password: z
			.string()
			.min(4, { message: messages.validation.min("رمز عبور", 4) }),
		confirm: z.string().min(1, { message: messages.validation.required }),
	})
	.refine(({ password, confirm }) => password === confirm, {
		path: ["confirm"],
		message: "تکرار رمز عبور مطابقت ندارد.",
	});

type FormData = z.infer<typeof schema>;

const defaultValues: FormData = { password: "", confirm: "" };

function LoginSettings() {
	const { personnel } = useContext(PersonnelContext);

	const {
		control,
		formState: { errors, isDirty, isSubmitting, isSubmitSuccessful },
		handleSubmit: onSubmit,
		reset,
		setError,
	} = useForm<FormData>({
		defaultValues: { ...defaultValues },
		resolver: zodResolver(schema),
		reValidateMode: "onBlur",
	});

	async function handleSubmit(values: FormData) {
		try {
			await updateUserPassword(personnel.userId, {
				password: values.password,
			});

			toast.success("رمز عبور حساب کاربری مورد نظر با موفقیت تغییر یافت.");
		} catch (err) {
			console.error(err);
			setError("root.server", { message: "خطای نامشخصی رخ داد." });
		}
	}

	useEffect(() => {
		if (isSubmitSuccessful) {
			reset({ ...defaultValues });
		}
	}, [isSubmitSuccessful, reset]);

	return (
		<>
			<div className="max-w-96 space-y-10">
				<Head.Root>
					<Head.Title>ویرایش رمز عبور</Head.Title>
				</Head.Root>

				<form
					autoComplete="off"
					className="space-y-8"
					onSubmit={onSubmit(handleSubmit)}
				>
					{errors.root?.server && (
						<DestructiveAlert>
							<AlertDescription>{errors.root.server.message}</AlertDescription>
						</DestructiveAlert>
					)}

					<div className="space-y-4">
						<div className="space-y-2">
							<label htmlFor="password">رمز عبور جدید:</label>
							<div>
								<Controller
									control={control}
									name="password"
									render={({ field, fieldState }) => (
										<>
											<PasswordInput
												autoComplete="new-password"
												className="text-right"
												dir="ltr"
												id={field.name}
												{...field}
											/>
											<FieldError error={fieldState.error} />
										</>
									)}
								/>
							</div>
						</div>

						<div className="space-y-2">
							<label htmlFor="confirm">تکرار رمز عبور جدید:</label>
							<div>
								<Controller
									control={control}
									name="confirm"
									render={({ field, fieldState }) => (
										<>
											<PasswordInput
												autoComplete="new-password"
												className="text-right"
												dir="ltr"
												id={field.name}
												{...field}
											/>
											<FieldError error={fieldState.error} />
										</>
									)}
								/>
							</div>
						</div>
					</div>

					<div>
						<Button
							disabled={!isDirty || isSubmitting || isSubmitSuccessful}
							variant="primary"
						>
							<span>بروزرسانی</span>
							{isSubmitting && <Loading intent="white" size="xs" />}
						</Button>
					</div>
				</form>
			</div>
		</>
	);
}

export { LoginSettings };
