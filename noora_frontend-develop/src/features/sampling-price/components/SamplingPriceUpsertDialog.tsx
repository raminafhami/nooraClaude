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
	DialogTrigger,
} from "@/components/ui/dialog";
import { DialogProps } from "@/components/ui/dialog/use-dialogs";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { DateInput } from "@/form/DateInput";
import { messages } from "@/messages";
import { toCurrency } from "@/utils/String";
import { zodResolver } from "@hookform/resolvers/zod";

import { SamplingPrice, samplingProcesses } from "../models/SamplingPrice";
import {
	createSamplingPrice,
	updateSamplingPrice,
} from "../services/upsertSamplingPrice";
import { jalaliToIso } from "../utils/samplingPriceDates";

const formSchema = z.object({
	title: z.string().trim().min(1, messages.validation.required),
	processKeys: z.array(z.string()),
	// only when creating: the first price of the service
	price: z.string(),
	effectiveFrom: z.string(),
});

type FormSchema = z.infer<typeof formSchema>;

/** creates a service with its first price, or edits a service's title and processes */
function SamplingPriceUpsertDialog({
	payload: { service } = {},
	open,
	onClose,
}: DialogProps<{ service?: SamplingPrice }, SamplingPrice | undefined>) {
	const isNew = !service;

	const form = useForm<FormSchema>({
		defaultValues: {
			title: service?.title ?? "",
			processKeys: service?.processKeys ?? [],
			price: "",
			effectiveFrom: "",
		},
		resolver: zodResolver(
			isNew
				? formSchema.extend({
						price: z
							.string()
							.regex(/^\d+$/, "مبلغ را به عدد و به ریال وارد کنید."),
						effectiveFrom: z.string().min(1, messages.validation.required),
					})
				: formSchema,
		),
	});

	const {
		control,
		formState: { errors, isDirty, isSubmitting, isSubmitSuccessful },
		setError,
		watch,
	} = form;
	const price = watch("price");

	async function handleSubmit(values: FormSchema) {
		try {
			let result: SamplingPrice;

			if (isNew) {
				result = await createSamplingPrice({
					title: values.title,
					processKeys: values.processKeys,
					price: Number(values.price),
					effectiveFrom: jalaliToIso(values.effectiveFrom),
				});
				toast.success("نوع خدمت با موفقیت افزوده شد.");
			} else {
				result = await updateSamplingPrice(service.id, {
					title: values.title,
					processKeys: values.processKeys,
				});
				toast.success("نوع خدمت با موفقیت بروزرسانی شد.");
			}

			onClose(result);
		} catch {
			setError("root.server", {
				message: "خطای نامشخصی در هنگام ثبت اطلاعات رخ داد.",
			});
		}
	}

	return (
		<Dialog open={open} onOpenChange={onClose.bind(null, undefined)}>
			<DialogContent
				aria-describedby={undefined}
				className="max-w-screen-xs"
				onInteractOutside={(event) => {
					if (isDirty) {
						event.preventDefault();
					}
				}}
			>
				<DialogHeader>
					<DialogTitle>
						{isNew ? "افزودن نوع خدمت نمونه‌برداری" : "ویرایش نوع خدمت"}
					</DialogTitle>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(handleSubmit)}>
						<fieldset
							className="space-y-6"
							disabled={isSubmitting || isSubmitSuccessful}
						>
							<div className="grid gap-6">
								<FormField
									control={control}
									name="title"
									render={({ field }) => (
										<FormItem>
											<FormLabel>عنوان خدمت</FormLabel>
											<FormControl>
												<Input {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={control}
									name="processKeys"
									render={({ field }) => (
										<FormItem>
											<FormLabel>فرایندها</FormLabel>
											<div className="grid gap-2">
												{samplingProcesses.map((process) => (
													<label
														key={process.value}
														className="flex cursor-pointer items-center gap-2"
													>
														<input
															checked={field.value.includes(process.value)}
															type="checkbox"
															onChange={(event) => {
																field.onChange(
																	event.target.checked
																		? [...field.value, process.value]
																		: field.value.filter(
																				(x) => x !== process.value,
																			),
																);
															}}
														/>
														<span>{process.label}</span>
													</label>
												))}
											</div>
											<FormDescription>
												اگر هیچ فرایندی انتخاب نشود، خدمت در همه فرایندهای
												نمونه‌برداری قابل انتخاب است.
											</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>

								{isNew && (
									<>
										<FormField
											control={control}
											name="price"
											render={({ field }) => (
												<FormItem>
													<FormLabel>قیمت هر نمونه (ریال)</FormLabel>
													<FormControl>
														<Input
															className="tracking-wider rtl:text-right"
															dir="ltr"
															inputMode="numeric"
															{...field}
														/>
													</FormControl>
													{/^\d+$/.test(price) && (
														<FormDescription>
															{toCurrency(price)} ریال
														</FormDescription>
													)}
													<FormMessage />
												</FormItem>
											)}
										/>

										<FormField
											control={control}
											name="effectiveFrom"
											render={({ field: { ref, value, onChange, onBlur } }) => (
												<FormItem>
													<FormLabel>اعمال از تاریخ</FormLabel>
													<FormControl>
														<DateInput
															ref={ref}
															autoComplete="off"
															value={value}
															onLeave={onBlur}
															onMutate={onChange}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</>
								)}
							</div>

							{errors.root?.server && (
								<DestructiveAlert>
									<AlertDescription>
										{errors.root.server.message}
									</AlertDescription>
								</DestructiveAlert>
							)}

							<DialogFooter>
								<Button className="min-w-24" type="submit" variant="primary">
									<Spinner loading={isSubmitting} size="sm">
										{isNew ? "افزودن" : "بروزرسانی"}
									</Spinner>
								</Button>

								<DialogTrigger asChild>
									<Button type="button" variant="ghost">
										بازگشت
									</Button>
								</DialogTrigger>
							</DialogFooter>
						</fieldset>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}

export default SamplingPriceUpsertDialog;
