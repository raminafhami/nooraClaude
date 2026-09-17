"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import LockIcon from "@/assets/images/icons/lock.svg";
import ProfileIcon from "@/assets/images/icons/person.svg";
import loginByPhone from "@/auth/services/loginByPhone";
import loginByPhoneVerify from "@/auth/services/loginByPhoneVerify";
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
import { MaskInput } from "@/components/ui/mask-input";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/form/Input";
import { cn } from "@/lib/utils";
import { getDynamicUrl } from "@/utils/url/getDynamicUrl";
import { zodResolver } from "@hookform/resolvers/zod";

const loginFormSchema = z.object({
	phoneNo: z.string().min(11, "شماره همراه وارد شده نامعتبر است."),
	code: z
		.string()
		.min(5, "کد وارد شده نا معتبر می باشد")
		.max(6, "کد وارد شده نا معتبر می باشد"),
});
type FormSchema = z.infer<typeof loginFormSchema>;

export function LoginOTPForm() {
	const router = useRouter();

	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [isCodeSent, setIsCodeSent] = useState<boolean>(false);

	const [timer, setTimer] = useState(0);

	const form = useForm<FormSchema>({
		defaultValues: {
			phoneNo: "",
			code: "",
		},
		resolver: zodResolver(loginFormSchema),
	});

	const {
		control,
		formState: { errors, isSubmitting, isSubmitSuccessful },
		setError,
		watch,
	} = form;

	const { phoneNo } = watch();

	useEffect(() => {
		if (timer > 0) {
			const countdown = setInterval(() => {
				setTimer((prev) => prev - 1);
			}, 1000);
			return () => clearInterval(countdown);
		}
	}, [timer]);

	const formatTimer = (seconds: number): string => {
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		return `${String(minutes).padStart(2, "0")}:${String(
			remainingSeconds,
		).padStart(2, "0")}`;
	};

	const handleSendCode = async () => {
		try {
			setIsLoading(true);

			const response = await loginByPhone({
				phoneNo,
			});

			setIsCodeSent(true);
			setTimer(response.expireInSeconds || 120);
		} catch (err: any) {
			console.error(err);

			let errorMessage = "خطای نامشخصی رخ داده است.";

			if (err?.message === "Invalid login") {
				errorMessage = "شماره همراه و یا رمز عبور وارد شده اشتباه است.";
			}

			setError("root.server", {
				message: errorMessage,
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleSubmit = async (value: FormSchema) => {
		try {
			const res = await loginByPhoneVerify({
				phoneNo: value.phoneNo as string,
				code: value.code as string,
			});

			if (res) {
				setUniversalSession({
					accessToken: res.result?.token?.accessToken,
					refreshToken: res.result?.token?.refreshToken,
				});

				router.push(getDynamicUrl("/dashboard"));
				router.refresh();
			}
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
	};

	return (
		<Form {...form}>
			<div className="w-full">
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
								name="phoneNo"
								render={({ field: { ref, onChange, ...field } }) => (
									<FormItem>
										<div className="relative">
											<FormControl>
												<MaskInput
													className="peer cursor-default pe-8 text-right tracking-wider placeholder:tracking-normal"
													definitions={{ "!": /[0]/, "@": /[9]/, "#": /[0-9]/ }}
													dir="ltr"
													disabled={isCodeSent}
													inputRef={ref}
													mask="!@#########"
													unmask
													onAccept={(value) => onChange(value)}
													onKeyDown={(event) => {
														if (
															event.key === "Enter" &&
															!isCodeSent &&
															field.value
														) {
															event.preventDefault();
															handleSendCode();
														}
													}}
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

							{isCodeSent && (
								<FormField
									control={control}
									name="code"
									render={({ field }) => (
										<FormItem>
											<div className="relative">
												<FormControl>
													<Input
														className="peer cursor-default pe-8 text-right placeholder-destructive placeholder:tracking-wide"
														dir="ltr"
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
														کد اعتبارسنجی
													</FormLabel>
												</div>
											</div>

											<FormMessage />
										</FormItem>
									)}
								/>
							)}
						</div>

						<div className="relative w-full space-y-3">
							{timer > 0 && (
								<div className="px-6 text-end text-sm text-muted-foreground">
									{formatTimer(timer)}
								</div>
							)}

							{isCodeSent && (
								<Button
									className="h-12 w-full rounded-full border-none bg-gradient-to-r from-[#ef9b20] to-[#ffbf62] text-sm font-medium text-[#0b273c]"
									disabled={isSubmitting || isSubmitSuccessful}
									variant="outline"
									type="submit"
								>
									<Spinner loading={isSubmitting} size="sm">
										ورود
									</Spinner>
								</Button>
							)}

							<Button
								className="h-12 w-full rounded-full border-none bg-gradient-to-r from-[#ef9b20] to-[#ffbf62] text-sm font-medium text-[#0b273c]"
								disabled={
									isLoading || timer > 0 || isSubmitting || isSubmitSuccessful
								}
								variant="outline"
								type="button"
								onClick={() => handleSendCode()}
							>
								<Spinner loading={isLoading} size="sm">
									دریافت کد اعتبارسنجی
								</Spinner>
							</Button>
						</div>
					</div>
				</form>
			</div>
		</Form>
	);
}
