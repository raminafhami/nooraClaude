"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";

import { AlertDescription } from "@/components/ui/alert";
import { DestructiveAlert } from "@/components/ui/alert/destructive-alert";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { DialogProps } from "@/components/ui/dialog/use-dialogs";
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
import { getDispatcherCategoryByCode } from "@/inspection/dispatcher-category/services/getDispatcherCategoryByCode";
import { messages } from "@/messages";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
	tariffNo: z
		.string()
		.min(1, messages.validation.required)
		.length(8, "کد تعرفه گمرکی وارد شده نامعتبر است."),
});

type FormSchema = z.infer<typeof formSchema>;

function CustomsTariffNoAddDialog({
	open,
	onClose,
}: DialogProps<undefined, string | undefined>) {
	const form = useForm<FormSchema>({
		defaultValues: {
			tariffNo: "",
		},
		resolver: zodResolver(formSchema),
	});

	const {
		control,
		formState: { errors, isDirty, isSubmitting, isSubmitSuccessful },
		setError,
	} = form;

	async function handleSubmit(values: FormSchema) {
		try {
			const result = await getDispatcherCategoryByCode(values.tariffNo);

			if (!result.categories.length) {
				setError("tariffNo", { message: "کد تعرفه مورد نظر یافت نشد." });
				return;
			}

			onClose(values.tariffNo);
		} catch {
			setError("root.server", { message: "خطای نامشخصی رخ داد." });
		}
	}

	return (
		<Dialog open={open} onOpenChange={onClose.bind(null, undefined)}>
			<DialogContent
				aria-describedby={undefined}
				className="max-w-screen-xs"
				onInteractOutside={(event) => {
					if (isDirty) {
						event.preventDefault();
					}
				}}
			>
				<DialogHeader>
					<DialogTitle>افزدن کد تعرفه گمرکی</DialogTitle>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(handleSubmit)}>
						<fieldset
							className="space-y-8"
							disabled={isSubmitting || isSubmitSuccessful}
						>
							<div className="grid gap-6">
								<FormField
									control={control}
									name="tariffNo"
									render={({ field }) => (
										<FormItem>
											<FormLabel>کد تعرفه گمرکی</FormLabel>
											<FormControl>
												<Input maxLength={8} {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							{errors.root?.server && (
								<DestructiveAlert>
									<AlertDescription>
										{errors.root.server.message}
									</AlertDescription>
								</DestructiveAlert>
							)}

							<DialogFooter>
								<Button className="min-w-24" type="submit" variant="primary">
									<Spinner loading={isSubmitting}>افزودن</Spinner>
								</Button>

								<Button
									type="button"
									variant="ghost"
									onClick={onClose.bind(null, undefined)}
								>
									بازگشت
								</Button>
							</DialogFooter>
						</fieldset>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}

export default CustomsTariffNoAddDialog;
