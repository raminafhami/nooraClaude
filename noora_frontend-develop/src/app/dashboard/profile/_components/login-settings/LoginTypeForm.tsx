"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import changeLoginType from "@/api/own-settings/changeLoginType";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import {
	UserLoginType,
	userLoginTypeOptions,
} from "@/identity/users/enums/UserLoginType";
import { User } from "@/identity/users/models/User";
import { messages } from "@/messages";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
	loginType: z.custom<UserLoginType>(Boolean, messages.validation.required),
});

type FormSchema = z.infer<typeof formSchema>;

function LoginTypeForm({ user }: { user: User }) {
	const { identity } = useLoggedInUser();

	const form = useForm<FormSchema>({
		defaultValues: { loginType: user.loginType as UserLoginType },
		resolver: zodResolver(formSchema),
	});

	const {
		control,
		formState: { errors, isDirty, isSubmitting, isSubmitSuccessful },
		reset,
		setError,
		watch,
	} = form;

	const { loginType } = watch();

	async function handleSubmit(values: FormSchema) {
		try {
			await changeLoginType({
				loginType: values.loginType,
			});

			toast.success("نحوه ورود به حساب کاربری شما با موفقیت بروزرسانی شد.");
		} catch (err) {
			console.error(err);
			setError("root.server", { message: "خطای نامشخصی رخ داد." });
		}
	}

	useEffect(() => {
		if (isSubmitSuccessful) {
			reset({ loginType });
		}
	}, [isSubmitSuccessful, loginType, reset]);

	return (
		<div className="space-y-6">
			<div className="flex items-center gap-3">
				<div className="shrink-0 text-base">نحوه ورود به حساب کاربری</div>
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
							name="loginType"
							render={({ field: { ref, onChange, ...field } }) => (
								<FormItem>
									<FormLabel>نحوه ورود</FormLabel>
									<FormControl>
										<Select onValueChange={onChange} {...field}>
											<SelectTrigger ref={ref}>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectContent>
													{userLoginTypeOptions.map((item) => (
														<SelectItem key={item.value} value={item.value}>
															{item.label}
														</SelectItem>
													))}
												</SelectContent>
											</SelectContent>
										</Select>
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

export { LoginTypeForm };
