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
import { messages } from "@/messages";
import { repairProperty } from "@/property/services/repairProperty";
import { zodResolver } from "@hookform/resolvers/zod";

import { Property } from "../../models/Property";
import { RepairHistoryTable } from "./RepairHistoryTable";

const formSchema = z.object({
	date: z.string().min(1, messages.validation.required),
	description: z.string().min(1, messages.validation.required),
	cost: z.string().min(1, messages.validation.required),
	type: z.string().min(1, messages.validation.required),
});

type FormSchema = z.infer<typeof formSchema>;

const PropertyRepairDialog = ({
	payload: property,
	open,
	onClose,
}: DialogProps<
	{
		id: string;
		repairHistory: Property["repairHistory"];
	},
	boolean | undefined
>) => {
	const form = useForm<FormSchema>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			date: "",
			description: "",
			cost: "",
			type: "",
		},
	});
	const {
		formState: { isDirty, errors, isSubmitting, isSubmitSuccessful },
		setError,
	} = form;

	async function onSubmit(values: FormSchema) {
		try {
			await repairProperty(property.id, {
				...values,
				cost: parseFloat(values.cost),
				date: moment
					.from(values.date ?? "", "fa", "YYYY/MM/DD")
					.locale("en")
					.format("YYYY-MM-DD"),
			});
			toast.success("اطلاعات با موفقیت ذخیره شد");
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
				onInteractOutside={(event) => {
					if (isDirty) {
						event.preventDefault();
					}
				}}
				className="max-w-screen-md"
			>
				<DialogHeader>
					<DialogTitle>تعمیر</DialogTitle>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
						<fieldset
							className="space-y-6"
							disabled={isSubmitting || isSubmitSuccessful}
						>
							<div className="grid grid-cols-12 gap-4">
								<FormField
									control={form.control}
									name="type"
									render={({ field }) => (
										<FormItem className="col-span-6">
											<FormLabel>
												نوع تعمیر <span className="text-red-600">*</span>
											</FormLabel>
											<FormControl>
												<Input {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="description"
									render={({ field }) => (
										<FormItem className="col-span-6">
											<FormLabel>
												توضیحات <span className="text-red-600">*</span>
											</FormLabel>
											<FormControl>
												<Input {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="date"
									render={({ field }) => (
										<FormItem className="col-span-6">
											<FormLabel>
												تاریخ تعمیر <span className="text-red-600">*</span>
											</FormLabel>
											<FormControl>
												<DateInput {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="cost"
									render={({ field: { ref, onChange, ...field } }) => (
										<FormItem className="col-span-6">
											<FormLabel>
												هزینه تعمیر <span className="text-red-600">*</span>
											</FormLabel>
											<FormControl>
												<MaskInput
													className="tracking-wider rtl:text-right"
													dir="ltr"
													inputMode="numeric"
													inputRef={ref}
													mask={Number}
													unmask
													onAccept={(value) => onChange(value)}
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						</fieldset>

						{errors.root?.server && (
							<DestructiveAlert className="col-span-full">
								<AlertDescription>
									{errors.root.server.message}
								</AlertDescription>
							</DestructiveAlert>
						)}

						<DialogFooter>
							<Button className="min-w-24" variant="primary" type="submit">
								ثبت
							</Button>

							<Button
								variant="ghost"
								type="button"
								onClick={onClose.bind(null, undefined)}
							>
								بازگشت
							</Button>
						</DialogFooter>
					</form>
				</Form>

				{property.repairHistory && (
					<RepairHistoryTable items={property.repairHistory} />
				)}
			</DialogContent>
		</Dialog>
	);
};

export default PropertyRepairDialog;
