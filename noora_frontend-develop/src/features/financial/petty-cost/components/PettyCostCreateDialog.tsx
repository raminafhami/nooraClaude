"use client";

import moment from "jalali-moment";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { AlertDescription } from "@/components/ui/alert";
import { DestructiveAlert } from "@/components/ui/alert/destructive-alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DateInput } from "@/components/ui/date-input";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { DialogProps } from "@/components/ui/dialog/use-dialogs";
import FileDropzone from "@/components/ui/file-dropzone";
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
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { getUserPettyCashCategories } from "@/financial/petty-cash/services/getUserPettyCashCategories";
import { createPettyCost } from "@/financial/petty-cost/services/createPettyCost";
import uploadPettyCostFile from "@/financial/petty-cost/services/uploadPettyCostFile";
import { handlePettyError } from "@/financial/petty/utils/handlePettyError";
import { messages } from "@/messages";
import { verifyNationalOrLegalCode } from "@/utils/verifyNationalOrLegalCode";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z
	.object({
		categoryId: z.string().min(1, messages.validation.required),
		spentDate: z.string().min(1, messages.validation.required),
		invoiceNumber: z.string(),
		sellerNationalCode: z.string(),
		description: z.string().min(1, messages.validation.required),
		amount: z.string().min(1, messages.validation.required),
		hasVat: z.boolean(),
	})
	.refine(({ hasVat, invoiceNumber }) => !hasVat || invoiceNumber, {
		path: ["invoiceNumber"],
		message: messages.validation.required,
	})
	.refine(
		({ amount, sellerNationalCode }) =>
			(parseFloat(amount) || 0) < 20_000_000 || sellerNationalCode,
		{ path: ["sellerNationalCode"], message: messages.validation.required },
	)
	.refine(
		({ amount, sellerNationalCode }) =>
			(parseFloat(amount) || 0) < 20_000_000 ||
			verifyNationalOrLegalCode(sellerNationalCode),
		{
			path: ["sellerNationalCode"],
			message: "کد / شناسه ملی وارد شده نامعتبر است.",
		},
	);

type FormSchema = z.infer<typeof formSchema>;

