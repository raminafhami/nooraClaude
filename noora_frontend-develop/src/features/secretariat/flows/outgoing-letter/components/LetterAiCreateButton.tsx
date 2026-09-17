"use client";

import { useForm, useFormContext } from "react-hook-form";
import { FaWandMagicSparkles } from "react-icons/fa6";
import { toast } from "sonner";
import { z } from "zod";

import aiClient from "@/api/aiClient";
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
import { DialogProps, useDialogs } from "@/components/ui/dialog/use-dialogs";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { messages } from "@/messages";
import { ObjectType } from "@/utils/object/ObjectType";
import { zodResolver } from "@hookform/resolvers/zod";

import { ids } from "../models/Ids";

function LetterAiCreateButton() {
	const dialogs = useDialogs();

	const { setValue } = useFormContext();

	async function handleClick() {
		const content = await dialogs.open(LetterAiCreateDialog);

		setValue(ids.letterTo, content.to, {
			shouldDirty: true,
			shouldTouch: true,
			shouldValidate: true,
		});
		setValue(ids.letterSubject, content.subject, {
			shouldDirty: true,
			shouldTouch: true,
			shouldValidate: true,
		});
		setValue(ids.letterContent, content.body, {
			shouldDirty: true,
			shouldTouch: true,
			shouldValidate: true,
		});

		toast.success("نامه با موفقیت  با استفاده از هوش مصنوعی نوشته شد.");
	}

	return (
		<Button
			className="bg-gradient-to-r from-[#ef9b20] to-[#ffbf62] text-[#0b273c]"
			type="button"
			onClick={handleClick}
		>
			<FaWandMagicSparkles />
			<span>نوشتن نامه با هوش مصنوعی</span>
		</Button>
	);
}

const formSchema = z.object({
	subject: z.string().min(1, messages.validation.required),
});

type FormSchema = z.infer<typeof formSchema>;

function LetterAiCreateDialog({
	open,
	onClose,
}: DialogProps<void, ObjectType>) {
	const form = useForm<FormSchema>({
		defaultValues: {
			subject: "",
		},
		resolver: zodResolver(formSchema),
	});

	const {
		control,
		formState: { errors, isSubmitting, isSubmitSuccessful },
		setError,
	} = form;

	async function handleSubmit(values: FormSchema) {
		try {
			const response = await aiClient.send({
				url: "webhook/06b01c00-b6e2-4d67-b2eb-9ce7b88af69a",
				body: {
					...values,
				},
			});

			onClose(response[0].message.content);
		} catch (err) {
			console.error(err);

			setError("root.server", {
				message: "خطای نامشخصی در هنگام ثبت اطلاعات رخ داد.",
			});
		}
	}

	return (
		<Form {...form}>
			<Dialog open={open} onOpenChange={onClose.bind(null, undefined)}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>نوشتن نامه با هوش مصنوعی</DialogTitle>
					</DialogHeader>

					<form
						className="grid gap-4"
						onSubmit={form.handleSubmit(handleSubmit)}
					>
						<fieldset
							className="space-y-4"
							disabled={isSubmitting || isSubmitSuccessful}
						>
							<FormField
								control={control}
								name="subject"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											توضیحات<span className="text-red-600"> *</span>
										</FormLabel>
										<FormControl>
											<Textarea {...field} />
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

						<DialogFooter className="flex-col sm:flex-row-reverse sm:justify-normal">
							<Button
								className="min-w-24"
								disabled={isSubmitting || isSubmitSuccessful}
								type="submit"
								variant="primary"
							>
								<Spinner
									loading={isSubmitting || isSubmitSuccessful}
									color="white"
									size="sm"
								>
									ثبت
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
					</form>
				</DialogContent>
			</Dialog>
		</Form>
	);
}

export { LetterAiCreateButton };
