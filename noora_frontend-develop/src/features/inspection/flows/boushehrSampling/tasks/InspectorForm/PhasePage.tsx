"use client";

import { addCommas } from "persian-tools";
import React, { useCallback, useEffect, useState } from "react";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import { IoMdInformationCircleOutline } from "react-icons/io";
import ReactSelect from "react-select";
import { toast } from "sonner";
import { z } from "zod";

import GetProductHistoryByCategory from "@/api/products/getProductHistoryByCategory";
import PutProductsHistory from "@/api/products/putProductHistory";
import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import { getBuyerById } from "@/buyers/services/getBuyerById";
import { Button } from "@/components/ui/button";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
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
import GetAllUserDocuments from "@/identity/userDocuments/services/getAllUserDocuments";
import GetUserDocumentsFile from "@/identity/userDocuments/services/getUserDocumentsFile";
import { messages } from "@/messages";
import { Loading } from "@/ui/Loader";
import { ReactSelectStyle } from "@/ui/Select/ReactSelectStyle";
import SignaturePad from "@/ui/SignaturePad";
import { isObjectId } from "@/utils/isObjectId";
import { roundToNearestTen } from "@/utils/roundToNearestTen";

import SelectModule from "../../_components/SelectModule";
import { Ids } from "../../data";
import { serviceTypeOptions, serviceTypes } from "../../models/ServiceType";
import { CustomsPreview } from "./CustomsPreview";
import { schema } from "./PhaseSchema";

export type FormData = z.infer<typeof schema>;

interface ProductsData {
	ProductName: string;
	Model: string;
	Brand: string;
	ManufactureCountry: string;
	SampleAmount: string;
	Unit: string;
	PackingType: { codes: string[] };
	SealNo: string;
	SmallLabelNo: string;
	BigLabelNo: string;
}

interface OptionType {
	value: string;
	label: string;
}

// const places = [
//   { value: "خط تولید کارخانه", label: "خط تولید کارخانه" },
//   { value: "انبار واحد تولیدی", label: "انبار واحد تولیدی" },
//   { value: "انبار عرضه کننده", label: "انبار عرضه کننده" },
//   { value: "فروشگاه (بازار)", label: "فروشگاه (بازار)" },
// ];

const packingType: Array<{ value: string; label: string }> = [];

const inspectorStatus = [
	{ value: "finish", label: "تایید" },
	{ value: "return", label: "رد" },
];

