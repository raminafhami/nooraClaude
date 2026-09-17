"use client";

import moment from "jalali-moment";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

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
import { MaskInput } from "@/components/ui/mask-input";
import { Separator } from "@/components/ui/separator";
import { createBudgetCategory } from "@/financial/category-budget/services/createBudgetCategory";
import { messages } from "@/messages";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
	name: z.string().min(1, messages.validation.required),
	amount: z.string().min(1, messages.validation.required),
	dateFrom: z.string().min(1, messages.validation.required),
	dateTo: z.string().min(1, messages.validation.required),
});

type FormSchema = z.infer<typeof formSchema>;

function CategoryBudgetAddDialog({
	payload,
	open,
	onClose,
}: DialogProps<{ categoryId: string }, boolean | undefined>) {
	const form = useForm<FormSchema>({
		defaultValues: {
			name: "",
			amount: "",
			dateFrom: "",
			dateTo: "",
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
			await createBudgetCategory({
				name: values.name,
				categoryId: payload.categoryId,
				amount: parseInt(values.amount),
				dateFrom: moment
					.from(values.dateFrom, "fa", "YYYY-MM-DD")
					.format("YYYY-MM-DD"),
				dateTo: moment
					.from(values.dateTo, "fa", "YYYY-MM-DD")
					.format("YYYY-MM-DD"),
			});

			toast.success("ردیف بودجه با موفقیت افزوده شد.");
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
					<DialogTitle>افزودن ردیف بودجه</DialogTitle>
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

							<Separator className="col-span-full h-0.5" />

							<FormField
								control={control}
								name="dateFrom"
								render={({ field }) => (
									<FormItem className="col-span-full">
										<FormLabel>
											تاریخ شروع <span className="text-red-500"> *</span>
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
								name="dateTo"
								render={({ field }) => (
									<FormItem className="col-span-full">
										<FormLabel>
											تاریخ پایان <span className="text-red-500"> *</span>
										</FormLabel>
										<FormControl>
											<DateInput {...field} />
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

export { CategoryBudgetAddDialog };
