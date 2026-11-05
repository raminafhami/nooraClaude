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

import { SamplingPrice } from "../models/SamplingPrice";
import { addSamplingPriceVersion } from "../services/upsertSamplingPrice";
import { getPriceVersions, jalaliToIso } from "../utils/samplingPriceDates";

const formSchema = z.object({
	price: z.string().regex(/^\d+$/, "مبلغ را به عدد و به ریال وارد کنید."),
	effectiveFrom: z.string().min(1, messages.validation.required),
	note: z.string(),
});

type FormSchema = z.infer<typeof formSchema>;

/** announces a new price for a service from a given date */
function SamplingPriceVersionDialog({
	payload: { service },
	open,
	onClose,
}: DialogProps<{ service: SamplingPrice }, SamplingPrice | undefined>) {
	const { current } = getPriceVersions(service);

	const form = useForm<FormSchema>({
		defaultValues: { price: "", effectiveFrom: "", note: "" },
		resolver: zodResolver(formSchema),
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
			const result = await addSamplingPriceVersion(service.id, {
				price: Number(values.price),
				effectiveFrom: jalaliToIso(values.effectiveFrom),
				note: values.note || undefined,
			});
			toast.success("قیمت جدید با موفقیت ثبت شد.");
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
					<DialogTitle>اعلام قیمت جدید: {service.title}</DialogTitle>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(handleSubmit)}>
						<fieldset
							className="space-y-6"
							disabled={isSubmitting || isSubmitSuccessful}
						>
							<div className="grid gap-6">
								{current && (
									<div className="text-muted-foreground">
										قیمت فعلی: {toCurrency(current.price.toString())} ریال
									</div>
								)}

								<FormField
									control={control}
									name="price"
									render={({ field }) => (
										<FormItem>
											<FormLabel>قیمت جدید هر نمونه (ریال)</FormLabel>
											<FormControl>
												<Input
													className="tracking-wider rtl:text-right"
													dir="ltr"
													inputMode="numeric"
													{...field}
												/>
											</FormControl>
											{/^\d+$/.test(price) && (
												<FormDescription>{toCurrency(price)} ریال</FormDescription>
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
											<FormDescription>
												نمونه‌برداری‌هایی که تاریخ نمونه‌برداری آن‌ها از این
												تاریخ به بعد است، با قیمت جدید محاسبه می‌شوند. قیمت قبلی
												برای تاریخ‌های پیش از آن باقی می‌ماند.
											</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={control}
									name="note"
									render={({ field }) => (
										<FormItem>
											<FormLabel>توضیحات</FormLabel>
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

							<DialogFooter>
								<Button className="min-w-24" type="submit" variant="primary">
									<Spinner loading={isSubmitting} size="sm">
										ثبت قیمت
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

export default SamplingPriceVersionDialog;
