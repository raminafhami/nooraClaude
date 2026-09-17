"use client";

import { useForm } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

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
import { messages } from "@/messages";
import { zodResolver } from "@hookform/resolvers/zod";

import { EmailRecipient } from "../models/EmailRecipient";

const formSchema = z.object({
	address: z.string().min(1, messages.validation.required),
});

type FormSchema = z.infer<typeof formSchema>;

function EmailRecipientUpsertDialog({
	payload: { recipient },
	open,
	onClose,
}: DialogProps<{ recipient?: EmailRecipient }, EmailRecipient>) {
	const form = useForm<FormSchema>({
		defaultValues: { address: recipient?.address ?? "" },
		resolver: zodResolver(formSchema),
	});

	const {
		control,
		formState: { isSubmitting, isSubmitSuccessful },
	} = form;

	function handleSubmit(values: FormSchema) {
		onClose({
			id: recipient?.id ?? uuidv4(),
			type: "email",
			address: values.address.trim(),
		});
	}

	return (
		<Dialog open={open} onOpenChange={onClose.bind(null, undefined)}>
			<DialogContent className="max-w-screen-xs">
				<DialogHeader>
					<DialogTitle>
						{recipient?.id ? "ویرایش گیرنده" : "افزودن گیرنده جدید"}
					</DialogTitle>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(handleSubmit)}>
						<fieldset
							className="space-y-6"
							disabled={isSubmitting || isSubmitSuccessful}
						>
							<div className="space-y-4">
								<FormField
									control={control}
									name="address"
									render={({ field }) => (
										<FormItem>
											<FormLabel>
												پست الکترونیک<span className="text-red-600"> *</span>
											</FormLabel>
											<FormControl>
												<Input
													className="rtl:text-right"
													dir="ltr"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<DialogFooter className="flex-col sm:flex-row-reverse sm:justify-start">
								<Button className="sm:min-w-24" variant="primary">
									<Spinner loading={isSubmitting} size="sm">
										{recipient?.id ? "بروزرسانی" : "افزودن"}
									</Spinner>
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

export { EmailRecipientUpsertDialog };
