"use client";

import moment from "jalali-moment";
import React, { useCallback, useEffect, useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import { BuyerCreateDialog } from "@/buyers/components/BuyerCreate/BuyerCreateDialog";
import { Buyer } from "@/buyers/models/Buyer";
import { BuyerQueryFilter } from "@/buyers/models/BuyerQuery";
import { getBuyers } from "@/buyers/services/getBuyers";
import { Button } from "@/components/ui/button";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { addWatcherToInstance } from "@/felo/instances/services/addWatcherToInstance";
import { useTaskContext } from "@/felo/tasks/hooks/useTaskContext";
import { Task } from "@/felo/tasks/models/Task";
import { isFieldInTaskForm } from "@/felo/tasks/utils/isFieldInTaskForm";
import { DateInput } from "@/form/DateInput";
import { FieldError } from "@/form/FieldError";
import { Input } from "@/form/Input";
import { MaskInput } from "@/form/MaskInput";
import { Select, SelectDynamic } from "@/form/select";
import GetAllUserDocuments from "@/identity/userDocuments/services/getAllUserDocuments";
import GetUserDocumentsFile from "@/identity/userDocuments/services/getUserDocumentsFile";
import { User } from "@/identity/users/models/User";
import getUserById from "@/identity/users/services/getUserById";
import { CaseType } from "@/inspection/models/CaseType";
import { getInspectors } from "@/inspection/services/getInspectors";
import { messages } from "@/messages";
import { Loading } from "@/ui/Loader";

import { Ids } from "../../data";
import { CustomsPreview } from "./CustomsPreview";
import { schema } from "./PhaseSchema";

export type FormData = z.infer<typeof schema>;

// type ObjectType = {
//   from: number;
//   to: number;
//   product: {
//     name: string;
//     id: string;
//   };
//   branch: {
//     title: string;
//     name: string;
//     id: string;
//   };
//   id: string;
// };

// interface OptionType {
//   value: string;
//   label: string;
// }

// const packingType = [
//   { value: "seal", label: "پلمپ" },
//   { value: "smallLabel", label: "برچسب ۱۰*۳" },
//   { value: "bigLabel", label: "برچسب ۲۱*۴" },
// ];

// const places = [
//   { value: "خط تولید کارخانه", label: "خط تولید کارخانه" },
//   { value: "انبار واحد تولیدی", label: "انبار واحد تولیدی" },
//   { value: "انبار عرضه کننده", label: "انبار عرضه کننده" },
//   { value: "فروشگاه (بازار)", label: "فروشگاه (بازار)" },
// ];

const customsTitles = [
	{ value: "کالا جهت تعیین ماهیت", label: "کالا جهت تعیین ماهیت" },
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
	Model: "",
	Brand: "",
	SampleAmount: "",
	Unit: "",
	PackingType: "",
	ManufactureCountry: "",
	StandardMethod: "",
};

export function PhasePage() {
	const { identity } = useLoggedInUser();

	const [showBuyerModal, setShowBuyerModal] = useState<boolean>(false);
	const handleClose = useCallback(() => {
		setShowBuyerModal(false);
	}, []);

	// const [seals, setSeals] = useState<OptionType[]>([]);
	// const [bigLabels, setBigLabels] = useState<OptionType[]>([]);
	// const [smallLabels, setSmallLabels] = useState<OptionType[]>([]);
	// const [selectedBuyer, setSelectedBuyers] = useState<Buyer | undefined>();
	// const [user, setUser] = useState<User>();

	const [isLoading, setLoading] = useState<boolean>(false);
	const [showPreview, setShowPreview] = useState<boolean>(false);
	const [buyers, setBuyers] = useState<Buyer[]>([]);
	const [samplers, setSamplers] = useState<User[]>([]);
	const {
		control,
		formState: { isValid, errors },
		register,
		setValue,
		watch,
		trigger,
	} = useFormContext<FormData>();
	const { append, remove } = useFieldArray({
		name: "ProductsData",
	});
	const formFields = watch();

	const samplerName = samplers.map((sampler) => {
		return {
			value: sampler.id,
			label: sampler.fullname,
		};
	});

	const { task, hooks, dispatch } = useTaskContext();
	const { data, userId } = task;

	useEffect(() => {
		dispatch({ type: "update", options: { saveBtn: true } });
	}, [dispatch]);

	useEffect(() => {
		(formFields.ProductsData === undefined ||
			formFields.ProductsData.length === 0) &&
			append(defaultValuesProductsData);

		// setValue("PageNo", data.PageNo || caseNo);
		// setValue("BuyerName", data?.BuyerName);
		// setValue("BuyerId", data?.BuyerId);
		// setValue("BuyerAddress", data?.BuyerAddress);
		// setValue("BranchId", data?.BranchId);
		// setValue("SamplerId", data?.SamplerId);
		// setValue("SamplerName", data?.SamplerName);
		// setValue("Title", data?.Title);
		// setValue("Place", data?.Place);
		// setValue("SellerName", data?.SellerName);

		getSamplingData();
	}, []);

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
		try {
			setLoading(true);

			// preload buyers
			const filters: BuyerQueryFilter = {};
			if (identity.branchId) {
				filters.branches = identity.branchId;
			}

			const buyers = await getBuyers({
				filters,
			});
			setBuyers(buyers);

			await getUserById(userId as string).then(async (res) => {
				// setUser(res);
				setValue("BranchId", res?.branchId as string);
			});

			// preload inspectors
			const inspectors = await getInspectors(identity.branchId);

			const samplerName = inspectors.filter(
				(sampler) => sampler.id === data.SamplerId,
			)[0]?.fullname;
			setValue("SamplerName", samplerName);

			setSamplers(inspectors);
		} catch (error) {
			toast.error("مشکلی پیش آمده، مجدد تلاش کنید");
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		dispatch({
			type: "footer",
			children: (
				<>
					{formFields.BuyerId && (
						<>
							{!showPreview && (
								<Button
									className="col-span-1"
									type="button"
									variant="primary"
									onClick={() => {
										setShowPreview(true);
									}}
								>
									پیش نمایش فرم
								</Button>
							)}
							{showPreview && (
								<Button
									className="col-span-1"
									type="button"
									variant="primary"
									onClick={() => setShowPreview(false)}
								>
									بازگشت به فرم
								</Button>
							)}
						</>
					)}
				</>
			),
		});
	}, [dispatch, isValid, formFields.BuyerId, showPreview, trigger]);

	useEffect(() => {
		if (hooks.get().length === 0) {
			hooks.registerHook(
				"pre-submit",
				async ({ task, data }: { task: Task; data: FormData }) => {
					data[Ids.caseType] = CaseType.Official;
				},
			);

			hooks.registerHook(
				"submit",
				async ({ task, data }: { task: Task; data: FormData }) => {
					const samplerId: string | undefined = data[Ids.samplerId]?.trim();
					if (samplerId) {
						await addWatcherToInstance(task.instanceId, samplerId);
					}
				},
			);
		}
	}, [hooks]);

	return showPreview ? (
		<CustomsPreview data={formFields} />
	) : (
		<>
			{isLoading ? (
				<div className="w-full">
					<Loading>در حال دریافت اطلاعات ...</Loading>
				</div>
			) : (
				<div className="grid grid-cols-1 gap-y-6 sm:grid-cols-12 sm:gap-x-10">
					<div className="col-span-full lg:col-span-6">
						<div className="flex items-center gap-2">
							<div className="w-2/3">
								<div className="mb-2">جستجوی خریداران</div>
								<SelectDynamic<Buyer>
									value={buyers.find(
										(buyer) => buyer.id === formFields.BuyerId,
									)}
									onLabel={(x) => x.nameEn}
									onMutate={(v) => {
										setValue(Ids.buyerId, v?.id!);
										setValue(Ids.buyerAddress, v?.address!);
										setValue(Ids.buyerName, v?.nameEn!);
										setValue(Ids.nationalNo, v?.nationalCode!);
										setValue(Ids.economicalNo, v?.nationalCode!);

										// setSelectedBuyers(v);
									}}
									onSearch={(v) => {
										return buyers.filter(
											(buyer) =>
												!buyer.isDeleted &&
												(buyer.name.toLowerCase().includes(v.toLowerCase()) ||
													buyer.nameEn.toLowerCase().includes(v.toLowerCase())),
										);
									}}
								/>
							</div>
							<Button
								className="mb-1 h-fit w-fit self-end"
								type="button"
								variant="outline"
								onClick={() => setShowBuyerModal(true)}
							>
								<span>افزودن خریدار</span>
							</Button>
						</div>
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
							<div className="col-span-full sm:col-span-6 lg:col-span-3">
								<div className="mb-2">
									تاریخ نمونه برداری<span className="text-red-600">*</span>
								</div>
								<DateInput
									autoComplete="off"
									onLeave={() => {
										trigger("ScheduleDate");
									}}
									value={
										formFields.ScheduleDate
											? moment(formFields.ScheduleDate).format("jYYYY/jMM/jDD")
											: ""
									}
									getDateFormat={(v) =>
										setValue("ScheduleDate", v, {
											shouldDirty: true,
											shouldTouch: true,
											shouldValidate: true,
										})
									}
									{...register("ScheduleDate", {
										required: messages.validation.required,
										deps: [],
									})}
								/>
							</div>
							<div className="col-span-full sm:col-span-6 lg:col-span-3">
								<div className="mb-2">
									نام و نام خانوادگی نمونه بردار
									<span className="text-red-600">*</span>
								</div>
								<Select
									id="SamplerName"
									items={samplerName}
									value={formFields?.SamplerId}
									onMutate={(v) => {
										setValue("SamplerId", v || "", {
											shouldDirty: true,
											shouldTouch: true,
											shouldValidate: true,
										});
										const name = samplerName.find(
											(sampler) => sampler.value === v,
										)?.label;
										setValue("SamplerName", name!);
										getUserSignature(v!);
									}}
									{...(({ ref, ...register }) => register)(
										register("SamplerId", {
											required: messages.validation.required,
											deps: [],
										}),
									)}
								/>
								<FieldError error={errors.SamplerId} />
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
                  {...(({ ref, ...register }) => register)(register("Place"))}
                />
              </div> */}

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
										}),
									)}
								/>
							</div>

							<div className="col-span-full sm:col-span-6 lg:col-span-3">
								<div className="mb-2">مکان نمونه برداری</div>
								<div>
									<Input value={formFields.Place} {...register("Place")} />
								</div>
							</div>

							<div className="col-span-full sm:col-span-6 lg:col-span-3 lg:col-start-1">
								<div className="mb-2">نام نماینده صاحب کالا</div>
								<div>
									<Input
										value={formFields.ProductOwner}
										{...register("ProductOwner")}
									/>
								</div>
							</div>

							<div className="col-span-full sm:col-span-6 lg:col-span-3">
								<div className="mb-2">نام هماهنگ کننده</div>
								<div>
									<Input
										value={formFields.Coordinator}
										{...register("Coordinator")}
									/>
								</div>
							</div>

							<div className="col-span-full sm:col-span-6 lg:col-span-3">
								<div className="mb-2">نام فروشنده</div>
								<div>
									<Input
										value={formFields.SellerName}
										{...register("SellerName")}
									/>
								</div>
							</div>

							<Separator className="col-span-full h-1" />

							{/* ****************************** */}
							{formFields.ProductsData.map((fields, index) => {
								// register(`ProductsData.${index}.${Ids.packingType}`);
								return (
									<>
										<div className="col-span-full sm:col-span-6 lg:col-span-3 lg:col-start-1">
											<div className="mb-2">نام نمونه</div>
											<div>
												<Input
													value={fields.ProductName}
													{...register(
														`ProductsData.${index}.${Ids.productName}`,
													)}
												/>
											</div>
										</div>

										<div className="col-span-full sm:col-span-6 lg:col-span-3">
											<div className="mb-2">مدل / جزئيات</div>
											<Input
												value={fields.Model}
												{...register(`ProductsData.${index}.${Ids.model}`)}
											/>
										</div>

										<div className="col-span-full sm:col-span-6 lg:col-span-3">
											<div className="mb-2">نام یا علامت تجاری</div>
											<Input
												value={fields.Brand}
												{...register(`ProductsData.${index}.${Ids.brand}`)}
											/>
										</div>

										<div className="col-span-full sm:col-span-6 lg:col-span-3 lg:col-start-1">
											<div className="mb-2">مقدار نمونه</div>
											<Input
												id="SampleAmount"
												{...register(
													`ProductsData.${index}.${Ids.sampleAmount}`,
												)}
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
													}),
												)}
											/>
										</div>

										<div className="col-span-full sm:col-span-6 lg:col-span-3">
											<div className="mb-2">نام کشور سازنده</div>
											<div>
												<Input
													value={fields.ManufactureCountry}
													{...register(
														`ProductsData.${index}.${Ids.manufactureCountry}`,
													)}
												/>
											</div>
										</div>

										<div className="col-span-full sm:col-span-6 lg:col-span-3 lg:col-start-1">
											<div className="mb-2">
												روش استاندارد مرجع نمونه برداری
											</div>
											<div>
												<Input
													value={fields.StandardMethod}
													{...register(
														`ProductsData.${index}.${Ids.standardMethod}`,
													)}
												/>
											</div>
										</div>

										{/* <div className="col-span-4  col-start-1">
                        <div className="mb-2">مهار</div>
                        <ReactSelect
                          isMulti
                          isClearable={false}
                          name="packingType"
                          placeholder="انتخاب کنید"
                          styles={ReactSelectStyle}
                          options={packingType}
                          className="basic-multi-select"
                          classNamePrefix="select"
                          noOptionsMessage={() => "هیچ موردی یافت نشد"}
                          value={
                            fields.PackingType !== "" &&
                            fields.PackingType !== undefined
                              ? packingType.filter((item) => {
                                  const packingTypes =
                                    fields.PackingType.split(",");

                                  return packingTypes.includes(item.value);
                                })
                              : undefined
                          }
                          onChange={(selectedOptions) => {
                            const stringValue = selectedOptions
                              .map((item: any) => item.value)
                              .join(",");

                            setValue(
                              `ProductsData.${index}.${Ids.packingType}`,
                              stringValue,
                              {
                                shouldDirty: true,
                                shouldTouch: true,
                                shouldValidate: true,
                              }
                            );

                            if (!stringValue.includes("seal")) {
                              unregister(`ProductsData.${index}.${Ids.sealNo}`);
                            } else {
                              register(`ProductsData.${index}.${Ids.sealNo}`);
                            }
                            if (!stringValue.includes("bigLabel")) {
                              unregister(
                                `ProductsData.${index}.${Ids.bigLabelNo}`
                              );
                            } else {
                              register(
                                `ProductsData.${index}.${Ids.bigLabelNo}`
                              );
                            }
                            if (!stringValue.includes("smallLabel")) {
                              unregister(
                                `ProductsData.${index}.${Ids.smallLabelNo}`
                              );
                            } else {
                              register(
                                `ProductsData.${index}.${Ids.smallLabelNo}`
                              );
                            }
                          }}
                        />
                      </div>

                      {fields.PackingType?.includes("seal") && (
                        <div className="col-span-full sm:col-span-6 lg:col-span-3 col-start-1">
                          <div className="mb-2">شماره پلمپ</div>
                          <ReactSelect
                            isMulti
                            isClearable={false}
                            name="SealNo"
                            placeholder="انتخاب کنید"
                            styles={ReactSelectStyle}
                            options={seals}
                            className="basic-multi-select"
                            classNamePrefix="select"
                            noOptionsMessage={() => "هیچ موردی یافت نشد"}
                            value={
                              fields.SealNo !== "" &&
                              fields.SealNo !== undefined
                                ? seals
                                    .map(
                                      (item) =>
                                        fields.SealNo?.split(",").includes(
                                          item.value
                                        ) && item.value
                                    )
                                    .filter((value) => value !== false)
                                    .map((item) => ({
                                      value: item,
                                      label: item,
                                    }))
                                : undefined
                            }
                            onChange={(selectedOptions) => {
                              const stringValue = selectedOptions
                                .map((item: any) => item.value)
                                .join(",");

                              setValue(
                                `ProductsData.${index}.${Ids.sealNo}`,
                                stringValue,
                                {
                                  shouldDirty: true,
                                  shouldTouch: true,
                                  shouldValidate: true,
                                }
                              );
                            }}
                          />
                        </div>
                      )}
                      {fields?.PackingType?.includes("bigLabel") && (
                        <div className="col-span-full sm:col-span-6 lg:col-span-3">
                          <div className="mb-2">شماره برچسب ۴*۲۱</div>
                          <ReactSelect
                            isMulti
                            isClearable={false}
                            name="bigLabelNo"
                            placeholder="انتخاب کنید"
                            styles={ReactSelectStyle}
                            options={bigLabels}
                            className="basic-multi-select"
                            classNamePrefix="select"
                            noOptionsMessage={() => "هیچ موردی یافت نشد"}
                            value={
                              fields.BigLabelNo !== "" &&
                              fields.BigLabelNo !== undefined
                                ? bigLabels
                                    .map(
                                      (item) =>
                                        fields.BigLabelNo?.split(",").includes(
                                          item.value
                                        ) && item.value
                                    )
                                    .filter((value) => value !== false)
                                    .map((item) => ({
                                      value: item,
                                      label: item,
                                    }))
                                : undefined
                            }
                            onChange={(selectedOptions) => {
                              const stringValue = selectedOptions
                                .map((item: any) => item.value)
                                .join(",");
                              setValue(
                                `ProductsData.${index}.${Ids.bigLabelNo}`,
                                stringValue,
                                {
                                  shouldDirty: true,
                                  shouldTouch: true,
                                  shouldValidate: true,
                                }
                              );
                            }}
                          />
                        </div>
                      )}
                      {fields?.PackingType?.includes("smallLabel") && (
                        <div className="col-span-full sm:col-span-6 lg:col-span-3">
                          <div className="mb-2">شماره برچسب ۳*۱۰</div>
                          <ReactSelect
                            isMulti
                            isClearable={false}
                            name="smallLabelNo"
                            placeholder="انتخاب کنید"
                            styles={ReactSelectStyle}
                            options={smallLabels}
                            className="basic-multi-select"
                            classNamePrefix="select"
                            noOptionsMessage={() => "هیچ موردی یافت نشد"}
                            value={
                              fields.SmallLabelNo !== "" &&
                              fields.SmallLabelNo !== undefined
                                ? smallLabels
                                    .map(
                                      (item) =>
                                        fields.SmallLabelNo?.split(
                                          ","
                                        ).includes(item.value) && item.value
                                    )
                                    .filter((value) => value !== false)
                                    .map((item) => ({
                                      value: item,
                                      label: item,
                                    }))
                                : undefined
                            }
                            onChange={(selectedOptions) => {
                              const stringValue = selectedOptions
                                .map((item: any) => item.value)
                                .join(",");
                              setValue(
                                `ProductsData.${index}.${Ids.smallLabelNo}`,
                                stringValue,
                                {
                                  shouldDirty: true,
                                  shouldTouch: true,
                                  shouldValidate: true,
                                }
                              );
                            }}
                          />
                        </div>
                      )} */}

										<div className="col-span-9 col-start-1 mt-5 flex gap-2">
											{formFields.ProductsData.length > 1 && (
												<Button
													type="button"
													variant="outline"
													onClick={() => remove(index)}
												>
													حذف نمونه
												</Button>
											)}

											{formFields.Title === "کالا جهت تعیین ماهیت" &&
												index === formFields.ProductsData.length - 1 && (
													<Button
														type="button"
														variant="outline"
														onClick={() => {
															append({
																[Ids.productName]: "",
																[Ids.model]: "",
																[Ids.brand]: "",
																[Ids.sampleAmount]: "",
																[Ids.unit]: "",
																[Ids.manufactureCountry]: "",
																[Ids.sellerName]: "",
																[Ids.standardMethod]: "",
																[Ids.title]: "",
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
									</>
								)}
						</>
					)}
				</div>
			)}

			{showBuyerModal && (
				<BuyerCreateDialog
					open={showBuyerModal}
					onClose={handleClose}
					onCreate={async (buyer) => {
						if (buyer) {
							if (identity?.branchId) {
								await getBuyers({
									filters: { branches: identity.branchId },
								}).then((res) => setBuyers(res));
							} else {
								await getBuyers().then((res) => {
									setBuyers(res);
								});
							}
						} else {
							handleClose();
						}
					}}
				/>
			)}
		</>
	);
}
