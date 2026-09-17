"use client";

import React, { useEffect, useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import ReactSelect from "react-select";
import CreatableSelect from "react-select/creatable";
import { toast } from "sonner";
import { z } from "zod";

import GetProductHistoryByCategory from "@/api/products/getProductHistoryByCategory";
import PutProductsHistory from "@/api/products/putProductHistory";
import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Currency } from "@/enums/Currency";
import { getInstances } from "@/felo/instances/services/getInstances";
import { useTaskContext } from "@/felo/tasks/hooks/useTaskContext";
import { Task } from "@/felo/tasks/models/Task";
import { isFieldInTaskForm } from "@/felo/tasks/utils/isFieldInTaskForm";
import { FinancialCategoryType } from "@/financial/financial-category/enums/FinancialCategoryType";
import { getFinancialCategories } from "@/financial/financial-category/services/getFinancialCategories";
import { createIncome } from "@/financial/incomes/services/createIncome";
import { DateInput } from "@/form/DateInput";
import { FieldError } from "@/form/FieldError";
import { Input } from "@/form/Input";
import { MaskInput } from "@/form/MaskInput";
import { Select } from "@/form/select";
import { User } from "@/identity/users/models/User";
import { messages } from "@/messages";
import { Loading } from "@/ui/Loader";
import { ReactSelectStyle } from "@/ui/Select/ReactSelectStyle";
import SignaturePad from "@/ui/SignaturePad";

import { Ids } from "../../data";
import { schema } from "./PhaseSchema";
import { ProductionPreview } from "./ProductionPreview";

export type FormData = z.infer<typeof schema>;

interface OptionType {
	value: string;
	label: string;
	id: string;
}

const digitMap: { [key: string]: string } = {
	"0": "۰",
	"1": "۱",
	"2": "۲",
	"3": "۳",
	"4": "۴",
	"5": "۵",
	"6": "۶",
	"7": "۷",
	"8": "۸",
	"9": "۹",
};

const controlSample = [{ value: "false", label: "ندارد" }];

const maintenanceItems = [
	{ value: "یخچال", label: "یخچال" },
	{ value: "دمای محیط", label: "دمای محیط" },
	{ value: "فریزر", label: "فریزر" },
];

const packingType: Array<{ value: string; label: string }> = [];

const productiveTitles = [
	// new
	{ value: "4543000", label: "قیمت پایه نمونه برداری - 1403" },
	{ value: "12100000", label: "نمونه برداری بتن - 1403" },
	{ value: "2310000", label: "نمونه برداری طلا - 1403" },
	{ value: "7590000", label: "نمونه برداری نمونه های حجیم - 1403" },

	// old
	{ value: "2940000", label: "نمونه برداری از واحدهای تولیدی سطح استان" },
	{ value: "2940000", label: "بازرسی قسمتی از واحدهای تولیدی سطح استان" },
	{ value: "5880000", label: "نمونه برداری از واحدهای بتن آماده " },
	{ value: "1470000", label: "نمونه برداری و بازرسی از واحدهای طلاسازی" },
];

const places = [
	{ value: "خط تولید کارخانه", label: "خط تولید کارخانه" },
	{ value: "انبار واحد تولیدی", label: "انبار واحد تولیدی" },
	{ value: "انبار عرضه کننده", label: "انبار عرضه کننده" },
	{ value: "فروشگاه (بازار)", label: "فروشگاه (بازار)" },
];

const types = [
	{ value: "امانی", label: "امانی" },
	{ value: "غیر امانی", label: "غیر امانی" },
];

const inspectorStatus = [
	{ value: "finish", label: "تایید" },
	{ value: "return", label: "رد" },
];

const units = [
	{ value: "بسته / Packages", label: "بسته / Packages" },
	{ value: "بشکه / Drums", label: "بشکه / Drums" },
	{ value: "جعبه / Cases", label: "جعبه / Cases" },
	{ value: "حلقه / Rings", label: "حلقه / Rings" },
	{ value: "دست / Sets", label: "دست / Sets" },
	{ value: "رول / Coils", label: "رول / Coils" },
	{ value: "رول / Rolls", label: "رول / Rolls" },
	{ value: "سیلندر / Cylinder", label: "سیلندر / Cylinder" },
	{ value: "عدد / PCS", label: "عدد / PCS" },
	{ value: "عدل / Balls", label: "عدل / Balls" },
	{ value: "قرقره / Spools", label: "قرقره / Spools" },
	{ value: "متر / MRT", label: "متر / MRT" },
	{ value: "متر مربع / M2", label: "متر مربع / M2" },
	{ value: "مخزن / Tanks", label: "مخزن / Tanks" },
	{ value: "ورق / Sheets", label: "ورق / Sheets" },
	{ value: "پالت / Pallets", label: "پالت / Pallets" },
	{ value: "پاکت / Packet", label: "پاکت / Packet" },
	{ value: "کارتن / CTNS", label: "کارتن / CTNS" },
	{ value: "کیسه / Bags", label: "کیسه / Bags" },
];

const defaultValuesProductsData = {
	ProductName: "",
	ProductType: "",
	Model: "",
	Brand: "",
	ManufactureDate: "",
	SampleAmount: "",
	Unit: "",
	BuildNo: "",
	PackageNo: "",
	Maintenance: "",
	ConstructionSeries: "",
	PhysicalCharacteristics: "",
	PackingType: "",
	ControlSample: "",
	Descriptions: "",
	status: "false",
};

