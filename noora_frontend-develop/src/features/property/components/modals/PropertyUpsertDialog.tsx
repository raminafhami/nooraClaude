"use client";

import moment from "jalali-moment";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Branch } from "@/branches/models/Branch";
import { getBranches } from "@/branches/services/getBranches";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { messages } from "@/messages";
import { Property } from "@/property/models/Property";
import { createProperty } from "@/property/services/createProperty";
import { updateProperty } from "@/property/services/updateProperty";
import uploadPropertyFile from "@/property/services/uploadPropertyFile";
import { zodResolver } from "@hookform/resolvers/zod";

import { PropertyFileManager } from "./PropertyFileManager";

const formSchema = z.object({
	type: z.string().min(1, messages.validation.required),
	category: z.string().min(1, messages.validation.required),
	model: z.string(),
	propertyNo: z.string().min(1, messages.validation.required),
	manufacturer: z.string(),
	serialNumber: z.string().min(1, messages.validation.required),
	color: z.string(),
	weight: z.string(),
	dimensions: z.object({
		length: z.string().min(1, messages.validation.required),
		width: z.string().min(1, messages.validation.required),
		height: z.string(),
	}),
	location: z.object({
		building: z.string().min(1, messages.validation.required),
		branchId: z.string().min(1, messages.validation.required),
		floor: z.string(),
		room: z.string(),
	}),
	purchasePrice: z.string(),
	purchaseDate: z.string().min(1, messages.validation.required),
	currentValue: z.string(),
	depreciationRate: z.string(),
	insurancePolicyNumber: z.string(),
	insuranceCompany: z.string(),
	warrantyStart: z.string(),
	warrantyEnd: z.string(),
	calibrationDate: z.string(),
	nextCalibrationDate: z.string(),
	supplierName: z.string(),
	technicalSpecifications: z.string(),
});

type FormSchema = z.infer<typeof formSchema>;

