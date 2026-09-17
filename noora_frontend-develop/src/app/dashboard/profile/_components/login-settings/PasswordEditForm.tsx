"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import { AlertDescription } from "@/components/ui/alert";
import { DestructiveAlert } from "@/components/ui/alert/destructive-alert";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { PasswordInput } from "@/components/ui/password-input";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import updateUserPassword from "@/identity/users/services/updateUserPassword";
import { messages } from "@/messages";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z
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

type FormSchema = z.infer<typeof formSchema>;

function PasswordEditForm() {
	const { identity } = useLoggedInUser();

	const form = useForm<FormSchema>({
		defaultValues: { password: "", confirm: "" },
		resolver: zodResolver(formSchema),
	});

	const {
		control,
		formState: { errors, isDirty, isSubmitting, isSubmitSuccessful },
		reset,
		setError,
	} = form;

	async function handleSubmit(values: FormSchema) {
		try {
			await updateUserPassword(identity.id, {
				password: values.password,
			});

			toast.success("رمز عبور حساب کاربری شما با موفقیت تغییر یافت.");
		} catch (err) {
			console.error(err);
			setError("root.server", { message: "خطای نامشخصی رخ داد." });
		}
	}

	useEffect(() => {
		if (isSubmitSuccessful) {
			reset({ password: "", confirm: "" });
		}
	}, [isSubmitSuccessful, reset]);

	return (
		<div className="space-y-6">
			<div className="flex items-center gap-3">
				<div className="shrink-0 text-base">رمز عبور</div>
				<Separator className="h-0.5 w-auto grow" />
			</div>

			<Form {...form}>
				<form
					autoComplete="off"
					className="grid grid-cols-12 gap-6"
					onSubmit={form.handleSubmit(handleSubmit)}
				>
					<fieldset
						className="col-span-full space-y-4 sm:col-span-6 lg:col-span-4 xl:col-span-3"
						disabled={isSubmitting || isSubmitSuccessful}
					>
						<FormField
							control={control}
							name="password"
							render={({ field }) => (
								<FormItem>
									<FormLabel>رمز عبور جدید</FormLabel>
									<FormControl>
										<PasswordInput
											autoComplete="new-password"
											className="rtl:text-right"
											dir="ltr"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={control}
							name="confirm"
							render={({ field }) => (
								<FormItem>
									<FormLabel>تکرار رمز عبور جدید</FormLabel>
									<FormControl>
										<PasswordInput
											autoComplete="new-password"
											className="rtl:text-right"
											dir="ltr"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</fieldset>

					{errors.root?.server && (
						<DestructiveAlert className="col-span-full sm:col-span-6 lg:col-span-4 xl:col-span-3">
							<AlertDescription>{errors.root.server.message}</AlertDescription>
						</DestructiveAlert>
					)}

					<div className="col-span-full flex flex-col xs:flex-row">
						<Button
							className="min-w-24"
							disabled={!isDirty || isSubmitting || isSubmitSuccessful}
							type="submit"
							variant="primary"
						>
							<Spinner loading={isSubmitting} color="white" size="sm">
								بروزرسانی
							</Spinner>
						</Button>
					</div>
				</form>
			</Form>
		</div>
	);
}

export { PasswordEditForm };
