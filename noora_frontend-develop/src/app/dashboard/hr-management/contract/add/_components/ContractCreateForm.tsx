"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { useDialogs } from "@/components/ui/dialog/use-dialogs";
import { DateInput } from "@/form/DateInput";
import { FieldError } from "@/form/FieldError";
import { Input } from "@/form/Input";
import { NumberInput } from "@/form/NumberInput";
import { PriceInput } from "@/form/PriceInput";
import { SelectDynamic } from "@/form/select";
import { ContractStatus } from "@/hrm/contract/enums/ContractStatus";
import { Personnel } from "@/hrm/personnel/models/Personnel";
import { PersonnelJob } from "@/hrm/personnel/models/PersonnelJob";
import { getPersonnel } from "@/hrm/personnel/services/getPersonnel";
import { messages } from "@/messages";
import { Loading } from "@/ui/Loader";
import { Seperator } from "@/ui/Seperator";

import { ContractPreview } from "./ContractPreview";

const UserBankInfoSelectDialog = dynamic(
	() => import("@/identity/users/components/UserBankInfoSelectDialog"),
);

type FormSchema = {
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
};

function ContractCreateForm() {
	const dialog = useDialogs();

	const [personnelLoading, setPersonnelLoading] = useState<boolean>(false);
	const [personnel, setPersonnel] = useState<Personnel[]>([]);
	const [selectedPersonnel, setSelectedPersonnel] = useState<
		Personnel | undefined
	>();

	const [showContractPreview, setShowContractPreview] = useState(false);

	const methods = useForm<FormSchema>({
		defaultValues: {
			jobs: [],
			salaryType: "ثابت",
			status: undefined,
		},
		mode: "onTouched",
	});

	const {
		formState: { errors, isSubmitting, isSubmitSuccessful },
		getValues,
		handleSubmit,
		register,
		setError,
		setValue,
		trigger,
		watch,
	} = methods;

	const { jobs } = watch();

	const getAllPersonnel = useCallback(async () => {
		setPersonnelLoading(true);
		const response = await getPersonnel({ populate: ["user", "jobs"] });
		setPersonnel(response);
		setPersonnelLoading(false);
	}, []);

	useEffect(() => {
		getAllPersonnel();
	}, [getAllPersonnel]);

	const handlePersonnelBankInfoSelectDialog = useCallback(async () => {
		const result = await dialog.open(UserBankInfoSelectDialog, {
			userId: selectedPersonnel!.userId,
		});

		if (result) {
			setValue("bankName", result.bankName);
			setValue("bankBranch", result.bankBranch ?? "");
			setValue("bankAccountNumber", result.bankAccountNumber ?? "");
		}
	}, [dialog, selectedPersonnel, setValue]);

	useEffect(() => {
		setValue(
			"jobs",
			selectedPersonnel
				? (selectedPersonnel.jobs as PersonnelJob[]).map((x) => ({
						id: x.id,
						name: x.name,
						goodsInspectionField: x.metadata?.goodsInspectionField,
					}))
				: [],
			{
				shouldDirty: true,
				shouldTouch: true,
				shouldValidate: true,
			},
		);
	}, [selectedPersonnel, setValue]);

	if (showContractPreview) {
		return (
			<ContractPreview
				contractDetails={getValues()}
				personnel={selectedPersonnel}
			/>
		);
	}

	if (personnelLoading) {
		return <div>درحال دریافت اطلاعات ...</div>;
	}

	return (
		<FormProvider {...methods}>
			<form
				onSubmit={handleSubmit(async (data) => {
					try {
						// Set contract details from the form
						setValue("contractNo", data.contractNo);
						setValue("signDate", data.startDate);
						setValue("jobs", data.jobs);
						setValue("startDate", data.startDate);
						setValue("endDate", data.endDate);
						setValue("period", +data.period);
						setValue("salaryType", "fixed");
						setValue("salaryAmount", +data.salaryAmount);
						setValue("status", ContractStatus.Draft);
						setValue("bankName", data.bankName);
						setValue("bankAccountNumber", data.bankAccountNumber);
						setValue("bankBranch", data.bankBranch);
						setValue("workplace", data.workplace);
						setValue("damages", data.damages);

						setShowContractPreview(true);
					} catch (err) {
						setError("root.server", {
							message: "Something went wrong...",
						});
					}
				})}
			>
				<div className="grid grid-cols-12 items-start justify-center gap-x-10 gap-y-6">
					<div className="relative col-span-3 col-start-1 flex flex-col">
						<div className="mb-2">جستجوی پرسنل</div>
						<SelectDynamic<Personnel>
							value={selectedPersonnel}
							onLabel={(x) => x.fullname}
							onMutate={(value) => {
								setSelectedPersonnel(value);
							}}
							onSearch={(v) => {
								return personnel.filter(
									(pers) =>
										pers.fullname.toLowerCase().includes(v.toLowerCase()) ||
										pers.lastname.toLowerCase().includes(v.toLowerCase()),
								);
							}}
						/>
					</div>

					{selectedPersonnel && (
						<>
							<div className="col-span-3">
								<label htmlFor="nationalCode">کدملی:</label>
								<Input
									className="mt-2 cursor-not-allowed"
									value={selectedPersonnel?.nationalCode}
									disabled={true}
								/>
							</div>

							<div className="col-span-3">
								<label htmlFor="phoneNo">شماره موبایل:</label>
								<Input
									className="mt-2 cursor-not-allowed"
									value={selectedPersonnel?.phoneNo}
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
									autoComplete={"off"}
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
								<div className="mb-2">تاریخ انعقاد تا</div>
								<DateInput
									id={"endDate"}
									autoComplete={"off"}
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
								<NumberInput
									className="mt-2"
									id="period"
									onMutate={(v) => {
										setValue("period", +v, {
											shouldDirty: true,
											shouldTouch: true,
											shouldValidate: true,
										});
									}}
									{...(({ ref, ...register }) => register)(
										register("period", {
											required: "وارد کردن این بخش الزامیست",
										}),
									)}
								/>
								<FieldError error={errors["period"]} />
							</div>

							<div className="col-span-3">
								<label htmlFor="salaryType">نوع حق السعی</label>
								<Input
									disabled={true}
									className="mt-2"
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
								<PriceInput
									className="mt-2"
									id="salaryAmount"
									onMutate={(v) => {
										setValue("salaryAmount", +v, {
											shouldDirty: true,
											shouldTouch: true,
											shouldValidate: true,
										});
									}}
									{...(({ ref, ...register }) => register)(
										register("salaryAmount", {
											required: "وارد کردن این بخش الزامیست",
										}),
									)}
								/>
								<FieldError error={errors["salaryAmount"]} />
							</div>

							<div className="col-span-3">
								<label htmlFor="contractNo">شماره قرارداد</label>
								<Input
									className="mt-2"
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

							<div className="col-span-full">
								<Seperator />
							</div>

							<div className="col-span-full">
								<Button
									type="button"
									variant="default"
									onClick={handlePersonnelBankInfoSelectDialog}
								>
									انتخاب از حساب های کاربر
								</Button>
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
								<label htmlFor="bankAccountNumber">شماره حساب بانکی</label>
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
								<label htmlFor="damages">مبلغ سفته</label>
								<Input className="mt-2" id="damages" {...register("damages")} />
								<FieldError error={errors["damages"]} />
							</div>

							<div className="col-span-3 col-start-1 mt-5">
								<Button
									className="min-w-[10rem]"
									disabled={isSubmitting || isSubmitSuccessful}
									variant="primary"
								>
									{isSubmitting ? (
										<Loading size="sm">در حال ارسال اطلاعات...</Loading>
									) : (
										"ثبت اطلاعات"
									)}
								</Button>
							</div>
						</>
					)}
				</div>
			</form>
		</FormProvider>
	);
}

export { ContractCreateForm };
