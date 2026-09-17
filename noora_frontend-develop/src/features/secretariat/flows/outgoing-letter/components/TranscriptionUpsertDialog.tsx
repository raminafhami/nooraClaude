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

import { Transcription } from "../models/Transcription";

const formSchema = z.object({
	value: z.string().min(1, messages.validation.required),
});

type FormSchema = z.infer<typeof formSchema>;

function TranscriptionUpsertDialog({
	payload: { transcription },
	open,
	onClose,
}: DialogProps<{ transcription?: Transcription }, Transcription>) {
	const form = useForm<FormSchema>({
		defaultValues: { value: transcription?.value ?? "" },
		resolver: zodResolver(formSchema),
	});

	const {
		control,
		formState: { isSubmitting, isSubmitSuccessful },
	} = form;

	function handleSubmit(values: FormSchema) {
		onClose({
			id: transcription?.id ?? uuidv4(),
			value: values.value.trim(),
		});
	}

	return (
		<Dialog open={open} onOpenChange={onClose.bind(null, undefined)}>
			<DialogContent className="max-w-screen-xs">
				<DialogHeader>
					<DialogTitle>
						{transcription?.id ? "ویرایش رونوشت" : "افزودن رونوشت جدید"}
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
									name="value"
									render={({ field }) => (
										<FormItem>
											<FormLabel>
												رونوشت<span className="text-red-600"> *</span>
											</FormLabel>
											<FormControl>
												<Input {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<DialogFooter className="flex-col sm:flex-row-reverse sm:justify-start">
								<Button className="sm:min-w-24" variant="primary">
									<Spinner loading={isSubmitting} size="sm">
										{transcription?.id ? "بروزرسانی" : "افزودن"}
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

export default TranscriptionUpsertDialog;
