"use client";

import { useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { zodResolver } from "@hookform/resolvers/zod";

import {
	DispatcherCategoryType,
	dispatcherCategoryTypeOptions,
} from "../../enums/DispatcherCategoryType";
import { DispatcherCategoryFilterArgs } from "./DispatcherCategoryList.types";

const formSchema = z.object({
	company: z.boolean(),
	type: z.custom<DispatcherCategoryType>(),
	domainCode: z.string(),
	inspectionDomain: z.string(),
});

type FormSchema = z.infer<typeof formSchema>;

function DispatcherCategoryFilterDialog({
	payload: filterArgs,
	open,
	onClose,
}: DialogProps<DispatcherCategoryFilterArgs, DispatcherCategoryFilterArgs>) {
	const formRef = useRef<HTMLFormElement>(null);

	const form = useForm<FormSchema>({
		defaultValues: {
			company: filterArgs.company || false,
			type: filterArgs.type || undefined,
			domainCode: filterArgs.domainCode || "",
			inspectionDomain: filterArgs.inspectionDomain || "",
		},
		resolver: zodResolver(formSchema),
	});

	const {
		control,
		formState: { isDirty },
	} = form;

	function handleSubmit(values: FormSchema) {
		onClose({ ...values });
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
					<DialogTitle>جستجو در فهرست گروه های کالایی</DialogTitle>
				</DialogHeader>

				<Form {...form}>
					<form
						ref={formRef}
						className="space-y-8"
						onSubmit={form.handleSubmit(handleSubmit)}
					>
						<fieldset className="grid grid-cols-12 gap-6">
							<FormField
								control={control}
								name="company"
								render={({ field: { value, onChange, ...field } }) => (
									<FormItem className="col-span-full">
										<FormLabel className="flex items-center gap-2">
											<FormControl>
												<Switch
													checked={value}
													onCheckedChange={(value) => onChange(!!value)}
													{...field}
												/>
											</FormControl>
											<span>فقط گروه های کالایی سازمان</span>
										</FormLabel>
									</FormItem>
								)}
							/>

							<Separator className="col-span-full h-0.5" />

							<FormField
								control={control}
								name="type"
								render={({ field }) => (
									<FormItem className="col-span-full">
										<FormLabel>دسته بندی</FormLabel>
										<FormControl>
											<Select
												value={field.value ?? "all"}
												onValueChange={(value) => {
													field.onChange(value === "all" ? null : value);
												}}
											>
												<SelectTrigger>
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													{field.value && (
														<SelectItem value="all">-</SelectItem>
													)}
													{dispatcherCategoryTypeOptions.map((x) => (
														<SelectItem key={x.value} value={x.value}>
															{x.label}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</FormControl>
									</FormItem>
								)}
							/>

							<FormField
								control={control}
								name="domainCode"
								render={({ field }) => (
									<FormItem className="col-span-full">
										<FormLabel>کد دامنه</FormLabel>
										<FormControl>
											<Input
												className="tracking-wider rtl:text-right"
												dir="ltr"
												{...field}
											/>
										</FormControl>
									</FormItem>
								)}
							/>

							<FormField
								control={control}
								name="inspectionDomain"
								render={({ field }) => (
									<FormItem className="col-span-full">
										<FormLabel>دامنه بازرسی</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
									</FormItem>
								)}
							/>
						</fieldset>

						<DialogFooter>
							<Button className="min-w-24" type="submit" variant="primary">
								جستجو
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}

export default DispatcherCategoryFilterDialog;
