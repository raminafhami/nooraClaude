"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";

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
import { Spinner } from "@/components/ui/spinner";
import { configEmail } from "@/emails/services/configEmail";
import { messages } from "@/messages";
import { zodResolver } from "@hookform/resolvers/zod";

import { useEmailsContext } from "../_module/EmailContext";

const schema = z.object({
	user: z.string().min(1, messages.validation.required),
	password: z.string().min(1, messages.validation.required),
});

type FormSchema = z.infer<typeof schema>;

const LoginEmailForm = () => {
	const form = useForm<FormSchema>({
		defaultValues: {
			user: "",
			password: "",
		},
		resolver: zodResolver(schema),
	});

	const {
		control,
		handleSubmit,
		formState: { isSubmitting },
		setError,
	} = form;

	const { getUserConfig } = useEmailsContext();

	async function onSubmit(values: FormSchema) {
		try {
			await configEmail({
				user: values.user,
				password: values.password,
			});

			const result = await getUserConfig();
			if (!result) {
				setError("root.server", {
					message: "نام کاربری یا رمز عبور اشتباه است.",
				});
			}
		} catch (err: any) {
			console.error(err);
			setError("root.server", {
				message: "خطای نامشخصی رخ داده است.",
			});
		}
	}

	return (
		<div className="mx-auto w-full max-w-md rounded-lg p-6 shadow-md">
			<Form {...form}>
				<form onSubmit={handleSubmit(onSubmit)}>
					<fieldset className="space-y-4" disabled={isSubmitting}>
						<FormField
							control={control}
							name="user"
							render={({ field }) => (
								<FormItem>
									<FormLabel>نام کاربری</FormLabel>
									<FormControl>
										<Input {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={control}
							name="password"
							render={({ field }) => (
								<FormItem>
									<FormLabel>رمز عبور</FormLabel>
									<FormControl>
										<Input {...field} type="password" />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="flex flex-col xs:flex-row-reverse">
							<Button className="xs:min-w-24" variant="primary" type="submit">
								{isSubmitting && <Spinner />}
								<span>ورود</span>
							</Button>
						</div>
					</fieldset>
				</form>
			</Form>
		</div>
	);
};

export { LoginEmailForm };