export function PhasePage() {
	const { identity } = useLoggedInUser();

	const { task, hooks, dispatch } = useTaskContext();

	const { data } = task;

	// const [samplerName, setSamplerName] = useState("");
	const [isLoading, setLoading] = useState<boolean>(false);
	const [showPreview, setShowPreview] = useState<boolean>(false);
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [seals, setSeals] = useState<OptionType[]>([]);
	const [selectedSample, setSelectedSample] = useState<any>([]);
	const [selectedControlSample, setSelectedControlSample] = useState<any>([]);

	const [controlSampleSeals, setControlSampleSeals] = useState<OptionType[]>(
		[],
	);

	const [selectedPacking, setSelectedPaking] = useState<
		Array<Array<{ value?: string; label?: string }>>
	>([]);
	const [selectedControlPacking, setSelectedControlPaking] = useState<
		Array<Array<{ value?: string; label?: string }>>
	>([]);
	const [bigLabels, setBigLabels] = useState<OptionType[]>([]);
	const [controlSampleBigLabels, setControlSampleBigLabels] = useState<
		OptionType[]
	>([]);
	const [smallLabels, setSmallLabels] = useState<OptionType[]>([]);
	const [controlSampleSmallLabels, setControlSampleSmallLabels] = useState<
		OptionType[]
	>([]);
	const [samplers, setSamplers] = useState<User[]>([]);
	const samplerNames = samplers.map((sampler) => {
		return {
			value: sampler.id,
			label: sampler.fullname,
		};
	});
	const [codesData, setCodesData] = useState<
		Array<{ productId: string; ProductName: string; unUsedCodes: number[] }>
	>([]);
	const {
		control,
		formState: { errors, isValid },
		register,
		setValue,
		watch,
		trigger,
		unregister,
	} = useFormContext<FormData>();
	const { append, remove } = useFieldArray({
		name: "ProductsData",
	});

	const formFields = watch();

	const handlePackingChange = (
		index: number,
		selectedOptions: Array<{ value?: string; label?: string }>,
	) => {
		setSelectedPaking((prevPackings) => {
			const updatedPackings = [...prevPackings];
			updatedPackings[index] = selectedOptions;
			return updatedPackings;
		});
	};

	const handleControlPackingChange = (
		index: number,
		selectedOptions: Array<{ value?: string; label?: string }>,
	) => {
		setSelectedControlPaking((prevPackings) => {
			const updatedPackings = [...prevPackings];
			updatedPackings[index] = selectedOptions;
			return updatedPackings;
		});
	};

	useEffect(() => {
		(formFields.ProductsData === undefined ||
			formFields.ProductsData.length === 0) &&
			append(defaultValuesProductsData);

		setValue("Date", data.Date);
		setValue("PageNo", data.PageNo);
		setValue("Place", data.Place);
		setValue("Price", data.Price);
		setValue("Type", data.Type);
		setValue("SystemBarcode", data.SystemBarcode);

		getSamplingData();
	}, []);

	useEffect(() => {
		dispatch({ type: "update", options: { saveBtn: true } });
	}, [dispatch]);

	async function getSamplingData() {
		setLoading(true);
		try {
			let res = await GetProductHistoryByCategory({
				branchId: identity?.branchId as string,
				categoryName: "بازرسی عملیاتی",
			});
			if (res) {
				res?.forEach((data) => {
					// Check if an entry with the same productId already exists in packingType
					const isDuplicate = packingType.some(
						(entry) => entry.value.split(":")[0] === data?.productId,
					);

					// If it's not a duplicate, push the new entry to packingType
					if (!isDuplicate) {
						packingType.push({
							value: `${data?.productId}:${data?.unUsedCodes?.toString()}`,
							label: `${data?.productName}`,
						});
					}
				});

				res?.forEach((data) => {
					// Check if an entry with the same productId already exists in controlSample
					const isDuplicate = controlSample.some(
						(entry) => entry.value.split(":")[0] === data?.productId,
					);

					// If it's not a duplicate, push the new entry to controlSample
					if (!isDuplicate) {
						controlSample.push({
							value: `${data?.productId}:${data?.unUsedCodes?.toString()}`,
							label: `${data?.productName}`,
						});
					}
				});

				let arr: Array<{
					productId: string;
					ProductName: string;
					unUsedCodes: number[];
				}> = [];

				res?.forEach((data) => {
					// Check if an entry with the same productId already exists in arr
					const existingEntryIndex = arr.findIndex(
						(entry) => entry.productId === data?.productId,
					);

					// If the entry does not exist, push it to arr
					if (existingEntryIndex === -1) {
						arr.push({
							productId: data?.productId,
							ProductName: data?.productName,
							unUsedCodes: data?.unUsedCodes,
						});
					} else {
						// If the entry exists, update its unUsedCodes array
						arr[existingEntryIndex].unUsedCodes = [
							...arr[existingEntryIndex].unUsedCodes,
							...data?.unUsedCodes,
						];
					}
				});

				setCodesData(arr);

				setLoading(false);
			}
		} catch (e) {
			setLoading(false);
			toast.error("دریافت مهار با خطا روبه رو شد!");
		}
	}

	useEffect(() => {
		dispatch({
			type: "footer",
			children: (
				<>
					{!showPreview && formFields.InspectorStatus === "finish" && (
						<Button
							className="w-fit"
							type="button"
							variant="primary"
							onClick={() => {
								if (!Ids.productsData.length) {
									trigger();

									toast.warning("یک نمونه اضافه کنید");
								} else {
									trigger();
									isValid && setShowPreview(true);
								}
							}}
						>
							پیش نمایش فرم
						</Button>
					)}
					{showPreview && (
						<Button
							className="col-span-1 w-fit"
							type="button"
							variant="primary"
							onClick={() => setShowPreview(false)}
						>
							بازگشت به فرم
						</Button>
					)}
				</>
			),
		});
	}, [dispatch, isValid, showPreview, trigger, formFields.InspectorStatus]);

	useEffect(() => {
		register(Ids.price);
	}, [register]);

	useEffect(() => {
		if (hooks.get().length === 0) {
			hooks.registerHook(
				"pre-submit",
				async ({ task, data }: { task: Task; data: FormData }) => {
					try {
						if (data[Ids.inspectorStatus] === "finish") {
							if (!data[Ids.productsData]?.length) {
								throw new Error("ثبت حداقل یک نمونه الزامی است.");
							}

							// calculate inspection fee
							const inspectionFee = data.ProductsData.length * +data.Price;

							let packingTypes = data?.ProductsData?.map(
								(item: any) => item?.PackingType,
							);
							let controlSamples = data?.ProductsData?.map(
								(item: any) => item?.ControlSample,
							);

							let hasPackingType =
								Array.isArray(packingTypes) &&
								packingTypes.some(
									(val) => Array.isArray(val) && val.length > 0,
								);

							let hasControlSample =
								Array.isArray(controlSamples) &&
								controlSamples.some(
									(val) => Array.isArray(val) && val.length > 0,
								) &&
								controlSamples
									?.flat()
									?.every((sample: any) => sample?.status !== "false");

							let parsedData = [];

							if (hasPackingType && !hasControlSample) {
								parsedData =
									data?.ProductsData?.flatMap((item: any) =>
										item?.PackingType?.flatMap((entry: any) => ({
											usedCodes: entry?.codes?.map(Number) || [],
											productId: entry?.productId || "string",
										})),
									) || [];
							} else if (hasPackingType && hasControlSample) {
								parsedData =
									data?.ProductsData?.flatMap((item: any) => [
										...(item?.PackingType?.flatMap((entry: any) => ({
											usedCodes: entry?.codes?.map(Number) || [],
											productId: entry?.productId || "string",
										})) || []),
										...(item?.ControlSample?.flatMap((entry: any) =>
											entry?.map((i: any) => ({
												usedCodes: i?.codes?.map(Number) || [],
												productId: i?.productId || "string",
											})),
										) || []),
									]) || [];
							}

							try {
								let res = await PutProductsHistory({
									historyItems: parsedData,
								});
								if (res) {
									toast.success("کد ها با موفقیت ثبت شد!");
								}
							} catch (e) {
								console.error(e);
								// toast.error("خطایی رخ داد");
							}

							// create income
							const category = await getFinancialCategories({
								filters: {
									type: FinancialCategoryType.Income,
									key: "sampling",
								},
							}).then((categories) => categories.at(0));

							if (!category) {
								throw new Error("عنوان درآمدی نمونه برداری یافت نشد.");
							}

							await createIncome({
								instanceId: task.instanceId,
								title: category.title,
								categoryId: category.id,
								amount: inspectionFee,
								currency: Currency.Rial,
								currencyRate: 1,
								description: "",
							});

							if (isFieldInTaskForm(task, Ids.invoicePaymentStatus)) {
								const instance = await getInstances({
									filters: [{ name: "_id", value: task.instanceId }],
									props: [Ids.invoicePaymentStatus],
								}).then((instances) => instances[0]);

								(data as any)[Ids.invoicePaymentStatus] =
									instance.parameters[Ids.invoicePaymentStatus];
							}
						}
					} catch (error) {
						console.error(error);
						toast.error("خطایی رخ داد. لطفا دوباره امتحان کنید.");
						throw new Error("خطایی رخ داد. لطفا دوباره امتحان کنید.");
					}
				},
			);
		}
	}, [hooks]);

	return showPreview ? (
		<ProductionPreview task={task} data={formFields} />
	) : (
		<div>
			{isLoading ? (
				<div className="w-full">
					<Loading>درحال دریافت اطلاعات ...</Loading>
				</div>
			) : (
				<div className="grid grid-cols-1 xl:grid-cols-4">
					<div className="col-span-full grid grid-cols-3 gap-y-6 md:grid-cols-2 md:gap-x-3 lg:grid-cols-3 xl:col-span-3 xl:grid-cols-6">
						{/* <div className="col-span-full md:col-span-1   xl:col-span-2">
              <div className="mb-2">شماره برگه نمونه</div>
              <Input
                className="text-right tracking-widest"
                value={formFields.PageNo}
                disabled={true}
              />
              <FieldError error={errors.PageNo} />
            </div> */}

						<div className="col-span-full md:col-span-1 xl:col-span-2">
							<div className="mb-2">نام خریدار</div>
							<Input
								className="cursor-not-allowed"
								disabled
								value={data[Ids.buyerName]}
							/>
						</div>

						<div className="col-span-full !col-start-1 sm:col-start-1 xl:col-span-4">
							<div className="mb-2">نشانی خریدار</div>
							<Input
								className="cursor-not-allowed overflow-x-scroll"
								disabled
								value={data[Ids.buyerAddress]}
							/>
						</div>

						<Separator className="col-span-full h-1" />

						<div className="col-span-full md:col-span-1 xl:col-span-2">
							<div className="mb-2">نام و نام خانوادگی نمونه بردار</div>
							<Input disabled value={data[Ids.samplerName]} />
						</div>

						<div className="col-span-full md:col-span-1 xl:col-span-2">
							<div className="mb-2">مبلغ نمونه برداری</div>
							<CreatableSelect
								isClearable={false}
								placeholder=""
								styles={ReactSelectStyle}
								options={productiveTitles}
								formatCreateLabel={(v) =>
									v
										.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
										.replace(/[0-9]/g, (match) => digitMap[match])
								}
								value={
									formFields.Price !== "" && !isMenuOpen
										? productiveTitles.filter(
												(item) => item.value === formFields.Price,
											)
										: null
								}
								onMenuOpen={() => setIsMenuOpen(true)}
								onMenuClose={() => setIsMenuOpen(false)}
								onInputChange={(value) =>
									value
										?.replace(/[^\d.-]+/g, "")
										.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
								}
								onChange={(selectedOption) => {
									const value = (selectedOption as OptionType)?.value;

									setValue(Ids.price, value.replace(/,/g, "") || "", {
										shouldDirty: true,
										shouldTouch: true,
										shouldValidate: true,
									});
								}}
							/>

							{formFields.Price !== "" && formFields.Price !== undefined && (
								<div className="mr-1 mt-1">
									هزینه بازرسی:{""}
									{(+formFields.Price * 0.1 + +formFields.Price)
										?.toString()
										.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
										.replace(/[0-9]/g, (match) => digitMap[match])}{" "}
									ریال
								</div>
							)}
							<FieldError error={errors.Price} />
						</div>

						<div className="col-span-full sm:col-start-1 md:col-span-1 md:col-start-1 xl:col-span-2">
							<div className="mb-2">تاریخ نمونه برداری</div>
							<DateInput
								autoComplete="off"
								value={formFields.Date}
								onLeave={() => {
									trigger(Ids.date);
								}}
								onMutate={(v) => {
									setValue(Ids.date, v, {
										shouldDirty: true,
										shouldTouch: true,
										shouldValidate: true,
									});
								}}
								{...(({ ref, ...register }) => register)(
									register(Ids.date, {
										deps: [],
									}),
								)}
							/>
							<FieldError error={errors.Date} />
						</div>

						<div className="col-span-full md:col-span-1 xl:col-span-2">
							<div className="mb-2">محل نمونه برداری</div>
							<Select
								id="place"
								items={places}
								value={formFields.Place}
								onLeave={() => {
									trigger("Place");
								}}
								onMutate={(v) => {
									setValue(Ids.place, v || "", {
										shouldDirty: true,
										shouldTouch: true,
										shouldValidate: true,
									});
								}}
								{...(({ ref, ...register }) => register)(register(Ids.place))}
							/>
							<FieldError error={errors.Place} />
						</div>

						<div className="col-span-full md:col-span-1 xl:col-span-2">
							<div className="mb-2">نوع</div>
							<Select
								id="Type"
								items={types}
								value={formFields.Type}
								onLeave={() => {
									trigger("Type");
								}}
								onMutate={(v) => {
									setValue(Ids.type, v || "", {
										shouldDirty: true,
										shouldTouch: true,
										shouldValidate: true,
									});
								}}
								{...(({ ref, ...register }) => register)(
									register(Ids.type, {
										deps: [],
									}),
								)}
							/>
							<FieldError error={errors.Type} />
						</div>

						<div className="col-span-full md:col-span-1 xl:col-span-2">
							<div className="mb-2">بارکد سامانه</div>
							<Input {...register(Ids.systemBarcode)} />
							<FieldError error={errors.SystemBarcode} />
						</div>

						<Separator className="col-span-full h-1" />

						<div className="col-span-full md:col-span-1 xl:col-span-2">
							<div className="mb-2">وضعیت</div>
							<Select
								id="inspectorStatus"
								items={inspectorStatus}
								value={formFields.InspectorStatus}
								onLeave={() => {
									trigger("InspectorStatus");
								}}
								onMutate={(v) => {
									setValue(Ids.inspectorStatus, v || "", {
										shouldDirty: true,
										shouldTouch: true,
										shouldValidate: true,
									});
								}}
								{...(({ ref, ...register }) => register)(
									register(Ids.inspectorStatus, {
										required: messages.validation.required,
									}),
								)}
							/>
							<FieldError error={errors.InspectorStatus} />
						</div>

						{formFields.InspectorStatus === "finish" && (
							<>
								<Separator className="col-span-full h-1" />

								{formFields.ProductsData?.map((fields, index) => {
									register(`ProductsData.${index}.${Ids.packingType}`);
									register(`ProductsData.${index}.${Ids.controlSample}`);
									return (
										<>
											<div className="col-span-full md:col-span-1 xl:col-span-2">
												<div className="mb-2">نام محصول</div>
												<div>
													<Input
														value={fields.ProductName}
														{...register(
															`ProductsData.${index}.${Ids.productName}`,
														)}
													/>
													<FieldError
														error={
															errors.ProductsData?.[index]?.[Ids.productName]
														}
													/>
												</div>
											</div>

											<div className="col-span-full md:col-span-1 xl:col-span-2">
												<div className="mb-2">نوع محصول</div>
												<div>
													<Input
														{...register(
															`ProductsData.${index}.${Ids.productType}`,
														)}
													/>
													<FieldError
														error={
															errors.ProductsData?.[index]?.[Ids.productType]
														}
													/>
												</div>
											</div>

											<div className="col-span-full md:col-span-1 xl:col-span-2">
												<div className="mb-2">مدل / جزئيات</div>
												<Input
													value={fields.Model}
													{...register(`ProductsData.${index}.${Ids.model}`)}
												/>
												<FieldError
													error={errors.ProductsData?.[index]?.[Ids.model]}
												/>
											</div>

											<div className="col-span-full md:col-span-1 xl:col-span-2">
												<div className="mb-2">شرایط نگهداری نمونه</div>
												<Select
													id="Maintenance"
													items={maintenanceItems}
													value={fields?.Maintenance}
													onMutate={(v) => {
														setValue(
															`ProductsData.${index}.${Ids.maintenance}`,
															v || "",
															{
																shouldDirty: true,
																shouldTouch: true,
																shouldValidate: true,
															},
														);
													}}
													{...(({ ref, ...register }) => register)(
														register(
															`ProductsData.${index}.${Ids.maintenance}`,
															{
																deps: [],
															},
														),
													)}
												/>
												<FieldError
													error={
														errors.ProductsData?.[index]?.[Ids.maintenance]
													}
												/>
											</div>

											<div className="col-span-full md:col-span-1 xl:col-span-2">
												<div className="mb-2">تاریخ تولید</div>
												<DateInput
													maxDate={formFields.Date}
													autoComplete="off"
													value={fields.ManufactureDate}
													onLeave={() =>
														trigger(
															`ProductsData.${index}.${Ids.manufactureDate}`,
														)
													}
													onMutate={(v) => {
														setValue(
															`ProductsData.${index}.${Ids.manufactureDate}`,
															v,
															{
																shouldDirty: true,
																shouldTouch: true,
																shouldValidate: true,
															},
														);
													}}
													{...(({ ref, ...register }) => register)(
														register(
															`ProductsData.${index}.${Ids.manufactureDate}`,
															{
																deps: [],
															},
														),
													)}
												/>
												<FieldError
													error={
														errors.ProductsData?.[index]?.[Ids.manufactureDate]
													}
												/>
											</div>

											<div className="col-span-full md:col-span-1 xl:col-span-2">
												<div className="mb-2">نام یا علامت تجاری</div>
												<Input
													value={fields.Brand}
													{...register(`ProductsData.${index}.${Ids.brand}`)}
												/>
												<FieldError
													error={errors.ProductsData?.[index]?.[Ids.brand]}
												/>
											</div>

											<div className="col-span-full md:col-span-1 xl:col-span-2">
												<div className="mb-2">مقدار نمونه</div>
												<MaskInput
													className="text-right tracking-widest"
													dir="ltr"
													mask={/\d$/}
													value={fields.SampleAmount}
													id="SampleAmount"
													onMutate={(v) => {
														setValue(
															`ProductsData.${index}.${Ids.sampleAmount}`,
															v,
															{
																shouldDirty: true,
																shouldTouch: true,
																shouldValidate: true,
															},
														);
													}}
													{...(({ ref, ...register }) => register)(
														register(
															`ProductsData.${index}.${Ids.sampleAmount}`,
														),
													)}
												/>
												<FieldError
													error={
														errors.ProductsData?.[index]?.[Ids.sampleAmount]
													}
												/>
											</div>

											<div className="col-span-full md:col-span-1 xl:col-span-2">
												<div className="mb-2">واحد</div>
												<Select
													id="Unit"
													items={units}
													value={fields?.Unit}
													onMutate={(v) => {
														setValue(
															`ProductsData.${index}.${Ids.unit}`,
															v || "",
															{
																shouldDirty: true,
																shouldTouch: true,
																shouldValidate: true,
															},
														);
													}}
													{...(({ ref, ...register }) => register)(
														register(`ProductsData.${index}.${Ids.unit}`, {
															deps: [],
														}),
													)}
												/>
												<FieldError
													error={errors.ProductsData?.[index]?.[Ids.unit]}
												/>
											</div>

											<div className="col-span-full md:col-span-1 xl:col-span-2">
												<div className="mb-2">شماره پروانه بهداشتی ساخت</div>
												<Input
													value={fields.BuildNo}
													{...register(`ProductsData.${index}.${Ids.buildNo}`)}
												/>
												<FieldError
													error={errors.ProductsData?.[index]?.[Ids.buildNo]}
												/>
											</div>

											<div className="col-span-full md:col-span-1 xl:col-span-2">
												<div className="mb-2">
													شماره پروانه بهداشتی بسته بندی
												</div>
												<Input
													value={fields.PackageNo}
													{...register(
														`ProductsData.${index}.${Ids.packageNo}`,
													)}
												/>
												<FieldError
													error={errors.ProductsData?.[index]?.[Ids.packageNo]}
												/>
											</div>

											<div className="col-span-full md:col-span-1 xl:col-span-2">
												<div className="mb-2">سری ساخت</div>
												<Input
													value={fields.ConstructionSeries}
													{...register(
														`ProductsData.${index}.${Ids.constructionSeries}`,
													)}
												/>
												<FieldError
													error={
														errors.ProductsData?.[index]?.[
															Ids.constructionSeries
														]
													}
												/>
											</div>

											<div className="col-span-full md:col-span-1 xl:col-span-2">
												<div className="mb-2">مشخصات فیزیکی</div>
												<Input
													value={fields.PhysicalCharacteristics}
													{...register(
														`ProductsData.${index}.${Ids.physicalCharacteristics}`,
													)}
												/>
												<FieldError
													error={
														errors.ProductsData?.[index]?.[
															Ids.physicalCharacteristics
														]
													}
												/>
											</div>

											<div className="col-span-full md:col-span-1 xl:col-span-2">
												<div className="mb-2">مهار</div>

												<ReactSelect
													isMulti
													isClearable={false}
													name={`packingType_${index}`}
													placeholder="انتخاب کنید"
													styles={ReactSelectStyle}
													options={packingType.filter(
														(option) =>
															!selectedPacking[index]?.some(
																(selected) => selected.label === option.label,
															),
													)}
													className="basic-multi-select"
													classNamePrefix="select"
													noOptionsMessage={() => "هیچ موردی یافت نشد"}
													value={selectedPacking[index] ?? []}
													onChange={(selectedOptions) => {
														// Update the selected packings state for the current form
														handlePackingChange(
															index,
															selectedOptions.map((option) => ({
																value: option.value,
																label: option.label,
															})),
														);

														// Update the selected sample based on the selected options
														const ids = selectedOptions.map(
															(option) => option?.value?.split(":")[0],
														);
														const updatedSample = [...selectedSample]; // Create a copy of selectedSample
														updatedSample[index] = updatedSample[index]?.filter(
															(item: any) => ids?.includes(item.productId),
														);
														setSelectedSample(updatedSample);
													}}
												/>
												<FieldError
													error={
														errors.ProductsData?.[index]?.[Ids.packingType]
													}
												/>
											</div>

											<div className="col-span-full col-start-1 grid grid-cols-1 gap-y-6 sm:grid-cols-12 sm:gap-x-10">
												{packingType?.map((packing) => {
													let ids = packing?.value?.split(":")[0];
													let selectedSampleItem =
														formFields?.ProductsData[index]?.PackingType || [];

													let selectedOptions = selectedSampleItem?.find(
														(i) => i?.productId === ids,
													)?.codes;
													return selectedPacking?.[index]?.map((sp) => {
														if (sp?.label === packing?.label) {
															return (
																<div
																	key={index}
																	className="col-span-full sm:col-span-6 lg:col-span-3"
																>
																	<div className="mb-2">{packing?.label}</div>
																	<ReactSelect
																		isMulti
																		isClearable={false}
																		name={`SealNo_${ids}`}
																		placeholder="انتخاب کنید"
																		styles={ReactSelectStyle}
																		options={packing?.value
																			?.split(":")[1]
																			.split(",")
																			.map((code: string) => ({
																				value: code,
																				label: code,
																			}))
																			?.filter(
																				(option) =>
																					!selectedSample
																						?.flatMap((i: any) => i)
																						?.some((item: any) =>
																							item?.codes?.includes(
																								option?.value,
																							),
																						) &&
																					!selectedControlSample
																						?.flatMap((i: any) => i)
																						?.some((item: any) =>
																							item?.codes?.includes(
																								option?.value,
																							),
																						),
																			)}
																		className="basic-multi-select"
																		classNamePrefix="select"
																		noOptionsMessage={() =>
																			"هیچ موردی یافت نشد"
																		}
																		value={selectedOptions?.map(
																			(option: any) => ({
																				value: option,
																				label: option,
																			}),
																		)}
																		onChange={(selectedOptions, actionMeta) => {
																			// Extract data related to the current index
																			let dataAtIndex: any;

																			setSelectedSample((prev: any) => {
																				// Clone the previous state to avoid mutation
																				const updatedSample = [...prev];

																				// Ensure updatedSample[index] is initialized as an array
																				if (!updatedSample[index]) {
																					updatedSample[index] = [];
																				}

																				// Find the index of the existing entry with the same productId
																				const existingIndex = updatedSample[
																					index
																				].findIndex(
																					(item: any) => item.productId === ids,
																				);

																				if (existingIndex !== -1) {
																					// If an entry with the same productId exists, update its codes
																					const existingEntry =
																						updatedSample[index][existingIndex];
																					// Filter out duplicate codes
																					if (
																						actionMeta.action !== "remove-value"
																					) {
																						const newCodes = selectedOptions
																							.map((option) => option.value)
																							.filter(
																								(code) =>
																									!existingEntry.codes.includes(
																										code,
																									),
																							);
																						// Update the existing entry's codes
																						existingEntry.codes = [
																							...existingEntry.codes,
																							...newCodes,
																						];
																					} else {
																						existingEntry.codes =
																							existingEntry.codes.filter(
																								(x: string) =>
																									x !==
																									actionMeta.removedValue.value,
																							);
																					}
																				} else {
																					// If no entry with the same productId exists, create a new entry
																					updatedSample[index].push({
																						ProductName: packing?.label,
																						productId: ids,
																						codes: selectedOptions.map(
																							(option) => option.value,
																						),
																					});
																				}

																				dataAtIndex = updatedSample[index];

																				return updatedSample;
																			});

																			// Pass only data related to the current index to setValue
																			setValue(
																				`ProductsData.${index}.${Ids.packingType}`,
																				dataAtIndex,
																				{
																					shouldDirty: true,
																					shouldTouch: true,
																				},
																			);
																		}}
																	/>

																	<FieldError
																		error={
																			errors.ProductsData?.[index]?.[Ids.sealNo]
																		}
																	/>
																</div>
															);
														} else {
															return null;
														}
													});
												})}
											</div>

											<div className="col-span-full md:col-span-1 xl:col-span-2">
												<div className="mb-2">نمونه شاهد</div>
												<ReactSelect
													isMulti
													isClearable={false}
													name="controlSample"
													placeholder="انتخاب کنید"
													styles={ReactSelectStyle}
													options={
														selectedControlPacking[index]?.some((i) =>
															i?.value?.includes("false"),
														)
															? [{ value: "false", label: "ندارد" }]
															: controlSample || []
													}
													className="basic-multi-select"
													classNamePrefix="select"
													noOptionsMessage={() => "هیچ موردی یافت نشد"}
													// onBlur={() =>
													//   trigger(`ProductsData.${index}.${Ids.controlSample}`)
													// }
													value={selectedControlPacking[index] ?? []}
													onChange={(selectedOptions) => {
														const stringValue = selectedOptions.map(
															(item: any) => item.value,
														);

														handleControlPackingChange(
															index,
															selectedOptions.map((option) => ({
																value: option.value,
																label: option.label,
															})),
														);

														const ids = selectedOptions.map(
															(option) => option?.value?.split(":")[0],
														);

														const updatedSample = [...selectedControlSample]; // Create a copy of selectedSample
														updatedSample[index] = updatedSample[index]?.filter(
															(item: any) => ids?.includes(item.productId),
														);
														setSelectedControlSample(updatedSample);

														if (stringValue.includes("false")) {
															setValue(
																`ProductsData.${index}.${Ids.controlSample}.${index}.${Ids.status}`,
																"false",
															);
															unregister(
																`ProductsData.${index}.${Ids.delivered}`,
															);
															unregister(
																`ProductsData.${index}.${Ids.controlSampleSealNo}`,
															);
															unregister(
																`ProductsData.${index}.${Ids.controlSampleBigLabelNo}`,
															);
															unregister(
																`ProductsData.${index}.${Ids.controlSampleSmallLabelNo}`,
															);
														} else {
															stringValue?.length
																? setValue(
																		`ProductsData.${index}.${Ids.controlSample}.${index}.${Ids.status}`,
																		"true",
																	)
																: "";
														}
													}}
												/>

												<FieldError
													error={
														errors.ProductsData?.[index]?.[Ids.controlSample]
													}
												/>
											</div>

											{fields.ControlSample[index]?.status !== "false" &&
											selectedControlPacking[index]?.length ? (
												<div className="col-span-full ml-5 flex flex-col items-end justify-end gap-2 md:col-span-1 xl:col-span-2">
													<div className="flex items-center">
														<div className="ml-5">
															به صاحب کالا تحویل داده ‌
														</div>
														<label
															className="ml-1 flex items-center whitespace-nowrap"
															htmlFor={`${fields.Delivered}.true`}
														>
															شد
														</label>
														<input
															className="me-2 ml-5 rounded-lg border border-gray-200 text-sm leading-6 transition-colors placeholder:text-xs placeholder:text-gray-500 focus:border-gray-300 focus:outline-none focus:ring-0 focus:ring-offset-0 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:checked:bg-blue-500"
															type="radio"
															id={`${fields.Delivered}.true`}
															name={"delivered"}
															checked={fields.Delivered === "true"}
															onChange={() => {
																setValue(
																	`ProductsData.${index}.${Ids.delivered}`,
																	"true",
																	{
																		shouldDirty: true,
																		shouldTouch: true,
																		shouldValidate: true,
																	},
																);
															}}
														/>
														<label
															className="ml-1 flex items-center whitespace-nowrap"
															htmlFor={`${fields.Delivered}.false`}
														>
															نشد
														</label>
														<input
															type="radio"
															className="rounded-lg border border-gray-200 text-sm leading-6 transition-colors placeholder:text-xs placeholder:text-gray-500 focus:border-gray-300 focus:outline-none focus:ring-0 focus:ring-offset-0 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:checked:bg-blue-500"
															id={`${fields.Delivered}.false`}
															name={"delivered"}
															checked={fields.Delivered === "false"}
															onChange={() => {
																setValue(
																	`ProductsData.${index}.${Ids.delivered}`,
																	"false",
																	{
																		shouldDirty: true,
																		shouldTouch: true,
																		shouldValidate: true,
																	},
																);
															}}
														/>
													</div>
													<div className="pb-1">
														<FieldError
															error={
																errors.ProductsData?.[index]?.[Ids.delivered]
															}
														/>
													</div>
												</div>
											) : (
												""
											)}

											<div className="col-span-full md:col-span-1 xl:col-span-2 xl:col-start-1">
												{controlSample?.map((packing) => {
													let ids = packing?.value?.split(":")[0];
													let selectedSampleItem =
														formFields?.ProductsData[index]?.ControlSample ||
														[];

													let selectedOptions = selectedSampleItem
														?.flat()
														.find((i) => i?.productId === ids)?.codes;

													if (
														fields.ControlSample[index]?.status !== "false" &&
														selectedControlPacking[index]?.length
													)
														return selectedControlPacking?.[index]?.map(
															(sp) => {
																if (sp?.label === packing?.label) {
																	return (
																		<>
																			<div
																				key={index}
																				className="col-span-full my-2 sm:col-span-6 lg:col-span-3"
																			>
																				<div className="mb-2">
																					{packing?.label}
																				</div>
																				<ReactSelect
																					isMulti
																					isClearable={false}
																					name={`SealNo_${ids}`}
																					placeholder="انتخاب کنید"
																					styles={ReactSelectStyle}
																					options={packing?.value
																						?.split(":")[1]
																						.split(",")
																						.map((code: string) => ({
																							value: code,
																							label: code,
																						}))
																						?.filter(
																							(option) =>
																								!selectedSample
																									?.flatMap((i: any) => i)
																									?.some((item: any) =>
																										item?.codes?.includes(
																											option?.value,
																										),
																									) &&
																								!selectedControlSample
																									?.flatMap((i: any) => i)
																									?.some((item: any) =>
																										item?.codes?.includes(
																											option?.value,
																										),
																									),
																						)}
																					className="basic-multi-select"
																					classNamePrefix="select"
																					noOptionsMessage={() =>
																						"هیچ موردی یافت نشد"
																					}
																					value={selectedOptions?.map(
																						(option: any) => ({
																							value: option,
																							label: option,
																						}),
																					)}
																					onChange={(
																						selectedOptions,
																						actionMeta,
																					) => {
																						// Extract data related to the current index
																						let dataAtIndex: any;

																						setSelectedControlSample(
																							(prev: any) => {
																								// Clone the previous state to avoid mutation
																								const updatedSample = [...prev];

																								// Ensure updatedSample[index] is initialized as an array
																								if (!updatedSample[index]) {
																									updatedSample[index] = [];
																								}

																								// Find the index of the existing entry with the same productId
																								const existingIndex =
																									updatedSample[
																										index
																									].findIndex(
																										(item: any) =>
																											item.productId === ids,
																									);

																								if (existingIndex !== -1) {
																									// If an entry with the same productId exists, update its codes
																									const existingEntry =
																										updatedSample[index][
																											existingIndex
																										];
																									// Filter out duplicate codes
																									if (
																										actionMeta.action !==
																										"remove-value"
																									) {
																										const newCodes =
																											selectedOptions
																												.map(
																													(option) =>
																														option.value,
																												)
																												.filter(
																													(code) =>
																														!existingEntry.codes.includes(
																															code,
																														),
																												);
																										// Update the existing entry's codes
																										existingEntry.codes = [
																											...existingEntry.codes,
																											...newCodes,
																										];
																									} else {
																										existingEntry.codes =
																											existingEntry.codes.filter(
																												(x: string) =>
																													x !==
																													actionMeta
																														.removedValue.value,
																											);
																									}
																								} else {
																									// If no entry with the same productId exists, create a new entry
																									updatedSample[index].push({
																										ProductName: packing?.label,
																										productId: ids,
																										codes: selectedOptions.map(
																											(option) => option.value,
																										),
																									});
																								}

																								dataAtIndex =
																									updatedSample[index];

																								return updatedSample;
																							},
																						);

																						// Pass only data related to the current index to setValue
																						setValue(
																							`ProductsData.${index}.${Ids.controlSample}.${index}`,
																							dataAtIndex,
																							{
																								shouldDirty: true,
																								shouldTouch: true,
																							},
																						);
																					}}
																				/>

																				<FieldError
																					error={
																						errors.ProductsData?.[index]?.[
																							Ids.sealNo
																						]
																					}
																				/>
																			</div>
																		</>
																	);
																} else {
																	return null;
																}
															},
														);
												})}
											</div>

											<div className="col-span-full col-start-1">
												<div className="mb-2">توضیحات</div>
												<Input
													value={fields.Descriptions}
													{...register(
														`ProductsData.${index}.${Ids.descriptions}`,
													)}
												/>
												<FieldError
													error={
														errors.ProductsData?.[index]?.[Ids.descriptions]
													}
												/>
											</div>

											<div className="col-span-full col-start-1 mt-5 flex gap-2">
												{formFields.ProductsData.length > 1 && (
													<Button
														className="w-fit"
														type="button"
														variant="outline"
														onClick={() => remove(index)}
													>
														حذف نمونه
													</Button>
												)}
												{index === formFields.ProductsData.length - 1 && (
													<Button
														className="w-fit"
														type="button"
														variant="outline"
														onClick={() => {
															append({
																[Ids.productName]: "",
																[Ids.productType]: "",
																[Ids.model]: "",
																[Ids.brand]: "",
																[Ids.manufactureDate]: "",
																[Ids.sampleAmount]: "",
																[Ids.unit]: "",
																[Ids.buildNo]: "",
																[Ids.packageNo]: "",
																[Ids.constructionSeries]: "",
																[Ids.physicalCharacteristics]: "",
																[Ids.packingType]: "",
																[Ids.controlSample]: "",
																[Ids.delivered]: "",
															});
														}}
													>
														افزودن نمونه دیگر
													</Button>
												)}
											</div>

											<Separator className="col-span-full h-1" />
										</>
									);
								})}

								<div className="col-span-full !col-start-1 md:col-span-1 xl:col-span-2">
									<div className="mb-2">نام آزمایشگاه</div>
									<Input
										value={formFields.LaboratoryManager}
										{...register(Ids.laboratoryManager)}
									/>
									<FieldError error={errors.LaboratoryManager} />
								</div>

								<div className="col-span-full md:col-span-1 md:col-start-1 xl:col-span-2 xl:col-start-1">
									<div className="mb-2">نام واحد تولیدی</div>
									<Input
										value={formFields.ProductionUnitName}
										{...register(Ids.productionUnitName)}
									/>
									<FieldError error={errors.ProductionUnitName} />
								</div>

								<div className="col-span-full flex flex-col items-end gap-2 md:col-span-1 xl:col-span-2">
									<div className="flex flex-col justify-between">
										<div className="mb-2 w-48">امضای واحد تولیدی</div>

										<div className="flex w-full items-center gap-3">
											<SignaturePad
												signature={formFields.ProductiveSignature}
												setSignature={(signature) =>
													setValue("ProductiveSignature", signature, {
														shouldDirty: true,
														shouldTouch: true,
														shouldValidate: true,
													})
												}
												clearSignature={() =>
													setValue("ProductiveSignature", "", {
														shouldDirty: true,
														shouldTouch: true,
														shouldValidate: true,
													})
												}
												{...register(Ids.productiveSignature)}
											/>
										</div>
									</div>
									<FieldError error={errors.ProductiveSignature} />
								</div>

								<div className="col-span-full md:col-span-1 md:col-start-1 xl:col-span-2 xl:col-start-1">
									<div className="mb-2">نام مدیر کنترل کیفیت</div>
									<Input value={formFields.QcName} {...register(Ids.qcName)} />
									<FieldError error={errors.QcName} />
								</div>

								<div className="col-span-full flex flex-col items-end gap-2 md:col-span-1 xl:col-span-2">
									<div className="flex flex-col justify-between">
										<div className="mb-2 w-48">امضای مدیر کنترل کیفیت</div>

										<div className="flex w-full items-center gap-3">
											<SignaturePad
												signature={formFields.QcSignature}
												setSignature={(signature) =>
													setValue("QcSignature", signature, {
														shouldDirty: true,
														shouldTouch: true,
														shouldValidate: true,
													})
												}
												clearSignature={() =>
													setValue("QcSignature", "", {
														shouldDirty: true,
														shouldTouch: true,
														shouldValidate: true,
													})
												}
												{...register(Ids.qcSignature)}
											/>
										</div>
									</div>
									<FieldError error={errors.QcSignature} />
								</div>

								{isFieldInTaskForm(task, Ids.dischargerName) &&
									isFieldInTaskForm(task, Ids.dischargerPhoneNo) && (
										<>
											<Separator className="col-span-full h-1" />

											<FormField
												control={control}
												name={Ids.dischargerName}
												render={({ field }) => (
													<FormItem className="col-span-full !col-start-1 md:col-span-1 xl:col-span-2">
														<FormLabel>نام ترخیص کار</FormLabel>
														<FormControl>
															<Input {...field} />
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>

											<FormField
												control={control}
												name={Ids.dischargerPhoneNo}
												render={({ field }) => (
													<FormItem className="col-span-full md:col-span-1 xl:col-span-2">
														<FormLabel>شماره تماس ترخیص کار</FormLabel>
														<FormControl>
															<Input {...field} />
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
										</>
									)}
							</>
						)}
					</div>
				</div>
			)}
		</div>
	);
}
