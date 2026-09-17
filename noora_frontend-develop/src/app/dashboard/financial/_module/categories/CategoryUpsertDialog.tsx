"use client";

import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { AlertDescription } from "@/components/ui/alert";
import { DestructiveAlert } from "@/components/ui/alert/destructive-alert";
import { Button } from "@/components/ui/button";
import { Conditional } from "@/components/ui/conditional";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
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
import {
	financialCategoryType,
	FinancialCategoryType,
} from "@/financial/financial-category/enums/FinancialCategoryType";
import { FinancialCategory } from "@/financial/financial-category/models/FinancialCategory";
import { createFinancialCategory } from "@/financial/financial-category/services/createFinancialCategory";
import { updateFinancialCategory } from "@/financial/financial-category/services/updateFinancialCategory";
import { messages } from "@/messages";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
	type: z.custom<FinancialCategoryType>(Boolean, messages.validation.required),
	code: z.string().min(1, messages.validation.required),
	title: z.string().min(1, messages.validation.required),
});

type FormData = z.infer<typeof schema>;

function CategoryUpsertDialog({
	payload,
	open,
	onClose,
}: {
	payload: Omit<Partial<FinancialCategory>, "type"> &
		Pick<FinancialCategory, "type">;
	open: boolean;
	onClose: (result?: FinancialCategory) => void;
}) {
	const handleClose = useCallback(() => {
		onClose();
	}, [onClose]);

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<Conditional mount={open} delay>
				<CategoryUpsertForm category={payload} onClose={onClose} />
			</Conditional>
		</Dialog>
	);
}

function CategoryUpsertForm({
	category,
	onClose,
}: {
	category: Omit<Partial<FinancialCategory>, "type"> &
		Pick<FinancialCategory, "type">;
	onClose: (result?: FinancialCategory) => void;
}) {
	const form = useForm<FormData>({
		defaultValues: {
			type: category.type,
			title: category.title ?? "",
			code: category.code ?? "",
		},
		resolver: zodResolver(schema),
	});

	const {
		control,
		formState: { errors, isSubmitting, isSubmitSuccessful },
		handleSubmit: handleRhfSubmit,
		setError,
	} = form;

	async function handleSubmit(values: FormData) {
		try {
			let upsertedCategory: FinancialCategory | undefined;

			if (category.id) {
				upsertedCategory = await updateFinancialCategory(category.id, {
					title: values.title,
					code: values.code,
				});
			} else {
				upsertedCategory = await createFinancialCategory({
					type: values.type,
					title: values.title,
					code: values.code,
				});
			}

			onClose(upsertedCategory);
		} catch (err) {
			console.error(err);
			setError("root.server", {
				message: "خطای نامشخصی در هنگام ثبت اطلاعات رخ داد.",
			});
		}
	}

	return (
		<DialogContent className="max-w-screen-xs">
			<DialogHeader>
				<DialogTitle>
					{category.id
						? `ویرایش عنوان ${category.type === FinancialCategoryType.Income ? "درآمدی" : "هزینه"}`
						: `افزودن عنوان ${category.type === FinancialCategoryType.Income ? "درآمدی" : "هزینه"} جدید`}
				</DialogTitle>
			</DialogHeader>

			<Form {...form}>
				<form
					onSubmit={async (e) => {
						e.stopPropagation();
						await handleRhfSubmit(handleSubmit)(e);
					}}
				>
					<fieldset
						className="space-y-8"
						disabled={isSubmitting || isSubmitSuccessful}
					>
						<div className="grid grid-cols-12 gap-6">
							<FormField
								control={control}
								name="type"
								render={({ field }) => (
									<FormItem className="col-span-full">
										<FormLabel>
											نوع<span className="text-red-600"> *</span>
										</FormLabel>
										<FormControl>
											<Input
												disabled
												value={financialCategoryType[field.value].title}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={control}
								name="title"
								render={({ field }) => (
									<FormItem className="col-span-full">
										<FormLabel>
											عنوان
											<span className="text-red-600"> *</span>
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
								render={({ field }) => (
									<FormItem className="col-span-full">
										<FormLabel>
											شناسه
											<span className="text-red-600"> *</span>
										</FormLabel>
										<FormControl>
											<Input {...field} />
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

						<div className="flex flex-col gap-3 xs:flex-row-reverse">
							<Button className="min-w-24" variant="primary">
								<Spinner color="white" loading={isSubmitting} size="sm">
									{category?.id ? "بروزرسانی" : "افزودن"}
								</Spinner>
							</Button>

							<Button type="button" variant="ghost" onClick={() => onClose()}>
								بازگشت
							</Button>
						</div>
					</fieldset>
				</form>
			</Form>
		</DialogContent>
	);
}

export { CategoryUpsertDialog };
