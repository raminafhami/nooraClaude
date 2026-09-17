"use client";

import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

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
import { completePropertyMaintenance } from "@/property/services/completePropertyMaintenance";
import { maintenanceProperty } from "@/property/services/maintenanceProperty";
import { zodResolver } from "@hookform/resolvers/zod";

import { Property } from "../../models/Property";
import { MaintenanceHistoryTable } from "./MaintenanceHistoryTable";

const formSchema = z.object({
	date: z.string().min(1, messages.validation.required),
	description: z.string().min(1, messages.validation.required),
	cost: z.preprocess(
		(val) => Number(val),
		z.number().min(1, messages.validation.required),
	),
	technician: z.string().min(1, messages.validation.required),
});

type FormSchema = z.infer<typeof formSchema>;

const PropertyMaintenanceDialog = ({
	payload,
	open,
	onClose,
}: DialogProps<{
	id: string;
	maintenanceHistory: Property["maintenanceHistory"];
	refetch: () => void;
}>) => {
	const form = useForm<FormSchema>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			date: "",
			description: "",
			cost: 0,
			technician: "",
		},
	});

	async function onSubmit(data: FormSchema) {
		try {
			await maintenanceProperty(payload.id, data);

			const lastMaintenance = payload?.maintenanceHistory?.at(-1);
			if (lastMaintenance && !lastMaintenance.endDate) {
				await completePropertyMaintenance(payload.id, lastMaintenance?.id);
			}

			toast.success("اطلاعات با موفقیت ذخیره شد");
			payload.refetch();
			onClose();
		} catch (err) {
			console.error(err);
			toast.error("خطای نامشخصی در هنگام ثبت اطلاعات رخ داد.");
		}
	}

	return (
		<Dialog open={open} onOpenChange={onClose.bind(null, undefined)}>
			<DialogContent className="max-w-screen-lg">
				<DialogHeader>
					<DialogTitle>تحویل کالا برای نگهداری</DialogTitle>
				</DialogHeader>

				<Form {...form}>
					<form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
						<fieldset className="grid grid-cols-12 gap-4">
							<FormField
								control={form.control}
								name="technician"
								render={({ field }) => (
									<FormItem className="col-span-6">
										<FormLabel className="text-muted-foreground">
											تحویل به
										</FormLabel>
										<FormControl>
											<Input {...field} placeholder="تحویل به" />
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
										<FormLabel className="text-muted-foreground">
											توضیحات
										</FormLabel>
										<FormControl>
											<Input {...field} placeholder="توضیحات" />
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
										<FormLabel className="text-muted-foreground">
											تاریخ واگذاری
										</FormLabel>
										<FormControl>
											<DateInput {...field} placeholder="تاریخ انجام کاری" />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="cost"
								render={({ field }) => (
									<FormItem className="col-span-6">
										<FormLabel className="text-muted-foreground">
											هزینه نگهداری
										</FormLabel>
										<FormControl>
											<Input
												type="number"
												{...field}
												placeholder="هزینه نگهداری"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</fieldset>

						<DialogFooter>
							<Button className="min-w-24" variant="primary" type="submit">
								ثبت
							</Button>

							<Button
								className="px-6"
								type="button"
								variant="ghost"
								onClick={onClose.bind(null, undefined)}
							>
								بازگشت
							</Button>
						</DialogFooter>
					</form>
				</Form>

				{payload.maintenanceHistory && (
					<MaintenanceHistoryTable
						id={payload.id}
						items={payload.maintenanceHistory}
						refetch={payload.refetch}
						onClose={onClose}
					/>
				)}
			</DialogContent>
		</Dialog>
	);
};
export default PropertyMaintenanceDialog;
