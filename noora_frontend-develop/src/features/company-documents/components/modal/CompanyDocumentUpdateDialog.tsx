"use client";

import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { CompanyDocument } from "@/company-documents/models/CompanyDocument";
import { updateCompanyDocument } from "@/company-documents/services/updateCompanyDocument";
import {
	isJalaliBefore,
	toApiDate,
	toJalaliInput,
} from "@/company-documents/utils/documentDate";
import { AlertDescription } from "@/components/ui/alert";
import { DestructiveAlert } from "@/components/ui/alert/destructive-alert";
import { Button } from "@/components/ui/button";
import { DateInput } from "@/components/ui/date-input";
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
import { messages } from "@/messages";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z
	.object({
		title: z.string().min(1, messages.validation.required),
		description: z.string().min(1, messages.validation.required),
		date: z.string().min(1, messages.validation.required),
		expiryDate: z.string(),
	})
	.refine(
		({ date, expiryDate }) =>
			!date || !expiryDate || !isJalaliBefore(expiryDate, date),
		{
			path: ["expiryDate"],
			message: "تاریخ انقضا نمی‌تواند قبل از تاریخ صدور باشد.",
		},
	);

type FormSchema = z.infer<typeof formSchema>;

function CompanyDocumentUpdateDialog({
	payload,
	open,
	onClose,
}: DialogProps<
	{
		document: CompanyDocument;
	},
	string | boolean
>) {
	const form = useForm<FormSchema>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			title: payload.document.title ?? "",
			description: payload.document.description ?? "",
			date: toJalaliInput(payload.document.date),
			expiryDate: toJalaliInput(payload.document.expiryDate),
		},
	});

	const {
		control,
		formState: { errors, isSubmitting, isDirty, isSubmitSuccessful },
		handleSubmit,
		setError,
	} = form;

	const onSubmit = async (values: FormSchema) => {
		try {
			await updateCompanyDocument(payload.document.id, {
				title: values.title,
				description: values.description,
				date: toApiDate(values.date),
				expiryDate: values.expiryDate ? toApiDate(values.expiryDate) : null,
			});

			toast.success("مدرک با موفقیت ویرایش شد");

			onClose(true);
		} catch (error) {
			setError("root.server", {
				message: "خطای نامشخصی در هنگام بروزرسانی اطلاعات رخ داد.",
			});
		}
	};

	return (
		<Dialog
			open={open}
			onOpenChange={(open) => {
				if (!open) {
					onClose(undefined);
				}
			}}
		>
			<DialogContent
				className="max-w-screen-xs"
				onInteractOutside={(event) => {
					if (isDirty) {
						event.preventDefault();
					}
				}}
			>
				<DialogHeader>
					<DialogTitle>ویرایش مدرک</DialogTitle>
				</DialogHeader>

				<Form {...form}>
					<form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
						<fieldset
							className="grid gap-6"
							disabled={isSubmitting || isSubmitSuccessful}
						>
							<FormField
								control={control}
								name="title"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											عنوان<span className="text-red-500"> *</span>
										</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={control}
								name="description"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											توضیحات<span className="text-red-500"> *</span>
										</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={control}
								name="date"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											تاریخ صدور<span className="text-red-500"> *</span>
										</FormLabel>
										<FormControl>
											<DateInput {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={control}
								name="expiryDate"
								render={({ field }) => (
									<FormItem>
										<FormLabel>تاریخ انقضا</FormLabel>
										<FormControl>
											<DateInput {...field} />
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
							<Button className="min-w-24" type="submit" variant="primary">
								ویرایش
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
				</Form>
			</DialogContent>
		</Dialog>
	);
}

export default CompanyDocumentUpdateDialog;
