"use client";

import { useForm } from "react-hook-form";
import { toast } from "sonner";
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
import { MaskInput } from "@/components/ui/mask-input";
import { zodResolver } from "@hookform/resolvers/zod";

import { sendInvoiceBySms } from "../../services/sendInvoiceBySms";

const formSchema = z.object({
	phoneNo: z
		.string()
		.refine(
			(value) => /^09\d{9}$/.test(value),
			"شماره همراه وارد شده نامعتبر است.",
		),
});

type FormSchema = z.infer<typeof formSchema>;

type InvoiceSendDialogProps = {
	id: string;
};

function InvoiceSendDialog({
	payload: { id: invoiceId },
	open,
	onClose,
}: DialogProps<InvoiceSendDialogProps, string | boolean>) {
	const form = useForm<FormSchema>({
		defaultValues: {
			phoneNo: "",
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
			await sendInvoiceBySms(invoiceId, values.phoneNo);

			toast.success("پیامک حاوی لینک فاکتور با موفقیت ارسال شد.");
			onClose(true);
		} catch (err) {
			console.error(err);
			setError("root.server", { message: "خطای نامشخصی رخ داد." });
		}
	}

	return (
		<Dialog open={open} onOpenChange={onClose.bind(null, undefined)}>
			<DialogContent
				className="max-w-screen-xs"
				onInteractOutside={(event) => {
					if (isDirty) {
						event.preventDefault();
					}
				}}
			>
				<DialogHeader>
					<DialogTitle>ارسال فاکتور با پیامک</DialogTitle>
				</DialogHeader>

				<Form {...form}>
					<form
						className="space-y-8"
						onSubmit={form.handleSubmit(handleSubmit)}
					>
						<fieldset
							className="grid gap-6"
							disabled={isSubmitting || isSubmitSuccessful}
						>
							<FormField
								control={control}
								name="phoneNo"
								render={({ field: { ref, onChange, ...field } }) => (
									<FormItem>
										<FormLabel>شماره همراه</FormLabel>
										<FormControl>
											<MaskInput
												className="tracking-wider placeholder:tracking-normal rtl:text-right"
												dir="ltr"
												inputRef={ref}
												mask={/^\d+$/}
												maxLength={11}
												placeholder="مثال: 09121234567"
												unmask
												onAccept={(value) => onChange(value)}
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</fieldset>

						{errors.root?.server && (
							<DestructiveAlert>
								<AlertDescription>
									{errors.root.server.message}
								</AlertDescription>
							</DestructiveAlert>
						)}

						<DialogFooter>
							<Button
								className="min-w-24"
								disabled={isSubmitting || isSubmitSuccessful}
								type="submit"
								variant="primary"
							>
								ارسال
							</Button>

							<Button
								disabled={isSubmitting || isSubmitSuccessful}
								type="button"
								variant="ghost"
								onClick={onClose.bind(null, undefined)}
							>
								بازگشت
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}

export default InvoiceSendDialog;
