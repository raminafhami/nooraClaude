"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import LockIcon from "@/assets/images/icons/lock.svg";
import ProfileIcon from "@/assets/images/icons/person.svg";
import { login } from "@/auth/services/login";
import setUniversalSession from "@/auth/utils/setUniversalSession";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { MaskInput } from "@/components/ui/mask-input";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { messages } from "@/messages";
import { getDynamicUrl } from "@/utils/url/getDynamicUrl";
import { zodResolver } from "@hookform/resolvers/zod";

const loginFormSchema = z.object({
	identity: z.string().min(11, "شماره همراه وارد شده نامعتبر است."),
	password: z.string().min(1, messages.validation.required),
});

type FormSchema = z.infer<typeof loginFormSchema>;

function LoginCredentialsForm() {
	const router = useRouter();

	const form = useForm<FormSchema>({
		defaultValues: {
			identity: "",
			password: "",
		},
		resolver: zodResolver(loginFormSchema),
	});

	const {
		control,
		formState: { errors, isSubmitSuccessful, isSubmitting },
		setError,
	} = form;

	async function handleSubmit(values: FormSchema) {
		try {
			const result = await login({
				identity: values.identity,
				password: values.password,
			});

			setUniversalSession({
				accessToken: result.accessToken,
				refreshToken: result.refreshToken,
			});
		} catch (err: any) {
			console.error(err);

			let errorMessage = "";
			switch (err?.message) {
				case "Invalid login":
					errorMessage = "شماره همراه و یا رمز عبور وارد شده اشتباه است.";
					break;
				default:
					errorMessage = "خطای نامشخصی رخ داده است.";
			}

			setError("root.server", {
				message: errorMessage,
			});
		}
	}

	// const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
	const callbackUrl = "/dashboard";

	useEffect(() => {
		if (isSubmitSuccessful) {
			router.push(getDynamicUrl(callbackUrl));
			router.refresh();
		}
	}, [isSubmitSuccessful, router]);

	return (
		<Form {...form}>
			<div className="min-w-96">
				{isSubmitSuccessful && (
					<Alert className="mt-4 text-center text-xs" variant="info">
						با موفقیت وارد حساب کاربری خود شدید. در حال انتقال...
					</Alert>
				)}

				{errors["root"]?.server && (
					<Alert className="mt-4 text-center text-xs" variant="destructive">
						{errors["root"].server.message}
					</Alert>
				)}

				<form
					className="mt-6 flex w-full flex-col justify-center"
					onSubmit={form.handleSubmit(handleSubmit)}
				>
					<div className="space-y-8">
						<div className="space-y-5">
							<FormField
								control={control}
								name="identity"
								render={({ field: { ref, onChange, ...field } }) => (
									<FormItem>
										<div className="relative">
											<FormControl>
												<MaskInput
													className="peer cursor-default pe-8 text-right tracking-wider placeholder:tracking-normal"
													definitions={{ "!": /[0]/, "@": /[9]/, "#": /[0-9]/ }}
													dir="ltr"
													inputRef={ref}
													mask="!@#########"
													unmask
													onAccept={(value) => onChange(value)}
													{...field}
												/>
											</FormControl>

											<div className="absolute top-1 flex size-10 -translate-y-1 items-center justify-center">
												<Image
													src={ProfileIcon}
													alt=""
													width={18}
													height={18}
												/>
											</div>

											<div
												className={cn(
													"absolute start-8 top-0 top-px flex h-10 items-center rounded-b-md text-gray-500 transition-all peer-focus:-top-5 peer-focus:start-2",
													field.value && "-top-5 start-2",
												)}
											>
												<FormLabel className="rounded-b-md bg-white px-1">
													شماره همراه
												</FormLabel>
											</div>
										</div>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={control}
								name="password"
								render={({ field }) => (
									<FormItem>
										<div className="relative">
											<FormControl>
												<Input
													className="peer cursor-default pe-8 text-right placeholder-destructive placeholder:tracking-wide"
													dir="ltr"
													type="password"
													{...field}
												/>
											</FormControl>

											<div className="absolute top-1 flex size-10 -translate-y-1 items-center justify-center">
												<Image src={LockIcon} alt="" width={18} height={18} />
											</div>

											<div
												className={cn(
													"absolute start-8 top-0 top-px flex h-10 items-center rounded-b-md text-gray-500 transition-all peer-focus:-top-5 peer-focus:start-2",
													field.value && "-top-5 start-2",
												)}
											>
												<FormLabel className="rounded-b-md bg-white px-1">
													رمز عبور
												</FormLabel>
											</div>
										</div>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<div>
							<Button
								className="h-12 w-full rounded-full border-none bg-gradient-to-r from-[#ef9b20] to-[#ffbf62] text-sm font-medium text-[#0b273c]"
								disabled={isSubmitSuccessful || isSubmitting}
								variant="outline"
							>
								<Spinner
									color="white"
									loading={isSubmitSuccessful || isSubmitting}
									size="sm"
								>
									ورود
								</Spinner>
							</Button>
						</div>
					</div>
				</form>
			</div>
		</Form>
	);
}

export { LoginCredentialsForm };
