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
import { CategoryBudget } from "@/financial/category-budget/models/CategoryBudget";
import { updateCategoryBudget } from "@/financial/category-budget/services/updateCategoryBudget";
import { messages } from "@/messages";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
	name: z.string().min(1, messages.validation.required),
	amount: z.string().min(1, messages.validation.required),
});

type FormSchema = z.infer<typeof formSchema>;

function CategoryBudgetEditDialog({
	payload,
	open,
	onClose,
}: DialogProps<CategoryBudget, boolean | undefined>) {
	const form = useForm<FormSchema>({
		defaultValues: {
			name: payload.name,
			amount: payload.amount.toString(),
		},
		resolver: zodResolver(formSchema),
	});

	const {
		control,
		formState: { errors, isSubmitting, isSubmitSuccessful, isDirty },
		setError,
	} = form;

	async function handleSubmit(values: FormSchema) {
		try {
			await updateCategoryBudget(payload.id, {
				name: values.name,
				amount: parseInt(values.amount),
			});

			toast.success("ردیف بودجه با موفقیت بروزرسانی شد.");
			onClose(true);
		} catch (err) {
			console.error(err);
			setError("root.server", {
				message: "خطای نامشخصی در هنگام ثبت اطلاعات رخ داد.",
			});
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
					<DialogTitle>ویرایش ردیف بودجه</DialogTitle>
				</DialogHeader>

				<Form {...form}>
					<form
						className="space-y-8"
						onSubmit={form.handleSubmit(handleSubmit)}
					>
						<fieldset
							className="grid grid-cols-12 gap-6"
							disabled={isSubmitting || isSubmitSuccessful}
						>
							<FormField
								control={control}
								name="name"
								render={({ field }) => (
									<FormItem className="col-span-full">
										<FormLabel>
											عنوان
											<span className="text-red-500"> *</span>
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
								name="amount"
								render={({ field: { ref, onChange, ...field } }) => (
									<FormItem className="col-span-full">
										<FormLabel>
											اعتبار (ریال)<span className="text-red-500"> *</span>
										</FormLabel>
										<FormControl>
											<MaskInput
												className="tracking-wider rtl:text-right"
												dir="ltr"
												inputRef={ref}
												mapToRadix={["."]}
												mask={Number}
												radix="."
												scale={2}
												thousandsSeparator=","
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
							<DestructiveAlert className="col-span-full">
								<AlertDescription>
									{errors.root.server.message}
								</AlertDescription>
							</DestructiveAlert>
						)}

						<DialogFooter>
							<Button className="min-w-24" type="submit" variant="primary">
								بروزرسانی
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

export { CategoryBudgetEditDialog };
