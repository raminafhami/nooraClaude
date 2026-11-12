"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { FaLock, FaUser } from "react-icons/fa";
import { z } from "zod";

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
import { messages } from "@/messages";
import { getDynamicUrl } from "@/utils/url/getDynamicUrl";
import { zodResolver } from "@hookform/resolvers/zod";

const loginFormSchema = z.object({
	identity: z.string().min(11, "شماره همراه وارد شده نامعتبر است."),
	password: z.string().min(1, messages.validation.required),
});

type FormSchema = z.infer<typeof loginFormSchema>;

// outlined white fields on the dark login background, label shown as placeholder
const fieldClasses =
	"h-12 rounded-[4px] border border-white/90 bg-transparent px-4 text-center text-base tracking-wider text-white placeholder:tracking-normal placeholder:text-white/85 caret-white focus-visible:border-white focus-visible:ring-2 focus-visible:ring-white/30 [&:-webkit-autofill]:shadow-[inset_0_0_0_1000px_#16243a] [&:-webkit-autofill]:[-webkit-text-fill-color:#fff]";

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
			<div className="w-[300px] max-w-[calc(100vw-6rem)]">
				{isSubmitSuccessful && (
					<Alert className="mb-5 text-center text-xs" variant="info">
						با موفقیت وارد حساب کاربری خود شدید. در حال انتقال...
					</Alert>
				)}

				{errors["root"]?.server && (
					<Alert className="mb-5 text-center text-xs" variant="destructive">
						{errors["root"].server.message}
					</Alert>
				)}

				<form
					className="flex w-full flex-col justify-center"
					onSubmit={form.handleSubmit(handleSubmit)}
				>
					<div className="space-y-5">
						<FormField
							control={control}
							name="identity"
							render={({ field: { ref, onChange, ...field } }) => (
								<FormItem className="space-y-1.5">
									<FormLabel className="sr-only">شماره همراه</FormLabel>
									<div className="relative">
										<FaUser
											aria-hidden
											className="absolute -start-9 top-1/2 size-5 -translate-y-1/2 text-white"
										/>
										<FormControl>
											<MaskInput
												className={fieldClasses}
												definitions={{ "!": /[0]/, "@": /[9]/, "#": /[0-9]/ }}
												dir="ltr"
												inputMode="numeric"
												autoComplete="username"
												inputRef={ref}
												mask="!@#########"
												placeholder="شماره همراه"
												unmask
												onAccept={(value) => onChange(value)}
												{...field}
											/>
										</FormControl>
									</div>
									<FormMessage className="text-center text-red-300" />
								</FormItem>
							)}
						/>

						<FormField
							control={control}
							name="password"
							render={({ field }) => (
								<FormItem className="space-y-1.5">
									<FormLabel className="sr-only">رمز عبور</FormLabel>
									<div className="relative">
										<FaLock
											aria-hidden
											className="absolute -start-9 top-1/2 size-5 -translate-y-1/2 text-white"
										/>
										<FormControl>
											<Input
												className={fieldClasses}
												dir="ltr"
												type="password"
												autoComplete="current-password"
												placeholder="رمز عبور"
												{...field}
											/>
										</FormControl>
									</div>
									<FormMessage className="text-center text-red-300" />
								</FormItem>
							)}
						/>
					</div>

					<Button
						className="mx-auto mt-9 h-12 w-36 rounded-md border-none bg-white text-base font-bold text-black hover:bg-white/90 focus-visible:ring-2 focus-visible:ring-white/60"
						disabled={isSubmitSuccessful || isSubmitting}
						variant="outline"
					>
						<Spinner loading={isSubmitSuccessful || isSubmitting} size="sm">
							ورود
						</Spinner>
					</Button>
				</form>
			</div>
		</Form>
	);
}

export { LoginCredentialsForm };