function PropertyUpsertDialog({
	payload,
	open,
	onClose,
}: DialogProps<
	{
		property?: Property;
	},
	string | boolean
>) {
	const { property } = payload;
	const categoryList = [
		"مبلمان اداری",
		"تجهیزات اداری",
		"وسایل دکوراسیون",
		"وسایل رفاهی",
		"تجهیزات نمایشی و سمعی بصری",
		"اثاثه تجاری",
		" تجهیزات نگهداری و پشتیبانی",
		" تجهیزات بازرسی",
	];

	const [uploadFiles, setUploadFiles] = useState<
		{
			title: string;
			file: File;
		}[]
	>([]);

	const form = useForm<FormSchema>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			type: property?.type || "",
			category: property?.category || "",
			model: property?.model || "",
			propertyNo: property?.propertyNo || "",
			manufacturer: property?.manufacturer || "",
			serialNumber: property?.serialNumber || "",
			color: property?.color || "",
			weight: property?.weight?.toString() || "",
			dimensions: {
				length: property?.dimensions.length.toString() || "",
				width: property?.dimensions.width.toString() || "",
				height: property?.dimensions?.height?.toString() || "",
			},
			location: {
				building: property?.location?.building || "",
				branchId: property?.location?.branchId || "",
				floor: property?.location?.floor || "",
				room: property?.location?.room || "",
			},
			purchasePrice: property?.purchasePrice.toString() || "",
			purchaseDate: property?.purchaseDate
				? moment(property.purchaseDate).format("jYYYY/jMM/jDD")
				: "",
			currentValue: property?.currentValue?.toString() || "",
			depreciationRate: property?.depreciationRate?.toString() || "",
			insurancePolicyNumber: property?.insurancePolicyNumber || "",
			insuranceCompany: property?.insuranceCompany || "",
			warrantyStart: property?.warrantyStart
				? moment(property.warrantyStart).format("jYYYY/jMM/jDD")
				: "",
			warrantyEnd: property?.warrantyEnd
				? moment(property.warrantyEnd).format("jYYYY/jMM/jDD")
				: "",
			calibrationDate: property?.calibrationDate
				? moment(property.calibrationDate).format("jYYYY/jMM/jDD")
				: "",
			nextCalibrationDate: property?.nextCalibrationDate
				? moment(property.nextCalibrationDate).format("jYYYY/jMM/jDD")
				: "",
			supplierName: property?.supplierName || "",
			technicalSpecifications: property?.technicalSpecifications || "",
		},
	});

	const {
		control,
		formState: { isDirty, errors, isSubmitting, isSubmitSuccessful },
		setError,
	} = form;

	async function handleSubmit(values: FormSchema) {
		try {
			let upsertedProperty: Property;

			if (property?.id) {
				upsertedProperty = await updateProperty(property.id, {
					...values,
					weight: parseFloat(values.weight),
					dimensions: {
						length: parseFloat(values.dimensions.length),
						width: parseFloat(values.dimensions.width),
						height: parseFloat(values.dimensions.height),
					},
					purchasePrice: parseFloat(values.purchasePrice),
					currentValue: parseFloat(values.currentValue),
					depreciationRate: parseFloat(values.depreciationRate),
					purchaseDate: moment
						.from(values.purchaseDate ?? "", "fa", "YYYY/MM/DD")
						.locale("en")
						.format("YYYY-MM-DD"),
					warrantyStart: moment
						.from(values.warrantyStart ?? "", "fa", "YYYY/MM/DD")
						.locale("en")
						.format("YYYY-MM-DD"),
					warrantyEnd: moment
						.from(values.warrantyEnd ?? "", "fa", "YYYY/MM/DD")
						.locale("en")
						.format("YYYY-MM-DD"),
				});

				toast.success("کالا با موفقیت بروزرسانی شد.");
			} else {
				upsertedProperty = await createProperty({
					...values,
					weight: parseFloat(values.weight),
					dimensions: {
						length: parseFloat(values.dimensions.length),
						width: parseFloat(values.dimensions.width),
						height: parseFloat(values.dimensions.height),
					},
					purchasePrice: parseFloat(values.purchasePrice),
					currentValue: parseFloat(values.currentValue),
					depreciationRate: parseFloat(values.depreciationRate),

					purchaseDate: moment
						.from(values.purchaseDate, "fa", "YYYY/MM/DD")
						.locale("en")
						.format("YYYY-MM-DD"),
					warrantyStart:
						(values.warrantyStart &&
							moment
								.from(values.warrantyStart, "fa", "YYYY/MM/DD")
								.locale("en")
								.format("YYYY-MM-DD")) ||
						undefined,
					warrantyEnd:
						(values.warrantyEnd &&
							moment
								.from(values.warrantyEnd, "fa", "YYYY/MM/DD")
								.locale("en")
								.format("YYYY-MM-DD")) ||
						undefined,
					calibrationDate:
						(values.calibrationDate &&
							moment
								.from(values.calibrationDate, "fa", "YYYY/MM/DD")
								.locale("en")
								.format("YYYY-MM-DD")) ||
						undefined,
					nextCalibrationDate:
						(values.nextCalibrationDate &&
							moment
								.from(values.nextCalibrationDate, "fa", "YYYY/MM/DD")
								.locale("en")
								.format("YYYY-MM-DD")) ||
						undefined,
				});

				try {
					if (uploadFiles.length > 0) {
						for (let uploadFile of uploadFiles) {
							await uploadPropertyFile({
								id: upsertedProperty.id,
								title: uploadFile.title,
								file: uploadFile.file,
							});
						}
					}
				} catch (err) {
					toast.error("خطای نامشخصی در هنگام بارگذاری پیوست های اموال رخ داد.");
				}

				toast.success("اموال با موفقیت ایجاد شد.");
			}

			onClose(true);
		} catch (err) {
			setError("root.server", {
				message: "خطای نامشخصی در هنگام ثبت اموال رخ داد.",
			});
		}
	}

	const [branches, setBranches] = useState<Branch[]>([]);

	useEffect(() => {
		const fetchBranches = async () => {
			try {
				const res = await getBranches({ sort: { title: "asc" } });
				setBranches(res);
			} catch (err) {
				console.error(err);
				toast.error("خطای نامشخصی در هنگام دریافت فهرست شعب رخ داد.");
			}
		};

		fetchBranches();
	}, []);

	return (
		<Dialog open={open} onOpenChange={onClose.bind(null, undefined)}>
			<DialogContent
				className="max-w-screen-lg"
				onInteractOutside={(event) => {
					if (isDirty) {
						event.preventDefault();
					}
				}}
			>
				<DialogHeader>
					<DialogTitle>
						{property?.id ? "ویرایش اموال" : "افزودن اموال"}
					</DialogTitle>
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
								name="type"
								render={({ field }) => (
									<FormItem className="col-span-full sm:col-span-4">
										<FormLabel>
											شرح تجهیزات و ملزومات
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
								name="category"
								render={({ field }) => (
									<FormItem className="col-span-full sm:col-span-4">
										<FormLabel>
											دسته بندی<span className="text-red-500"> *</span>
										</FormLabel>
										<FormControl>
											<Select
												onValueChange={field.onChange}
												value={field.value}
											>
												<SelectTrigger>
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													{categoryList?.map((cat, index: number) => (
														<SelectItem key={index} value={cat}>
															{cat}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={control}
								name="propertyNo"
								render={({ field }) => (
									<FormItem className="col-span-full sm:col-span-4">
										<FormLabel>
											شماره اموال<span className="text-red-500"> *</span>
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
								name="model"
								render={({ field }) => (
									<FormItem className="col-span-full sm:col-span-4">
										<FormLabel>مدل</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={control}
								name="serialNumber"
								render={({ field: { ref, onChange, ...field } }) => (
									<FormItem className="col-span-full sm:col-span-4">
										<FormLabel>
											شماره سریال<span className="text-red-500"> *</span>
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

							<FormField
								control={control}
								name="manufacturer"
								render={({ field }) => (
									<FormItem className="col-span-full sm:col-span-4">
										<FormLabel>سازنده</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<div className="col-span-full flex items-center gap-3">
								<span>مشخصات ظاهری</span>
								<Separator className="h-1 w-auto grow" />
							</div>

							<FormField
								control={control}
								name="dimensions.length"
								render={({ field: { ref, onChange, ...field } }) => (
									<FormItem className="col-span-full sm:col-span-4">
										<FormLabel>
											طول<span className="text-red-500"> *</span>
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

							<FormField
								control={control}
								name="dimensions.width"
								render={({ field: { ref, onChange, ...field } }) => (
									<FormItem className="col-span-full sm:col-span-4">
										<FormLabel>
											عرض<span className="text-red-500"> *</span>
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

							<FormField
								control={control}
								name="dimensions.height"
								render={({ field: { ref, onChange, ...field } }) => (
									<FormItem className="col-span-full sm:col-span-4">
										<FormLabel>ارتفاع</FormLabel>
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

							<FormField
								control={control}
								name="weight"
								render={({ field: { ref, onChange, ...field } }) => (
									<FormItem className="col-span-full sm:col-span-4">
										<FormLabel>وزن</FormLabel>
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
									</FormItem>
								)}
							/>

							<FormField
								control={control}
								name="color"
								render={({ field }) => (
									<FormItem className="col-span-full sm:col-span-4">
										<FormLabel>رنگ</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
									</FormItem>
								)}
							/>

							<FormField
								control={control}
								name="technicalSpecifications"
								render={({ field }) => (
									<FormItem className="col-span-full sm:col-span-4">
										<FormLabel>مشخصات فنی</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
									</FormItem>
								)}
							/>

							<div className="col-span-full flex items-center gap-3">
								<span>درخواست ملزومات و تجهیزات</span>
								<Separator className="h-1 w-auto grow" />
							</div>

							<FormField
								control={control}
								name="supplierName"
								render={({ field }) => (
									<FormItem className="col-span-full sm:col-span-4">
										<FormLabel>نام تامین کننده</FormLabel>
										<FormControl>
											<Input type="text" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={control}
								name="purchaseDate"
								render={({ field }) => (
									<FormItem className="col-span-full sm:col-span-4">
										<FormLabel>
											تاریخ خرید<span className="text-red-500"> *</span>
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
								name="purchasePrice"
								render={({ field: { ref, onChange, ...field } }) => (
									<FormItem className="col-span-full sm:col-span-4">
										<FormLabel>قیمت خرید(ریال)</FormLabel>
										<FormControl>
											<MaskInput
												className="tracking-wider rtl:text-right"
												dir="ltr"
												inputMode="numeric"
												inputRef={ref}
												mask={Number}
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
								name="currentValue"
								render={({ field: { ref, onChange, ...field } }) => (
									<FormItem className="col-span-full sm:col-span-4">
										<FormLabel>ارزش فعلی(ریال)</FormLabel>
										<FormControl>
											<MaskInput
												className="tracking-wider rtl:text-right"
												dir="ltr"
												inputMode="numeric"
												inputRef={ref}
												thousandsSeparator="."
												mask={Number}
												unmask
												onAccept={(value) => onChange(value)}
												{...field}
											/>
										</FormControl>
									</FormItem>
								)}
							/>

							<FormField
								control={control}
								name="depreciationRate"
								render={({ field: { ref, onChange, ...field } }) => (
									<FormItem className="col-span-full sm:col-span-4">
										<FormLabel>نرخ استهلاک(درصد)</FormLabel>
										<FormControl>
											<MaskInput
												className="tracking-wider rtl:text-right"
												dir="ltr"
												inputMode="numeric"
												inputRef={ref}
												mask={Number}
												max={100}
												unmask
												onAccept={(value) => onChange(value)}
												{...field}
											/>
										</FormControl>
									</FormItem>
								)}
							/>

							<div className="col-span-full flex items-center gap-3">
								<span>محل استقرار</span>
								<Separator className="h-1 w-auto grow" />
							</div>

							<FormField
								control={control}
								name="location.branchId"
								render={({ field }) => (
									<FormItem className="col-span-full sm:col-span-4">
										<FormLabel>
											شعبه<span className="text-red-500"> *</span>
										</FormLabel>
										<FormControl>
											<Select
												onValueChange={field.onChange}
												value={field.value}
											>
												<SelectTrigger>
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													{branches?.map((branch) => (
														<SelectItem
															key={branch.id}
															value={String(branch.id)}
														>
															{branch.title}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={control}
								name="location.building"
								render={({ field }) => (
									<FormItem className="col-span-full sm:col-span-4">
										<FormLabel>
											ساختمان<span className="text-red-500"> *</span>
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
								name="location.floor"
								render={({ field }) => (
									<FormItem className="col-span-full sm:col-span-4">
										<FormLabel>طبقه</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={control}
								name="location.room"
								render={({ field }) => (
									<FormItem className="col-span-full sm:col-span-4">
										<FormLabel>واحد</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<div className="col-span-full flex items-center gap-3">
								<span>گارانتی و بیمه</span>
								<Separator className="h-1 w-auto grow" />
							</div>

							<FormField
								control={control}
								name="warrantyStart"
								render={({ field }) => (
									<FormItem className="col-span-full sm:col-span-4">
										<FormLabel>شروع گارانتی</FormLabel>
										<FormControl>
											<DateInput {...field} />
										</FormControl>
									</FormItem>
								)}
							/>

							<FormField
								control={control}
								name="warrantyEnd"
								render={({ field }) => (
									<FormItem className="col-span-full sm:col-span-4">
										<FormLabel>پایان گارانتی</FormLabel>
										<FormControl>
											<DateInput {...field} />
										</FormControl>
									</FormItem>
								)}
							/>

							<FormField
								control={control}
								name="insurancePolicyNumber"
								render={({ field }) => (
									<FormItem className="col-span-full sm:col-span-4">
										<FormLabel>شماره بیمه</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
									</FormItem>
								)}
							/>

							<FormField
								control={control}
								name="insuranceCompany"
								render={({ field }) => (
									<FormItem className="col-span-full sm:col-span-4">
										<FormLabel>شرکت بیمه</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
									</FormItem>
								)}
							/>
							<div className="col-span-full flex items-center gap-3">
								<span>برنامه زمان بندی کالیبراسیون</span>
								<Separator className="h-1 w-auto grow" />
							</div>
							<FormField
								control={control}
								name="calibrationDate"
								render={({ field }) => (
									<FormItem className="col-span-full sm:col-span-4">
										<FormLabel>تاریخ کالیبراسیون</FormLabel>
										<FormControl>
											<DateInput {...field} />
										</FormControl>
									</FormItem>
								)}
							/>
							<FormField
								control={control}
								name="nextCalibrationDate"
								render={({ field }) => (
									<FormItem className="col-span-full sm:col-span-4">
										<FormLabel>تاریخ کالیبراسیون بعدی</FormLabel>
										<FormControl>
											<DateInput {...field} />
										</FormControl>
									</FormItem>
								)}
							/>

							{!property?.id && (
								<>
									<div className="col-span-full flex items-center gap-3">
										<span>فایل ها</span>
										<Separator className="h-1 w-auto grow" />
									</div>

									<PropertyFileManager setUploadFiles={setUploadFiles} />
								</>
							)}
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
								{property?.id ? "بروزرسانی" : "افزودن"}
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

export default PropertyUpsertDialog;
