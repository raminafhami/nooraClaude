"use client";

import moment from "moment-jalaali";
import React, { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { DateInput } from "@/form/DateInput";
import { FieldError } from "@/form/FieldError";
import { Input } from "@/form/Input";
import { ContractStatus } from "@/hrm/contract/enums/ContractStatus";
import { Contract } from "@/hrm/contract/models/Contract";
import { getContractById } from "@/hrm/contract/services/getContractById";
import { JobDescription, JobService } from "@/hrm/jobs";
import { Personnel } from "@/hrm/personnel/models/Personnel";
import { getPersonnelById } from "@/hrm/personnel/services/getPersonnelById";
import { messages } from "@/messages";
import { Loading } from "@/ui/Loader";
import { Seperator } from "@/ui/Seperator";

import { ContractPreview } from "../../../add/_components/ContractPreview";

export interface FormData {
	id?: string;
	jobs: {
		id: string;
		name: string;
		goodsInspectionField?: string;
	}[];
	contractNo: string;
	startDate: string;
	signDate: string;
	endDate: string;
	period: number;
	salaryType: string;
	salaryAmount: number;
	status: ContractStatus;
	workplace: string;
	bankAccountNumber: string;
	bankName: string;
	bankBranch: string;
	damages: string;
}

export function ContractEditForm({ id }: { id: string }) {
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [contract, setContract] = useState<Contract>();
	const [job, setJob] = useState<JobDescription[]>();
	const [personnel, setPersonnel] = useState<Personnel>();

	useEffect(() => {
		async function loadContract() {
			try {
				setIsLoading(true);

				const contract = await getContractById(id);
				setContract(contract);

				const personnel = await getPersonnelById(contract?.userId as string, [
					"user",
				]);
				setPersonnel(personnel);

				const job = await JobService.get({
					filters: [
						{
							name: "_id",
							value: [...(contract.jobs as any).map((x: any) => x.id)],
						},
					],
				});
				setJob(job as JobDescription[]);
			} catch (err) {
			} finally {
				setIsLoading(false);
			}
		}

		loadContract();
	}, [id]);

	const methods = useForm<FormData>({
		values: {
			jobs:
				job?.map((item) => ({
					id: item.id,
					name: item.name,
					goodsInspectionField: item.metadata?.goodsInspectionField,
				})) || [],
			contractNo:
				contract?.contractNo !== undefined ? contract?.contractNo : "",
			startDate:
				contract?.startDate !== undefined
					? getDatesIngregorian(contract.startDate)
					: "",
			signDate:
				contract?.signDate !== undefined
					? getDatesIngregorian(contract.signDate)
					: "",
			endDate:
				contract?.endDate !== undefined
					? getDatesIngregorian(contract.endDate)
					: "",
			period: contract?.period !== undefined ? contract.period : 0,
			salaryType: "ثابت",
			salaryAmount:
				contract?.salaryAmount !== undefined ? contract.salaryAmount : 0,
			status: contract?.status as ContractStatus,
			workplace: contract?.workplace !== undefined ? contract?.workplace : "",
			bankAccountNumber:
				contract?.bankAccountNumber !== undefined
					? contract?.bankAccountNumber
					: "",
			bankName: contract?.bankName !== undefined ? contract?.bankName : "",
			damages: contract?.damages !== undefined ? contract?.damages : "",
			bankBranch:
				contract?.bankBranch !== undefined ? contract?.bankBranch : "",
			id: contract?.id !== undefined ? contract?.id : "",
		},
		mode: "onTouched",
	});

	const {
		formState,
		handleSubmit,
		register,
		setError,
		setValue,
		trigger,
		watch,
	} = methods;
	const { errors, isSubmitting, isSubmitSuccessful } = formState;

	const { jobs } = watch();

	const [showContractPreview, setShowContractPreview] = useState(false);

	return (
		<>
			{showContractPreview ? (
				<ContractPreview
					contractDetails={methods.getValues()}
					personnel={personnel}
				/>
			) : (
				<>
					{isLoading ? (
						<div>درحال دریافت اطلاعات ...</div>
					) : (
						<FormProvider {...methods}>
							<form
								onSubmit={handleSubmit(async (data) => {
									try {
										// Set contract details from the form
										methods.setValue("contractNo", data.contractNo);
										methods.setValue("signDate", data.startDate);
										methods.setValue("jobs", data.jobs);
										methods.setValue("startDate", data.startDate);
										methods.setValue("endDate", data.endDate);
										methods.setValue("period", +data.period);
										methods.setValue("damages", data.damages);
										methods.setValue("salaryType", "fixed");
										methods.setValue("salaryAmount", +data.salaryAmount);
										methods.setValue("status", ContractStatus.Draft);
										methods.setValue("id", data.id);

										setShowContractPreview(true);
									} catch (err) {
										setError("root.server", {
											message: "Something went wrong...",
										});
									}
								})}
							>
								<div className="grid grid-cols-12 items-start justify-center gap-x-10 gap-y-6">
									{contract && (
										<>
											<div className="col-span-3">
												<label htmlFor="nationalCode">
													نام و نام خانوادگی:
												</label>
												<Input
													className="mt-2 cursor-not-allowed"
													value={contract?.fullname}
													disabled={true}
												/>
											</div>

											<div className="col-span-3">
												<label htmlFor="nationalCode">کدملی:</label>
												<Input
													className="mt-2 cursor-not-allowed"
													value={contract?.nationalCode}
													disabled={true}
												/>
											</div>

											<div className="col-span-3">
												<label htmlFor="phoneNo">شماره موبایل:</label>
												<Input
													className="mt-2 cursor-not-allowed"
													value={contract?.phoneNo}
													disabled={true}
												/>
											</div>

											<Seperator className="mt-5" />

											<div className="col-span-full flex">
												<div className="shrink-0 basis-40">سمت های شغلی:</div>
												<div className="space-y-2">
													{jobs.map((job) => (
														<div key={job.id}>
															{job.name}
															{job.goodsInspectionField && (
																<span className="ms-2 text-xs text-gray-600">
																	(حوزه {job.goodsInspectionField})
																</span>
															)}
														</div>
													))}
												</div>
											</div>

											<Seperator />

											<div className="col-span-3">
												<div className="mb-2">تاریخ انعقاد از</div>
												<DateInput
													id={"startDate"}
													autoComplete="new-password"
													value={contract.startDate}
													onLeave={() => {
														trigger("startDate");
													}}
													onMutate={(v) => {
														setValue("startDate", v, {
															shouldDirty: true,
															shouldTouch: true,
															shouldValidate: true,
														});
													}}
													{...(({ ref, ...register }) => register)(
														register("startDate", {
															deps: [],
															required: messages.validation.required,
														}),
													)}
												/>
												<FieldError error={errors["startDate"]} />
											</div>

											<div className="col-span-3">
												<div className="mb-2">تاریخ انعقاد از</div>
												<DateInput
													id={"endDate"}
													autoComplete="new-password"
													value={contract.endDate}
													minDate={watch("startDate")}
													onLeave={() => {
														trigger("endDate");
													}}
													onMutate={(v) => {
														setValue("endDate", v, {
															shouldDirty: true,
															shouldTouch: true,
															shouldValidate: true,
														});
													}}
													{...(({ ref, ...register }) => register)(
														register("endDate", {
															deps: [],
															required: messages.validation.required,
														}),
													)}
												/>
												<FieldError error={errors["endDate"]} />
											</div>

											<div className="col-span-3">
												<label htmlFor="period">مدت به ماه</label>
												<input
													className={
														"mt-2 h-10 w-full rounded-xl border border-gray-200 px-3 text-xs transition-colors placeholder:text-gray-500 focus:border-gray-300 focus:outline-none focus:ring-0 focus:ring-offset-0 disabled:pointer-events-none disabled:bg-gray-50"
													}
													id="period"
													{...register("period", {
														required: "وارد کردن این بخش الزامیست",
													})}
												/>
												<FieldError error={errors["period"]} />
											</div>

											<div className="col-span-3">
												<label htmlFor="salaryType">نوع حق السعی</label>
												<input
													disabled={true}
													className={
														"mt-2 h-10 w-full rounded-xl border border-gray-200 px-3 text-xs transition-colors placeholder:text-gray-500 focus:border-gray-300 focus:outline-none focus:ring-0 focus:ring-offset-0 disabled:pointer-events-none disabled:bg-gray-50"
													}
													id="salaryType"
													{...register("salaryType", {
														required: "وارد کردن این بخش الزامیست",
													})}
												/>
												<FieldError error={errors["salaryType"]} />
											</div>

											<div className="col-span-3">
												<label htmlFor="salaryAmount">
													مقدار حق السعی روزانه(ریال)
												</label>
												<input
													className={
														"mt-2 h-10 w-full rounded-xl border border-gray-200 px-3 text-xs transition-colors placeholder:text-gray-500 focus:border-gray-300 focus:outline-none focus:ring-0 focus:ring-offset-0 disabled:pointer-events-none disabled:bg-gray-50"
													}
													id="salaryAmount"
													{...register("salaryAmount", {
														required: "وارد کردن این بخش الزامیست",
													})}
												/>
												<FieldError error={errors["salaryAmount"]} />
											</div>

											<div className="col-span-3">
												<label htmlFor="contractNo">شماره قرارداد</label>
												<input
													className={
														"mt-2 h-10 w-full rounded-xl border border-gray-200 px-3 text-xs transition-colors placeholder:text-gray-500 focus:border-gray-300 focus:outline-none focus:ring-0 focus:ring-offset-0 disabled:pointer-events-none disabled:bg-gray-50"
													}
													id="contractNo"
													{...register("contractNo", {
														required: "وارد کردن این بخش الزامیست",
													})}
												/>
												<FieldError error={errors["contractNo"]} />
											</div>
											<div className="col-span-3">
												<label htmlFor="workplace">محل انجام</label>
												<Input
													className="mt-2"
													id="workplace"
													{...register("workplace", {
														required: "وارد کردن این بخش الزامیست",
													})}
												/>
												<FieldError error={errors["workplace"]} />
											</div>
											<div className="col-span-3">
												<label htmlFor="bankAccountNumber">
													شماره حساب بانکی
												</label>
												<Input
													className="mt-2"
													id="bankAccountNumber"
													{...register("bankAccountNumber", {
														required: "وارد کردن این بخش الزامیست",
														pattern: {
															value: /^\d+([\/.-]\d+)*$/,
															message: "فرمت شماره حساب بانکی صحیح نیست",
														},
													})}
												/>
												<FieldError error={errors["bankAccountNumber"]} />
											</div>
											<div className="col-span-3">
												<label htmlFor="bankName">نام بانک</label>
												<Input
													className="mt-2"
													id="bankName"
													{...register("bankName", {
														required: "وارد کردن این بخش الزامیست",
													})}
												/>
												<FieldError error={errors["bankName"]} />
											</div>
											<div className="col-span-3">
												<label htmlFor="bankBranch">شعبه بانک</label>
												<Input
													className="mt-2"
													id="bankBranch"
													{...register("bankBranch")}
												/>
												<FieldError error={errors["bankBranch"]} />
											</div>

											<div className="col-span-3">
												<label htmlFor="damages">مبلغ سفته</label>
												<Input
													className="mt-2"
													id="damages"
													{...register("damages")}
												/>
												<FieldError error={errors["damages"]} />
											</div>

											<div className="col-span-3 col-start-1 mt-5">
												<Button
													disabled={isSubmitting || isSubmitSuccessful}
													variant="primary"
												>
													<span>ثبت اطلاعات</span>
													{isSubmitting && <Loading intent="white" size="sm" />}
												</Button>
											</div>
										</>
									)}
								</div>
							</form>
						</FormProvider>
					)}
				</>
			)}
		</>
	);
}

export function getDatesIngregorian(date: string): string {
	return moment(date, "YYYY-MM-DD").locale("fa").format("jYYYY/jMM/jDD");
}
