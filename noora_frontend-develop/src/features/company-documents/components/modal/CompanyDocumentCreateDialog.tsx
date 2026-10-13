"use client";

import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { createCompanyDocument } from "@/company-documents/services/createCompanyDocument";
import {
	isJalaliBefore,
	toApiDate,
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
import FileDropzone from "@/components/ui/file-dropzone";
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
		file: z.instanceof(File, { message: messages.validation.required }),
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

function CompanyDocumentCreateDialog({
	open,
	onClose,
}: DialogProps<undefined, boolean | undefined>) {
	const form = useForm<FormSchema>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			title: "",
			description: "",
			date: "",
			expiryDate: "",
			file: undefined,
		},
	});

	const {
		control,
		formState: { errors, isSubmitting, isDirty, isSubmitSuccessful },
		handleSubmit,
		setValue,
		setError,
	} = form;

	const onSubmit = async (values: FormSchema) => {
		try {
			await createCompanyDocument({
				title: values.title,
				description: values.description,
				date: toApiDate(values.date),
				expiryDate: values.expiryDate ? toApiDate(values.expiryDate) : null,
				file: values.file,
			});

			toast.success("مدرک با موفقیت افزوده شد");

			onClose(true);
		} catch {
			setError("root.server", {
				message: "خطا در بارگذاری اطلاعات، مجدد تلاش کنید",
			});
		}
	};

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
					<DialogTitle>افزودن مدرک جدید</DialogTitle>
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

							<FormField
								control={control}
								name="file"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											فایل مدرک<span className="text-red-500"> *</span>
										</FormLabel>
										<FormControl>
											<FileDropzone
												// maxFiles={1} should be uncomment when fileDropzone updated
												onFilesAdded={(files) => {
													setValue("file", files[0], { shouldValidate: true });
												}}
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
							<Button className="min-w-24" type="submit" variant="primary">
								افزودن
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

export default CompanyDocumentCreateDialog;