function PettyCostCreateDialog({
	open,
	onClose,
}: DialogProps<void, boolean | string | undefined>) {
	const [attachments, setAttachments] = useState<File[]>([]);

	const form = useForm<FormSchema>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			categoryId: "",
			spentDate: "",
			sellerNationalCode: "",
			amount: "",
			description: "",
			invoiceNumber: "",
			hasVat: false,
		},
	});

	const {
		control,
		formState: { errors, isDirty, isSubmitting, isSubmitSuccessful },
		setError,
		watch,
	} = form;

	const { amount, hasVat } = watch();

	async function handleSubmit(data: FormSchema) {
		try {
			const res = await createPettyCost({
				invoiceNumber: data.invoiceNumber,
				hasVat: data.hasVat,
				categoryId: data.categoryId,
				type: "official",
				sellerNationalCode: data.sellerNationalCode ?? "",
				amount: parseFloat(data.amount),
				spentDate: moment
					.from(data.spentDate, "fa", "YYYY-MM-DD")
					.format("YYYY-MM-DD"),
				description: data.description,
			});

			try {
				if (attachments.length) {
					await uploadPettyCostFile({
						attachments,
						costId: res.id,
					});
				}
				toast.success("هزینه با موفقیت ثبت شد.");
				onClose(true);
			} catch (err) {
				console.error(err);
				toast.error("خطای نامشخصی در هنگام بارگذاری پیوست ها رخ داد.");
			}
		} catch (error: any) {
			const errorMessage =
				handlePettyError(error.message) ||
				"خطای نامشخصی در هنگام ثبت هزینه رخ داد.";

			setError("root.server", {
				message: errorMessage,
			});
			console.error(error);
		}
	}

	// cost categories
	const [categories, setCategories] = useState<any[]>([]);

	const fetchCategories = useCallback(async () => {
		try {
			const categories = await getUserPettyCashCategories();
			setCategories(categories);
		} catch (err) {
			console.error(err);
		}
	}, []);

	useEffect(() => {
		fetchCategories();
	}, [fetchCategories]);

	const groupedCategories = useMemo(() => {
		if (!categories) return [];

		const map = new Map<string, { parent: any; children: any[] }>();

		for (const cat of categories) {
			const parentKey = cat.parentId?.id;
			if (!map.has(parentKey)) {
				map.set(parentKey, {
					parent: cat.parentId ?? { id: "بدون والد", title: "بدون دسته‌بندی" },
					children: [],
				});
			}
			map.get(parentKey)!.children.push(cat);
		}

		return Array.from(map.values());
	}, [categories]);

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
					<DialogTitle>افزودن هزینه</DialogTitle>
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
								name="categoryId"
								render={({ field: { ref, value, onChange, ...field } }) => (
									<FormItem className="col-span-full">
										<FormLabel>
											مرکز هزینه<span className="text-red-500"> *</span>
										</FormLabel>
										<FormControl>
											<Select
												value={value || "clear"}
												onValueChange={(value) =>
													onChange(value === "clear" ? "" : value)
												}
												{...field}
											>
												<SelectTrigger ref={ref}>
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													{groupedCategories.map((group) => (
														<SelectGroup key={group.parent.id}>
															<SelectLabel>{group.parent.title}</SelectLabel>
															{group.children.map((item) => (
																<SelectItem key={item.id} value={item.id}>
																	{item.title}
																</SelectItem>
															))}
														</SelectGroup>
													))}
												</SelectContent>
											</Select>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<Separator className="col-span-full h-0.5" />

							<FormField
								control={control}
								name="description"
								render={({ field }) => (
									<FormItem className="col-span-full">
										<FormLabel>
											توضیحات<span className="text-red-500"> *</span>
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
								name="spentDate"
								render={({ field }) => (
									<FormItem className="col-span-full">
										<FormLabel>
											تاریخ پرداخت<span className="text-red-500"> *</span>
										</FormLabel>
										<FormControl>
											<DateInput maxDate={new Date()} {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<Separator className="col-span-full h-0.5" />

							<FormField
								control={control}
								name="amount"
								render={({ field: { ref, onChange, ...field } }) => (
									<FormItem className="col-span-full">
										<FormLabel>
											مبلغ (ریال)<span className="text-red-500"> *</span>
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

							<FormField
								control={control}
								name="hasVat"
								render={({ field: { value, onChange, ...field } }) => (
									<FormItem className="col-span-full">
										<FormLabel className="flex gap-3">
											<FormControl>
												<Checkbox
													checked={value}
													onCheckedChange={(checked) => {
														onChange(!!checked);
													}}
													{...field}
												/>
											</FormControl>
											<span>با احتساب مالیات بر ارزش افزوده</span>
										</FormLabel>
										<FormMessage />
									</FormItem>
								)}
							/>

							<Separator className="col-span-full h-0.5" />

							<FormField
								control={control}
								name="sellerNationalCode"
								render={({ field: { ref, onChange, ...field } }) => (
									<FormItem className="col-span-full">
										<FormLabel>
											کد / شناسه ملی فروشنده
											{parseFloat(amount) >= 20_000_000 && (
												<span className="text-red-500"> *</span>
											)}
										</FormLabel>
										<FormControl>
											<MaskInput
												className="tracking-wider rtl:text-right"
												dir="ltr"
												inputRef={ref}
												mask={/^\d+$/}
												maxLength={11}
												unmask
												onAccept={(value) => onChange(value)}
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={control}
								name="invoiceNumber"
								render={({ field }) => (
									<FormItem className="col-span-full">
										<FormLabel>
											شماره فاکتور
											{hasVat && <span className="text-red-500"> *</span>}
										</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<Separator className="col-span-full h-0.5" />

							<FormItem className="col-span-full">
								<FormLabel>پیوست ها</FormLabel>
								<FormControl>
									<FileDropzone onFilesAdded={setAttachments} />
								</FormControl>
								<FormMessage />
							</FormItem>
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
								<Spinner color="white" loading={isSubmitting} size="xs">
									افزودن هزینه
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

export { PettyCostCreateDialog };
