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
import { Spinner } from "@/components/ui/spinner";
import { DateInput } from "@/form/DateInput";
import { messages } from "@/messages";
import { zodResolver } from "@hookform/resolvers/zod";

import { SamplingPrice } from "../models/SamplingPrice";
import { updateSamplingPrice } from "../services/upsertSamplingPrice";
import { isoToJalali, jalaliToIso } from "../utils/samplingPriceDates";

const formSchema = z.object({
	deprecatedFrom: z.string().min(1, messages.validation.required),
});

type FormSchema = z.infer<typeof formSchema>;

/** marks a service obsolete from a date, or brings an obsolete one back */
function SamplingPriceDeprecateDialog({
	payload: { service },
	open,
	onClose,
}: DialogProps<{ service: SamplingPrice }, SamplingPrice | undefined>) {
	const form = useForm<FormSchema>({
		defaultValues: { deprecatedFrom: isoToJalali(service.deprecatedFrom) },
		resolver: zodResolver(formSchema),
	});

	const {
		control,
		formState: { errors, isSubmitting, isSubmitSuccessful },
		setError,
	} = form;

	async function save(deprecatedFrom: string | null) {
		try {
			const result = await updateSamplingPrice(service.id, { deprecatedFrom });
			toast.success(
				deprecatedFrom
					? "نوع خدمت منسوخ شد."
					: "نوع خدمت دوباره فعال شد.",
			);
			onClose(result);
		} catch {
			setError("root.server", {
				message: "خطای نامشخصی در هنگام ثبت اطلاعات رخ داد.",
			});
		}
	}

	return (
		<Dialog open={open} onOpenChange={onClose.bind(null, undefined)}>
			{/* the date is the first field: don't pop its calendar over the buttons */}
			<DialogContent
				aria-describedby={undefined}
				className="max-w-screen-xs"
				onOpenAutoFocus={(event) => event.preventDefault()}
			>
				<DialogHeader>
					<DialogTitle>منسوخ کردن نوع خدمت: {service.title}</DialogTitle>
				</DialogHeader>

				<Form {...form}>
					<form
						onSubmit={form.handleSubmit((values) =>
							save(jalaliToIso(values.deprecatedFrom)),
						)}
					>
						<fieldset
							className="space-y-6"
							disabled={isSubmitting || isSubmitSuccessful}
						>
							<FormField
								control={control}
								name="deprecatedFrom"
								render={({ field: { ref, value, onChange, onBlur } }) => (
									<FormItem>
										<FormLabel>منسوخ از تاریخ</FormLabel>
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
											این خدمت برای نمونه‌برداری‌هایی که تاریخ آن‌ها از این تاریخ
											به بعد است، قابل انتخاب نیست. پرونده‌های قبلی تغییر
											نمی‌کنند.
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

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
										منسوخ کردن
									</Spinner>
								</Button>

								{service.deprecatedFrom && (
									<Button
										type="button"
										variant="outline"
										onClick={() => save(null)}
									>
										فعال‌سازی دوباره
									</Button>
								)}

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

export default SamplingPriceDeprecateDialog;
