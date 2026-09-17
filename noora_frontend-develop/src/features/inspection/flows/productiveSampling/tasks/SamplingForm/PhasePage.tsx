"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import CreatableSelect from "react-select/creatable";
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
import { useTaskContext } from "@/felo/tasks/hooks/useTaskContext";
import { isFieldInTaskForm } from "@/felo/tasks/utils/isFieldInTaskForm";
import { DateInput } from "@/form/DateInput";
import { FieldError } from "@/form/FieldError";
import { Input } from "@/form/Input";
import { Select, SelectDynamic } from "@/form/select";
import GetAllUserDocuments from "@/identity/userDocuments/services/getAllUserDocuments";
import GetUserDocumentsFile from "@/identity/userDocuments/services/getUserDocumentsFile";
import { User } from "@/identity/users/models/User";
import { CaseType } from "@/inspection/models/CaseType";
import { getInspectors } from "@/inspection/services/getInspectors";
import { messages } from "@/messages";
import { Loading } from "@/ui/Loader";
import { ReactSelectStyle } from "@/ui/Select/ReactSelectStyle";

import { Ids } from "../../data";
import { schema } from "./PhaseSchema";

export type FormData = z.infer<typeof schema>;

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

export function PhasePage() {
	const { identity } = useLoggedInUser();

	const { task, hooks, dispatch } = useTaskContext();
	const { data, caseNo } = task;

	const [show, setShow] = useState<boolean>(false);
	const handleClose = useCallback(() => {
		setShow(false);
	}, []);

	// const [showPreview, setShowPreview] = useState<boolean>(false);
	const [isLoading, setLoading] = useState<boolean>(false);
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [buyers, setBuyers] = useState<Buyer[]>([]);
	const [samplers, setSamplers] = useState<User[]>([]);

	const {
		control,
		formState: { errors },
		register,
		resetField,
		setValue,
		watch,
		trigger,
	} = useFormContext<FormData>();

	const formFields = watch();

	const samplerName = samplers.map((sampler) => {
		return {
			value: sampler.id,
			label: sampler.fullname,
		};
	});

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

	const getSamplingData = useCallback(async () => {
		setLoading(true);
		try {
			// preload buyers
			const filters: BuyerQueryFilter = {};
			if (identity.branchId) {
				filters.branches = identity.branchId;
			}

			const buyers = await getBuyers({
				filters,
			});
			setBuyers(buyers);

			// preload inspectors
			const inspectors = await getInspectors(identity.branchId);
			setSamplers(inspectors);
		} catch (error) {
			console.error(error);
			toast.error("مشکلی پیش آمده، مجدد تلاش کنید");
		} finally {
			setLoading(false);
		}
	}, [identity.branchId]);

	useEffect(() => {
		dispatch({ type: "update", options: { saveBtn: true } });
	}, [dispatch]);

	useEffect(() => {
		register(Ids.price, {
			required: messages.validation.required,
		});
	}, [register]);

	useEffect(() => {
		getSamplingData();
	}, [getSamplingData]);

	useEffect(() => {
		if (!formFields[Ids.pageNo]) {
			setValue(Ids.pageNo, caseNo);
		}
	}, [caseNo, formFields, setValue]);

	useEffect(() => {
		if (!formFields[Ids.branchId] && identity.branchId) {
			setValue(Ids.branchId, identity.branchId);
		}
	}, [formFields, identity.branchId, setValue]);

	useEffect(() => {
		if (hooks.get().length === 0) {
			hooks.registerHook("pre-submit", async ({ data }) => {
				data[Ids.caseType] = CaseType.Official;
			});
		}
	}, [hooks]);

	return (
		<div>
			{isLoading ? (
				<div className="w-full">
					<Loading>درحال دریافت اطلاعات ...</Loading>
				</div>
			) : (
				<div className="grid grid-cols-1 xl:grid-cols-4">
					<div className="col-span-full grid grid-cols-3 gap-y-6 lg:grid-cols-4 lg:gap-x-3 xl:col-span-3 xl:grid-cols-9">
						{/* <div className="col-span-full lg:col-span-2 xl:col-span-3 col-start-1">
              <div className="mb-2">شماره برگه نمونه</div>
              <Input
                className="text-right tracking-widest"
                value={formFields.PageNo}
                disabled={true}
              />	
              <FieldError error={errors.PageNo} />
            </div> */}

						<div className="col-span-2 lg:col-span-1 xl:col-span-3">
							<div className="mb-2">جستجوی خریداران</div>
							<SelectDynamic<Buyer>
								value={buyers.find((buyer) => buyer.id === formFields.BuyerId)}
								onLabel={(x) => x.name}
								onMutate={(buyer) => {
									setValue(Ids.buyerId, buyer?.id ?? "");
									setValue(Ids.buyerAddress, buyer?.address ?? "");
									setValue(Ids.buyerName, buyer?.name ?? "");
									setValue(Ids.buyerData, buyer as any);
								}}
								onSearch={(v) =>
									buyers.filter(
										(buyer) =>
											!buyer.isDeleted &&
											buyer.name.toLowerCase().includes(v.toLowerCase()),
									)
								}
							/>
						</div>

						<Button
							className="col-span-1 mb-1 mr-2 h-fit w-fit self-end xl:col-span-2"
							type="button"
							variant="outline"
							onClick={() => setShow(true)}
						>
							<span>افزودن خریدار</span>
						</Button>

						{formFields.BuyerId && (
							<>
								<div className="col-span-full lg:col-span-4 lg:col-start-1 xl:col-span-6 xl:col-start-1">
									<div className="mb-2">نشانی خریدار</div>

									<Input
										className="cursor-not-allowed"
										value={formFields.BuyerAddress}
										disabled={true}
									/>
								</div>

								<Separator className="col-span-full h-1" />

								<div className="col-span-full lg:col-span-2 xl:col-span-3">
									<div className="mb-2">نام و نام خانوادگی نمونه بردار</div>
									<Select
										id="SamplerName"
										items={samplerName}
										value={formFields?.SamplerId}
										onMutate={(v) => {
											setValue(Ids.samplerId, v || "", {
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
											register(Ids.samplerId, {
												deps: [],
												required: messages.validation.required,
											}),
										)}
									/>
									<FieldError error={errors.SamplerId} />
								</div>

								<div className="col-span-full lg:col-span-2 xl:col-span-3">
									<div className="mb-2">قیمت نمونه برداری</div>
									<CreatableSelect
										isClearable={false}
										classNamePrefix="custom-select"
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
											const value = selectedOption?.value;

											setValue(Ids.price, value?.replace(/,/g, "") || "", {
												shouldDirty: true,
												shouldTouch: true,
												shouldValidate: true,
											});
										}}
									/>

									{formFields.Price !== "" &&
										formFields.Price !== undefined && (
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

								<div className="col-span-full lg:col-span-2 xl:col-span-3">
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
												required: messages.validation.required,
											}),
										)}
									/>
									<FieldError error={errors.Date} />
								</div>

								<div className="col-span-full lg:col-span-2 xl:col-span-3">
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
										{...(({ ref, ...register }) => register)(
											register(Ids.place),
										)}
									/>
									<FieldError error={errors.Place} />
								</div>

								<div className="col-span-full lg:col-span-2 xl:col-span-3">
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
											register(Ids.type),
										)}
									/>
									<FieldError error={errors.Type} />
								</div>

								<div className="col-span-full lg:col-span-2 xl:col-span-3">
									<div className="mb-2">بارکد سامانه</div>
									<Input
										value={formFields.SystemBarcode}
										{...register(Ids.systemBarcode)}
									/>
									<FieldError error={errors.SystemBarcode} />
								</div>

								{isFieldInTaskForm(task, Ids.dischargerName) &&
									isFieldInTaskForm(task, Ids.dischargerPhoneNo) && (
										<>
											<Separator className="col-span-full h-1" />

											<FormField
												control={control}
												name={Ids.dischargerName}
												render={({ field }) => (
													<FormItem className="col-span-full lg:col-span-2 xl:col-span-3">
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
													<FormItem className="col-span-full lg:col-span-2 xl:col-span-3">
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

			{show && (
				<BuyerCreateDialog
					open={show}
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
		</div>
	);
}
