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
import { Input } from "@/components/ui/input";
import { MaskInput } from "@/components/ui/mask-input";
import { Spinner } from "@/components/ui/spinner";
import { FinancialCategory } from "@/financial/financial-category/models/FinancialCategory";
import { createFinancialCategory } from "@/financial/financial-category/services/createFinancialCategory";
import { updateFinancialCategory } from "@/financial/financial-category/services/updateFinancialCategory";
import { handlePettyError } from "@/financial/petty/utils/handlePettyError";
import { messages } from "@/messages";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
	title: z.string().min(1, messages.validation.required),
	code: z.string().min(1, messages.validation.required),
	parentId: z.string().optional(),
});

type FormSchema = z.infer<typeof formSchema>;

function PettyCategoryUpsertDialog({
	payload,
	open,
	onClose,
}: DialogProps<Partial<FinancialCategory> | undefined, string | boolean>) {
	const form = useForm<FormSchema>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			title: payload?.title ?? "",
			code: payload?.code ?? "",
			parentId:
				(typeof payload?.parentId === "object"
					? payload?.parentId?.id
					: payload?.parentId) ?? undefined,
		},
	});

	const {
		control,
		formState: { errors, isSubmitting, isSubmitSuccessful, isDirty },
		handleSubmit,
		setError,
	} = form;

	async function onSubmit(values: FormSchema) {
		try {
			if (payload?.id) {
				await updateFinancialCategory(payload?.id, {
					title: values.title,
					code: values.code,
				});

				toast.success("مرکز مورد نظر با موفقیت بروزرسانی شد.");
			} else {
				await createFinancialCategory({
					type: "petty",
					title: values.title,
					code: values.code,
					parentId: values.parentId,
				});

				toast.success("مرکز مورد نظر با موفقیت ایجاد شد.");
			}

			onClose(true);
		} catch (err: any) {
			const errorMessage =
				handlePettyError(err.message) ||
				"خطای نامشخصی در هنگام ثبت اطلاعات رخ داد.";

			setError("root.server", {
				message: errorMessage,
			});
			console.error(err);
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
					<DialogTitle>
						{`${payload?.id ? "ویرایش" : "افزودن"} مرکز ${payload?.parentId ? "هزینه" : "بودجه"}`}
					</DialogTitle>
				</DialogHeader>

				<Form {...form}>
					<form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
						<fieldset
							className="grid grid-cols-12 gap-6"
							disabled={isSubmitting || isSubmitSuccessful}
						>
							<FormField
								control={control}
								name="title"
								render={({ field }) => (
									<FormItem className="col-span-full">
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
								name="code"
								render={({ field: { ref, onChange, ...field } }) => (
									<FormItem className="col-span-full">
										<FormLabel>
											کد حسابداری<span className="text-red-500"> *</span>
										</FormLabel>
										<FormControl>
											<MaskInput
												className="tracking-wider rtl:text-right"
												dir="ltr"
												inputRef={ref}
												mask={/^\d+$/}
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
								<Spinner loading={isSubmitting}>
									{payload?.id ? "بروزرسانی" : "افزودن"}
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
				</Form>
			</DialogContent>
		</Dialog>
	);
}

export default PettyCategoryUpsertDialog;