const customsTitles = [
	{
		value: "مشمول استاندارد اجباری واردات",
		label: "مشمول استاندارد اجباری واردات",
	},
	{
		value: "مشمول استاندارد اجباری صادرات",
		label: "مشمول استاندارد اجباری صادرات",
	},
	{
		value: "فرآورده‌های نفتی تعیین ماهیت",
		label: "فرآورده‌های نفتی تعیین ماهیت",
	},
	{ value: "کالا جهت تعیین ماهیت", label: "کالا جهت تعیین ماهیت" },
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

const costsTypes = [
	{
		label: "بازرسی بدون نمونه برداری",
		value: { basePrice: 9618000, price: 10579800, per: 10 },
	},
	{
		label: "غلات(مطابق استاندارد)",
		value: { basePrice: 13740000, price: 15114000, per: 10 },
	},
	{
		label: "غلات(نمونه برداری تصادفی)",
		value: { basePrice: 8931000, price: 9824100, per: 10 },
	},
	{
		label: "سایر کالاها",
		value: { basePrice: 9618000, price: 10579800, per: 10 },
	},
	{ label: "آماده سازی", value: { basePrice: 687000, price: 755700, per: 10 } },
];

const costsTypesWithEnglishValue = [
	...serviceTypeOptions,
	{
		label: "نمونه برداری + آماده سازی",
		value: "Sampling + Preparation",
	},
	{
		label: "بازرسی بدون نمونه برداری",
		value: "Inspection without Sampling",
	},
	{
		label: "غلات(مطابق استاندارد)",
		value: "Grains (Standard)",
	},
	{
		label: "غلات(نمونه برداری تصادفی)",
		value: "Grains (Random Sampling)",
	},
	{
		label: "سایر کالاها",
		value: "Other Goods",
	},
	{
		label: "آماده سازی",
		value: "Preparation",
	},
];

const defaultValuesProductsData = {
	ProductName: "",
	Model: "",
	Brand: "",
	SampleAmount: "",
	Unit: "",
	ManufactureCountry: "",
	StandardMethod: "",
	SealNo: "",
	SmallLabelNo: "",
	BigLabelNo: "",
};

const FEE_PRICE_TABLE = {
	1: 11335500,
	2: 12091200,
	3: 12846900,
	4: 14358300,
	5: 15869700,
	6: 17381100,
	7: 18892500,
	8: 20401300,
	9: 21912300,
	10: 23423300,
};

const TAX_PRICE_TABLE = {
	1: 1133550,
	2: 1209120,
	3: 1284690,
	4: 1435830,
	5: 1586970,
	6: 1738110,
	7: 1889250,
	8: 2040130,
	9: 2191230,
	10: 2342330,
};

const TOTAL_PRICE_TABLE = {
	1: 12469050,
	2: 13300320,
	3: 14131590,
	4: 15794130,
	5: 17456670,
	6: 19119210,
	7: 20781750,
	8: 22441430,
	9: 24103530,
	10: 25765630,
};

export function PhasePage() {
	const { identity } = useLoggedInUser();

	const { task, hooks, dispatch } = useTaskContext();
	const { data, caseNo, instanceId } = task;

	const [isLoading, setLoading] = useState<boolean>(false);
	const [showPreview, setShowPreview] = useState<boolean>(false);
	const [firstPrice, setFirstPrice] = useState<number>(0);
	const [secondPrice, setSecondPrice] = useState<number>(0);
	const [codesData, setCodesData] = useState<
		Array<{ productId: string; ProductName: string; unUsedCodes: number[] }>
	>([]);

	const [selectedPacking, setSelectedPaking] = useState<
		Array<Array<{ value?: string; label?: string }>>
	>([]);
	const [selectedSample, setSelectedSample] = useState<any>([]);

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

	const {
		control,
		formState: { errors },
		register,
		setValue,
		watch,
		trigger,
		unregister,
		clearErrors,
	} = useFormContext<FormData>();
	const { append, remove } = useFieldArray({
		name: "ProductsData",
	});

	const formFields = watch();
	const { [Ids.samplerName]: samplerName, [Ids.productsData]: productsData } =
		formFields;

	useEffect(() => {
		dispatch({ type: "update", options: { saveBtn: true } });
	}, [dispatch]);

	useEffect(() => {
		if (
			formFields.ProductsData === undefined ||
			formFields.ProductsData.length === 0
		) {
			append(defaultValuesProductsData);
		}

		setValue("BuyerName", data?.BuyerName);
		setValue("BuyerId", data?.BuyerId);
		setValue("BuyerAddress", data?.BuyerAddress);
		setValue("BranchId", data?.BranchId);
		setValue("SamplerId", data?.SamplerId);
		setValue("SamplerName", data?.SamplerName);
		setValue("Title", data?.Title);
		setValue("Place", data?.Place);
		setValue("SellerName", data?.SellerName);

		getSamplingData();
	}, []);

	const handleCalulatePrice = useCallback(() => {
		let samplesCount =
			+formFields?.SamplesCount || formFields?.ProductsData?.length;

		const types = formFields.SamplingCosts;

		const existsSamplingWithPreparation = types?.some(
			(type) => type.value === "Sampling + Preparation",
		);

		if (existsSamplingWithPreparation) {
			setFirstPrice(
				FEE_PRICE_TABLE[samplesCount as keyof typeof FEE_PRICE_TABLE],
			);
			setSecondPrice(
				TOTAL_PRICE_TABLE[samplesCount as keyof typeof TOTAL_PRICE_TABLE],
			);
		} else if (types?.length === 1 && isObjectId(types[0].value)) {
			const priceList = serviceTypes.find((x) => x.id === types[0].value)!;

			let fee: number;
			if (typeof priceList.price === "number") {
				fee = priceList.price * samplesCount;
			} else {
				fee = priceList.price[samplesCount] || 0;
			}

			const tax = Math.round(fee * 0.1);
			const total = roundToNearestTen(fee + tax);

			setFirstPrice(fee);
			setSecondPrice(total);
		} else {
			let totalPrice = 0;
			let totalBasePrice = 0;
			if (formFields?.SamplingCosts?.length) {
				formFields?.SamplingCosts?.forEach((selectedItem) => {
					const match = costsTypes.find(
						(costType) => costType.label === selectedItem.label,
					);

					if (match) {
						// Special case for "Other Goods"
						if (match.label === "سایر کالاها") {
							if (samplesCount > 3) {
								const extraCount = samplesCount - 3;
								totalBasePrice += match.value.basePrice + extraCount * 687000;
							} else {
								// totalPrice += match.value.price;
								totalBasePrice += match.value.basePrice;
							}
						} else {
							// totalPrice += match.value.price * samplesCount;
							totalBasePrice += match.value.basePrice * samplesCount;
						}
						totalPrice += totalBasePrice * 0.1 + totalBasePrice;
					}
				});
			}

			const newInspectionFee = totalPrice;
			const newTax = totalPrice * 0.1;
			const newTotal = newInspectionFee + newTax;

			setFirstPrice(newInspectionFee);
			setSecondPrice(newTotal);
		}
	}, [
		formFields?.ProductsData?.length,
		formFields?.SamplesCount,
		formFields?.SamplingCosts,
	]);

	useEffect(() => {
		handleCalulatePrice();
	}, [handleCalulatePrice]);

	useEffect(() => {
		if (codesData && data) {
			data?.ProductsData?.map((item: any, index: number) => {
				item?.PackingType !== ""
					? handlePackingChange(
							index,
							item?.PackingType?.flatMap((d: any) => ({
								value: `${data?.productId}:${data?.unUsedCodes?.toString()}`,
								label: d.ProductName,
							})),
						)
					: "";
			});
		}
	}, [codesData, data]);

	async function getUserSignature(SamplerId: string) {
		try {
			let inspectorRes = await GetAllUserDocuments({
				userId: SamplerId,
				page: 0,
				size: 99,
				key: "signature",
			});
			if (inspectorRes) {
				let inspectorFile = await GetUserDocumentsFile({
					fileId: inspectorRes[0].id,
				});
				if (inspectorFile) {
					setTimeout(() => {
						const files = new File(
							[inspectorFile],
							`${formFields.SamplerName}-sign` || "",
							{
								type: inspectorFile.type,
							},
						);
						const reader = new FileReader();
						reader.onloadend = () => {
							setValue("SamplerSignature", reader.result as string);
							data["SamplerSignature"] = reader.result;
						};
						reader.readAsDataURL(files);
					}, 100);
				}
			}
		} catch {
			toast.error("خطایی در دریافت امضا رخ داد!");
		}
	}

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

	// useEffect(() => {
	// 	dispatch({
	// 		type: "footer",
	// 		children: (
	// 			<>
	// 				{formFields.BuyerId && (
	// 					<>
	// 						{!showPreview && (
	// 							<Button
	// 								className="col-span-1"
	// 								type="button"
	// 								variant="primary"
	// 								onClick={() => {
	// 									setShowPreview(true);
	// 								}}
	// 							>
	// 								پیش نمایش فرم
	// 							</Button>
	// 						)}
	// 						{showPreview && (
	// 							<Button
	// 								className="col-span-1"
	// 								type="button"
	// 								variant="primary"
	// 								onClick={() => setShowPreview(false)}
	// 							>
	// 								بازگشت به فرم
	// 							</Button>
	// 						)}
	// 					</>
	// 				)}
	// 			</>
	// 		),
	// 	});
	// }, [dispatch, formFields.BuyerId, showPreview]);

	useEffect(() => {
		if (hooks.get().length === 0) {
			hooks.registerHook(
				"pre-submit",
				async ({ task, data }: { task: Task; data: FormData }) => {
					if (data.ProductsData.length && data.InspectorStatus === "finish") {
						(identity.groups.includes("shahriar") || !data["PageNo"]) &&
							(data["PageNo"] = caseNo);
						try {
							await getBuyerById(data.BuyerId).then((res) => {
								data[Ids.buyerData] = res;
							});
						} catch (error) {
							throw new Error("خطا در دریافت اطلاعات خریدار");
						}

						// calculate price
						let samplesCount =
							+data?.SamplesCount || data?.ProductsData?.length;
						let inspectionFee = 0;

						const types = data.SamplingCosts;

						const existsSamplingWithPreparation = types.some(
							(type) => type.value === "Sampling + Preparation",
						);

						if (existsSamplingWithPreparation) {
							inspectionFee =
								FEE_PRICE_TABLE[samplesCount as keyof typeof FEE_PRICE_TABLE];
						} else if (types?.length === 1 && isObjectId(types[0].value)) {
							const priceList = serviceTypes.find(
								(x) => x.id === types[0].value,
							)!;

							if (typeof priceList.price === "number") {
								inspectionFee = priceList.price * samplesCount;
							} else {
								inspectionFee = priceList.price[samplesCount] || 0;
							}
						} else {
							let totalPrice = 0;
							let totalBasePrice = 0;

							data[Ids.samplingCosts].forEach((selectedItem) => {
								const match = costsTypes.find(
									(costType) => costType.label === selectedItem.label,
								);

								if (match) {
									// Special case for "Other Goods"
									if (match.label === "سایر کالاها") {
										if (samplesCount > 3) {
											const extraCount = samplesCount - 3;
											totalBasePrice +=
												match.value.basePrice + extraCount * 687000;
										} else {
											// totalPrice += match.value.price;
											totalBasePrice += match.value.basePrice;
										}
									} else {
										// totalPrice += match.value.price * samplesCount;
										totalBasePrice += match.value.basePrice * samplesCount;
									}
									totalPrice += totalBasePrice * 0.1 + totalBasePrice;
								}
							});

							inspectionFee = totalPrice;
						}

						let packingTypes = data?.ProductsData?.map(
							(item: any) => item?.PackingType,
						);

						let hasPackingType =
							Array.isArray(packingTypes) &&
							packingTypes.some((val) => Array.isArray(val) && val.length > 0);

						let parsedData = [];

						if (hasPackingType) {
							parsedData =
								data?.ProductsData?.flatMap((item: any) =>
									item?.PackingType?.flatMap((entry: any) => ({
										usedCodes: entry?.codes?.map(Number) || [],
										productId: entry?.productId || "string",
									})),
								) || [];
						}

						let finalData = parsedData?.filter(
							(item) => item !== null && item !== undefined,
						);

						try {
							let res = await PutProductsHistory({
								historyItems: finalData,
							});
							if (res) {
								toast.success("کد ها با موفقیت ثبت شد!");
							}
						} catch (e) {
							console.error(e);
							throw new Error("خطا در ثبت کد ");
						}
						// const counter = await getIndicatorCounterByKey("customs-sampling");
						// data["CustomsId"] = counter;

						// create income
						const category = await getFinancialCategories({
							filters: { type: FinancialCategoryType.Income, key: "sampling" },
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
				},
			);
		}
	}, [caseNo, hooks, identity.groups, identity.id, instanceId]);

	return showPreview ? (
		<CustomsPreview data={formFields} />
	) : (
		<>
			{isLoading ? (
				<div className="w-full">
					<Loading>درحال دریافت اطلاعات ...</Loading>
				</div>
			) : (
				<div className="grid grid-cols-1 gap-y-6 sm:grid-cols-12 sm:gap-x-10">
					<div className="col-span-full lg:col-span-6">
						<div className="mb-2">نام خریدار</div>
						<Input
							className="rtl:text-right"
							dir="ltr"
							disabled
							value={task.data[Ids.buyerName]}
						/>
					</div>

					{formFields.BuyerId && (
						<>
							<div className="col-span-full lg:col-span-6 lg:col-start-1">
								<div className="mb-2">نشانی خریدار</div>

								<Input
									className="cursor-not-allowed"
									value={formFields.BuyerAddress}
									disabled={true}
								/>
							</div>

							{!identity.groups.includes("shahriar") && (
								<div className="col-span-full col-start-1 sm:col-span-6 lg:col-span-3">
									<div className="mb-2">
										شماره برگه نمونه<span className="text-red-600">*</span>
									</div>
									<MaskInput
										className="text-right tracking-widest"
										dir="ltr"
										mask={/\d$/}
										value={formFields.PageNo}
										onMutate={(v) => {
											setValue("PageNo", v, {
												shouldDirty: true,
												shouldTouch: true,
												shouldValidate: true,
											});
										}}
										{...register("PageNo", {
											required: messages.validation.required,
											deps: [],
										})}
									/>
									<FieldError error={errors.PageNo} />
								</div>
							)}

							<div className="col-span-full sm:col-span-6 lg:col-span-3 lg:col-start-1">
								<div className="mb-2">
									شماره ملی<span className="text-red-600">*</span>
								</div>
								<Input
									value={formFields.NationalNo}
									{...register("NationalNo", {
										required: messages.validation.required,
										deps: [],
									})}
								/>
								<FieldError error={errors.NationalNo} />
							</div>

							<div className="col-span-full sm:col-span-6 lg:col-span-3">
								<div className="mb-2">
									شماره اقتصادی<span className="text-red-600">*</span>
								</div>
								<Input
									value={formFields.EconomicalNo}
									{...register("EconomicalNo", {
										required: messages.validation.required,
										deps: [],
									})}
								/>
								<FieldError error={errors.EconomicalNo} />
							</div>

							<div className="col-span-full sm:col-span-6 lg:col-span-3">
								<div className="mb-2">
									شماره کوتاژ<span className="text-red-600">*</span>
								</div>
								<MaskInput
									className="text-right tracking-widest"
									dir="ltr"
									mask={/\d$/}
									value={formFields.CottageNo}
									id="CottageNo"
									onMutate={(v) => {
										setValue("CottageNo", v, {
											shouldDirty: true,
											shouldTouch: true,
											shouldValidate: true,
										});
									}}
									{...(({ ref, ...register }) => register)(
										register("CottageNo", {
											required: messages.validation.required,
											deps: [],
										}),
									)}
								/>
								<FieldError error={errors.CottageNo} />
							</div>

							<div className="col-span-full sm:col-span-6 lg:col-span-3 lg:col-start-1">
								<div className="mb-2">تاریخ کوتاژ</div>
								<DateInput
									autoComplete="off"
									onLeave={() => {
										trigger("CottageDate");
									}}
									value={formFields.CottageDate}
									onMutate={(v) => {
										setValue("CottageDate", v, {
											shouldDirty: true,
											shouldTouch: true,
											shouldValidate: true,
										});
									}}
									{...(({ ref, ...register }) => register)(
										register("CottageDate"),
									)}
								/>
							</div>

							<div className="col-span-full space-y-2 sm:col-span-6 lg:col-span-3">
								<label>نام و نام خانوادگی نمونه بردار</label>
								<Input defaultValue={samplerName} disabled />
							</div>

							{/* <div className="col-span-full sm:col-span-6 lg:col-span-3">
                <div className="mb-2">محل نمونه برداری</div>
                <Select
                  id="place"
                  items={places}
                  value={formFields.Place}
                  onLeave={() => {
                    trigger("Place");
                  }}
                  onMutate={(v) => {
                    setValue("Place", v || "", {
                      shouldDirty: true,
                      shouldTouch: true,
                      shouldValidate: true,
                    });
                  }}
                  {...(({ ref, ...register }) => register)(
                    register("Place", {
                      required: messages.validation.required,
                    })
                  )}
                />
                <FieldError error={errors.Place} />
              </div> */}

							<div className="col-span-full sm:col-span-6 lg:col-span-3">
								<div className="mb-2">مکان نمونه برداری</div>
								<div>
									<Input value={formFields.Place} {...register("Place")} />
								</div>
							</div>

							<div className="col-span-full sm:col-span-6 lg:col-span-3 lg:col-start-1">
								<div className="mb-2">شماره قبض انبار</div>
								<div>
									<Input value={formFields.Receipt} {...register("Receipt")} />
								</div>
							</div>

							<div className="col-span-full sm:col-span-6 lg:col-span-3">
								<div className="mb-2">عنوان نمونه برداری</div>
								<Select
									id="Title"
									items={customsTitles}
									value={formFields?.Title}
									onMutate={(v) => {
										setValue("Title", v || "", {
											shouldDirty: true,
											shouldTouch: true,
											shouldValidate: true,
										});
									}}
									{...(({ ref, ...register }) => register)(
										register("Title", {
											deps: [],
											// required: messages.validation.required,
										}),
									)}
								/>
								<FieldError error={errors.Title} />
							</div>

							<Controller
								control={control}
								name={Ids.containerNo}
								render={({ field, fieldState }) => (
									<div className="col-span-full space-y-2 sm:col-span-6 lg:col-span-3 lg:col-start-1">
										<label htmlFor={field.name}>شماره کانتینر</label>
										<Input id={field.name} {...field} />
										<FieldError error={fieldState.error} />
									</div>
								)}
							/>

							<Controller
								control={control}
								name={Ids.productsTotal}
								render={({ field, fieldState }) => (
									<div className="col-span-full space-y-2 sm:col-span-6 lg:col-span-3">
										<label htmlFor={Ids.productsTotal}>مقدار کل کالا</label>
										<Input id={field.name} {...field} />
										<FieldError error={fieldState.error} />
									</div>
								)}
							/>

							<div className="col-span-full sm:col-span-6 lg:col-span-3 lg:col-start-1">
								<div className="mb-2">نام فروشنده</div>
								<div>
									<Input
										value={formFields.SellerName}
										{...register("SellerName", {
											// required: messages.validation.required,
										})}
									/>
									<FieldError error={errors.SellerName} />
								</div>
							</div>

							<div className="col-span-full sm:col-span-6 lg:col-span-3">
								<div className="mb-2">نام نماینده صاحب کالا</div>
								<div>
									<Input
										value={formFields.ProductOwner}
										{...register("ProductOwner", {
											// required: messages.validation.required,
										})}
									/>
									<FieldError error={errors.ProductOwner} />
								</div>
							</div>

							<div className="col-span-full sm:col-span-6 lg:col-span-3">
								<div className="mb-2">نام هماهنگ کننده</div>
								<div>
									<Input
										value={formFields.Coordinator}
										{...register("Coordinator", {
											// required: messages.validation.required,
										})}
									/>
									<FieldError error={errors.Coordinator} />
								</div>
							</div>

							<div className="col-span-full sm:col-span-6 lg:col-span-3 lg:col-start-1">
								<div className="mb-2">تعداد نمونه</div>
								<div>
									<MaskInput
										disabled={formFields?.ProductsData?.length > 1}
										placeholder={
											formFields?.ProductsData?.length > 1
												? `${formFields?.ProductsData?.length}`
												: ""
										}
										className="text-right tracking-widest"
										dir="ltr"
										mask={/\d$/}
										value={formFields.SamplesCount}
										onMutate={(v) => {
											setValue("SamplesCount", v, {
												shouldDirty: true,
												shouldTouch: true,
												shouldValidate: true,
											});
										}}
										{...register("SamplesCount")}
									/>
									<FieldError error={errors.Coordinator} />
								</div>
							</div>

							<div className="col-span-full sm:col-span-6 lg:col-span-3">
								<div className="mb-2">محاسبه هزینه</div>
								<SelectModule
									data={costsTypesWithEnglishValue}
									setValue={(value) => setValue("SamplingCosts", value)}
									value={formFields.SamplingCosts ?? []}
								/>
								<div className="my-2 rounded-2xl bg-gray-50">
									<p className="my-1 px-2 py-1">
										<IoMdInformationCircleOutline
											size={17}
											className="ml-1 inline text-blue-500"
										/>
										مالیات: 10%
									</p>
									<p className="my-1 px-2 py-1">
										<IoMdInformationCircleOutline
											size={17}
											className="ml-1 inline text-blue-500"
										/>
										قیمت پایه: {addCommas(firstPrice)} ریال
									</p>
									<p className="my-1 px-2 py-1">
										<IoMdInformationCircleOutline
											size={17}
											className="ml-1 inline text-blue-500"
										/>
										قیمت نهایی : {addCommas(secondPrice)} ریال
									</p>
								</div>
							</div>

							{isFieldInTaskForm(task, Ids.reportConclusion) && (
								<FormField
									control={control}
									name={Ids.reportConclusion}
									render={({ field }) => (
										<FormItem className="col-span-full lg:col-span-6 lg:col-start-1">
											<FormLabel>شرح نتیجه نهایی و کلی بازرسی</FormLabel>
											<FormControl>
												<Textarea {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							)}

							<div className="col-span-full flex flex-col gap-2 sm:col-span-6 lg:col-span-3 lg:col-start-1">
								<div className="flex flex-col justify-between">
									<div className="mb-2 w-48">امضای نماینده صاحب کالا</div>

									<div className="flex w-full items-center gap-3">
										<SignaturePad
											signature={formFields.ProductOwnerSignature}
											setSignature={(signature) =>
												setValue("ProductOwnerSignature", signature, {
													shouldDirty: true,
													shouldTouch: true,
													shouldValidate: true,
												})
											}
											clearSignature={() =>
												setValue("ProductOwnerSignature", "", {
													shouldDirty: true,
													shouldTouch: true,
													shouldValidate: true,
												})
											}
											{...register(Ids.productOwnerSignature)}
										/>
									</div>
								</div>
								<FieldError error={errors.ProductOwnerSignature} />
							</div>

							<div className="col-span-full flex flex-col gap-2 sm:col-span-6 lg:col-span-3">
								<div className="flex flex-col justify-between">
									<div className="mb-2 w-48">امضای هماهنگ کننده</div>

									<div className="flex w-full items-center gap-3">
										<SignaturePad
											signature={formFields.CoordinatorSignature}
											setSignature={(signature) =>
												setValue("CoordinatorSignature", signature, {
													shouldDirty: true,
													shouldTouch: true,
													shouldValidate: true,
												})
											}
											clearSignature={() =>
												setValue("CoordinatorSignature", "", {
													shouldDirty: true,
													shouldTouch: true,
													shouldValidate: true,
												})
											}
											{...register(Ids.coordinatorSignature)}
										/>
									</div>
								</div>
								<FieldError error={errors.CoordinatorSignature} />
							</div>

							<Separator className="col-span-full h-1" />

							{/* ****************************** */}
							{formFields.ProductsData.map((fields, index) => {
								register(`ProductsData.${index}.${Ids.packingType}`);
								return (
									<>
										<div className="col-span-full sm:col-span-6 lg:col-span-3 lg:col-start-1">
											<div className="mb-2">نام نمونه</div>
											<div>
												<Input
													value={fields.ProductName}
													{...register(
														`ProductsData.${index}.${Ids.productName}`,
														// { required: messages.validation.required }
													)}
												/>
												<FieldError
													error={
														errors.ProductsData?.[index]?.[Ids.productName]
													}
												/>
											</div>
										</div>

										<div className="col-span-full sm:col-span-6 lg:col-span-3">
											<div className="mb-2">مدل / جزئيات</div>
											<Input
												value={fields.Model}
												{...register(`ProductsData.${index}.${Ids.model}`, {
													// required: messages.validation.required,
												})}
											/>
											<FieldError
												error={errors.ProductsData?.[index]?.[Ids.model]}
											/>
										</div>

										<div className="col-span-full sm:col-span-6 lg:col-span-3">
											<div className="mb-2">نام یا علامت تجاری</div>
											<Input
												value={fields.Brand}
												{...register(`ProductsData.${index}.${Ids.brand}`, {
													// required: messages.validation.required,
												})}
											/>
											<FieldError
												error={errors.ProductsData?.[index]?.[Ids.brand]}
											/>
										</div>

										<Controller
											control={control}
											name={`${Ids.productsData}.${index}.${Ids.productCode}`}
											render={({ field, fieldState }) => (
												<div className="col-span-full space-y-2 sm:col-span-6 lg:col-span-3 lg:col-start-1">
													<label id={field.name}>کد کالا</label>
													<Input id={field.name} {...field} />
													<FieldError error={fieldState.error} />
												</div>
											)}
										/>

										{/* <div className="col-span-full sm:col-span-6 lg:col-span-3 lg:col-start-1">
                      <div className="mb-2">شماره کوتاژ</div>
                      <MaskInput
                        className="text-right tracking-widest"
                        dir="ltr"
                        mask={/\d$/}
                        value={fields.CottageNo}
                        id="CottageNo"
                        onMutate={(v) => {
                          setValue(
                            `ProductsData.${index}.${Ids.cottageNo}`,
                            v,
                            {
                              shouldDirty: true,
                              shouldTouch: true,
                              shouldValidate: true,
                            }
                          );
                        }}
                        {...(({ ref, ...register }) => register)(
                          register(`ProductsData.${index}.${Ids.cottageNo}`, {
                            required: messages.validation.required,
                          })
                        )}
                      />
                      <FieldError
                        error={errors.ProductsData?.[index]?.[Ids.cottageNo]}
                      />
                    </div>

                    <div className="col-span-full sm:col-span-6 lg:col-span-3">
                      <div className="mb-2">تاریخ کوتاژ</div>
                      <DateInput
                        autoComplete="off"
                        onLeave={() => {
                          trigger(`ProductsData.${index}.${Ids.cottageDate}`);
                        }}
                        value={fields.CottageDate}
                        onMutate={(v) => {
                          setValue(
                            `ProductsData.${index}.${Ids.cottageDate}`,
                            v,
                            {
                              shouldDirty: true,
                              shouldTouch: true,
                              shouldValidate: true,
                            }
                          );
                        }}
                        {...(({ ref, ...register }) => register)(
                          register(`ProductsData.${index}.${Ids.cottageDate}`, {
                            required: messages.validation.required,
                          })
                        )}
                      />
                      <FieldError
                        error={errors.ProductsData?.[index]?.[Ids.cottageDate]}
                      />
                    </div>

                    <div className="col-span-full sm:col-span-6 lg:col-span-3">
                      <div className="mb-2">شماره ملی</div>
                      <Input
                        value={fields.NationalNo}
                        {...register(
                          `ProductsData.${index}.${Ids.nationalNo}`,
                          // { required: messages.validation.required }
                        )}
                      />
                      <FieldError
                        error={errors.ProductsData?.[index]?.[Ids.nationalNo]}
                      />
                    </div>

                    <div className="col-span-full sm:col-span-6 lg:col-span-3 lg:col-start-1">
                      <div className="mb-2">شماره اقتصادی</div>
                      <Input
                        value={fields.EconomicalNo}
                        {...register(
                          `ProductsData.${index}.${Ids.economicalNo}`,
                          // { required: messages.validation.required }
                        )}
                      />
                      <FieldError
                        error={errors.ProductsData?.[index]?.[Ids.economicalNo]}
                      />
                    </div> */}

										<div className="col-span-full sm:col-span-6 lg:col-span-3">
											<div className="mb-2">مقدار نمونه</div>
											<Input
												id="SampleAmount"
												{...register(
													`ProductsData.${index}.${Ids.sampleAmount}`,
												)}
											/>
											<FieldError
												error={errors.ProductsData?.[index]?.[Ids.sampleAmount]}
											/>
										</div>

										<div className="col-span-full sm:col-span-6 lg:col-span-3">
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
														// required: messages.validation.required,
													}),
												)}
											/>
											<FieldError
												error={errors.ProductsData?.[index]?.[Ids.unit]}
											/>
										</div>

										<div className="col-span-full sm:col-span-6 lg:col-span-3 lg:col-start-1">
											<div className="mb-2">نام کشور سازنده</div>
											<div>
												<Input
													value={fields.ManufactureCountry}
													{...register(
														`ProductsData.${index}.${Ids.manufactureCountry}`,
														// { required: messages.validation.required }
													)}
												/>
												<FieldError
													error={
														errors.ProductsData?.[index]?.[
															Ids.manufactureCountry
														]
													}
												/>
											</div>
										</div>

										<FormField
											control={control}
											name={`ProductsData.${index}.${Ids.marking}`}
											render={({ field }) => (
												<FormItem className="col-span-full sm:col-span-6 lg:col-span-3">
													<FormLabel>نشانه گذاری</FormLabel>
													<FormControl>
														<Input {...field} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>

										<div className="col-span-full sm:col-span-6 lg:col-span-3">
											<div className="mb-2">
												روش استاندارد مرجع نمونه برداری
											</div>
											<div>
												<Input
													value={fields.StandardMethod}
													{...register(
														`ProductsData.${index}.${Ids.standardMethod}`,
														// { required: messages.validation.required }
													)}
												/>
												<FieldError
													error={
														errors.ProductsData?.[index]?.[Ids.standardMethod]
													}
												/>
											</div>
										</div>
										<div
											className="col-span-full lg:col-span-6 lg:col-start-1"
											key={index}
										>
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
												error={errors.ProductsData?.[index]?.[Ids.packingType]}
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
																					),
																		)}
																	className="basic-multi-select"
																	classNamePrefix="select"
																	noOptionsMessage={() => "هیچ موردی یافت نشد"}
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
																			{ shouldDirty: true, shouldTouch: true },
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

										<div className="col-span-9 mt-5 flex gap-2 lg:col-start-1">
											{formFields.ProductsData.length > 1 && (
												<Button
													type="button"
													variant="outline"
													onClick={() => {
														remove(index);
														setSelectedPaking((prev: any) =>
															prev.filter(
																(item: any, idx: number) => idx !== index,
															),
														);
														setSelectedSample((prev: any) =>
															prev.filter(
																(item: any, idx: number) => idx !== index,
															),
														);
													}}
												>
													حذف نمونه
												</Button>
											)}

											<Button
												disabled={
													formFields?.SamplesCount?.length ? true : false
												}
												type="button"
												variant="outline"
												onClick={() => {
													append({
														[Ids.productName]: "",
														[Ids.model]: "",
														[Ids.brand]: "",
														[Ids.sampleAmount]: "",
														[Ids.unit]: "",
														[Ids.place]: "",
														[Ids.samplerName]: "",
														[Ids.manufactureCountry]: "",
														[Ids.sellerName]: "",
														[Ids.standardMethod]: "",
														[Ids.title]: "",
														[Ids.productId]: "",
														[Ids.codes]: [],
													});
												}}
											>
												افزودن نمونه دیگر
											</Button>
										</div>

										<Separator className="col-span-full h-1" />
									</>
								);
							})}
						</>
					)}

					{isFieldInTaskForm(task, Ids.dischargerName) &&
						isFieldInTaskForm(task, Ids.dischargerPhoneNo) && (
							<>
								<FormField
									control={control}
									name={Ids.dischargerName}
									render={({ field }) => (
										<FormItem className="col-span-full sm:col-span-6 lg:col-span-3 lg:col-start-1">
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
										<FormItem className="col-span-full sm:col-span-6 lg:col-span-3">
											<FormLabel>شماره تماس ترخیص کار</FormLabel>
											<FormControl>
												<Input {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<Separator className="col-span-full h-1" />
							</>
						)}

					<div className="col-span-full sm:col-span-6 lg:col-span-3 lg:col-start-1">
						<div className="mb-2">وضعیت نهایی</div>
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
								register(Ids.inspectorStatus),
							)}
						/>
						<FieldError error={errors.InspectorStatus} />
					</div>
				</div>
			)}
		</>
	);
}
