"use client";

import dynamic from "next/dynamic";
import { isShebaValid, verifyCardNumber } from "persian-tools";
import { useCallback, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { FaList } from "react-icons/fa6";
import { z } from "zod";

import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import { Checkbox } from "@/components/ui/checkbox";
import { DateInput } from "@/components/ui/date-input";
import { useDialogs } from "@/components/ui/dialog/use-dialogs";
import {
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
import { Textarea } from "@/components/ui/textarea";
import { Currency, currency as currencies } from "@/enums/Currency";
import { setStageOfInstance } from "@/felo/instances/services/setStageOfInstance";
import { useTaskContext } from "@/felo/tasks/hooks/useTaskContext";
import { useTaskStatus } from "@/felo/tasks/hooks/useTaskStatus";
import { Task } from "@/felo/tasks/models/Task";
import { TaskDetailsReturn } from "@/felo/tasks/models/TaskDetails";
import { cancelCostsPayment } from "@/financial/costs/services/cancelCostsPayment";
import { PettyCostStatus } from "@/financial/petty-cost/enums/PettyCostStatus";
import { PettyCostType } from "@/financial/petty-cost/enums/PettyCostType";
import { PettyCostApi } from "@/financial/petty-cost/models/PettyCost";
import { deleteUnofficialPettyCosts } from "@/financial/petty-cost/services/deleteUnofficialPettyCosts";
import { getPettyCost } from "@/financial/petty-cost/services/getPettyCosts";
import { updatePettyCostStatus } from "@/financial/petty-cost/services/updatePettyCostStatus";
import { messages } from "@/messages";
import { toCurrency } from "@/utils/String";
import { verifyNationalOrLegalCode } from "@/utils/verifyNationalOrLegalCode";

import { Ids } from "../../data";
import { PaymentPriority } from "../../data/PaymentPriority";
import { ProcessType } from "../../enums/ProcessType";
import { useIsFromOutside } from "../../hooks/useIsFromOutside";
import { usePettyCosts } from "../../hooks/usePettyCosts";
import { UserInformation } from "../../models/UserInformation";
import { pickUserInformation } from "../../utils/pickUserInformation";
import { UserSelect } from "./UserSelect";

const PettyCostList = dynamic(() => import("./PettyCostList"));

const InspectionCostList = dynamic(
	() => import("../../components/InspectionCostList"),
);

const UserBankInfoSelectDialog = dynamic(
	() => import("@/identity/users/components/UserBankInfoSelectDialog"),
);

const schema = z.object({
	[Ids.userData]: z.string(),
	[Ids.isCancel]: z.string(),
	[Ids.processType]: z.custom<ProcessType>(),
	[Ids.title]: z.string(),
	[Ids.paymentDate]: z.string(),
	[Ids.priority]: z.string(),
	[Ids.amount]: z.string(),
	[Ids.currency]: z.custom<Currency>(),
	[Ids.cashPay]: z.string(),
	[Ids.inputType]: z.string(),
	[Ids.userInformation]: z.custom<UserInformation>().optional(),
	[Ids.nationalCode]: z.string(),
	[Ids.bankAccountsOwner]: z.string(),
	[Ids.bankAccountNumber]: z.string().optional(),
	[Ids.bankCardNumber]: z.string().optional(),
	[Ids.bankSheba]: z.string().optional(),
	[Ids.description]: z.string(),

	[Ids.pettyCostIds]: z.array(z.string()).optional(),
	[Ids.costsIds]: z.array(z.string()).optional(),
});

type FormSchema = z.infer<typeof schema>;

const PhasePage = () => {
	const dialog = useDialogs();

	const { identity } = useLoggedInUser();

	const { task, hooks, dispatch } = useTaskContext();

	useEffect(() => {
		dispatch({ type: "update", options: { saveBtn: true } });
	}, [dispatch]);

	const { control, setValue, watch } = useFormContext<FormSchema>();

	const {
		[Ids.isCancel]: isCancel,
		[Ids.processType]: processType,
		[Ids.pettyCostIds]: pettyCostIds,
		[Ids.costsIds]: inspectionCostIds,
		[Ids.amount]: amount,
		[Ids.currency]: currency,
		[Ids.cashPay]: isCash,
		[Ids.userInformation]: userInfo,
	} = watch();

	if (typeof processType === "undefined") {
		setValue(Ids.processType, ProcessType.PettyCash);

		if (!pettyCostIds) {
			setValue(Ids.pettyCostIds, []);
		}
	}

	if (typeof isCancel === "undefined") {
		setValue(Ids.isCancel, "false");
	}

	useEffect(() => {
		setValue(Ids.userData, identity.fullname);
	}, [identity, setValue]);

	const { isPositiveOrNeutral, isNegative } = useTaskStatus(Ids.isCancel, {
		isPositive: (status) => status === "false",
		isNegative: (status) => status === "true",
	});

	const { pettyCosts, pettyCostType, isLoadingPettyCosts } = usePettyCosts({
		pettyCostIds,
	});

	const isFromOutside = useIsFromOutside({ processType, pettyCostType });

	useEffect(() => {
		hooks.registerHook(
			"pre-submit",
			async ({ task, data }: { task: Task; data: FormSchema }) => {
				let pettyCosts: PettyCostApi[] | undefined;
				let pettyCostType: PettyCostType | undefined;

				if (data[Ids.pettyCostIds]) {
					if (!data[Ids.pettyCostIds]!.length) {
						data[Ids.amount] = "0";
						data[Ids.currency] = "" as Currency;
					} else {
						pettyCosts = await getPettyCost({
							filters: { _id: data[Ids.pettyCostIds]! },
						});

						pettyCostType = pettyCosts.at(0)?.type as PettyCostType;

						if (data[Ids.pettyCostIds]!.length !== pettyCosts.length) {
							data[Ids.pettyCostIds] = data[Ids.pettyCostIds]!.filter((x) =>
								pettyCosts!.some((y) => y.id === x),
							);
						}

						data[Ids.amount] = pettyCosts
							.reduce<number>((acc, curr) => acc + curr.amount, 0)
							.toString();
						data[Ids.currency] = pettyCosts[0].currency;
					}
				}

				if (!data[Ids.cashPay] || data[Ids.cashPay] === "true") {
					data[Ids.bankAccountsOwner] = "";
					data[Ids.bankAccountNumber] = "";
					data[Ids.bankCardNumber] = "";
					data[Ids.bankSheba] = "";
				}

				data[Ids.inputType] = data[Ids.userInformation]?.id
					? "official"
					: "personal";

				if (typeof data.IsCancel === "undefined" || data.IsCancel === "false") {
					if (
						data[Ids.processType] === ProcessType.PettyCash &&
						!pettyCosts?.length
					) {
						throw new Error("افزودن حداقل یک مورد هزینه الزامی است.");
					}

					if (
						data[Ids.cashPay] === "false" &&
						parseFloat(data[Ids.amount]) >= 50_000_000
					) {
						if (!data[Ids.bankSheba]) {
							throw new Error(
								"پر نمودن شماره شبا برای مبالغ بالاتر از 50,000,000 ریال الزامی است.",
							);
						}
					}

					if (
						data[Ids.cashPay] === "false" &&
						!data[Ids.bankCardNumber] &&
						!data[Ids.bankSheba]
					) {
						throw new Error(
							"وارد نمودن حداقل یکی از فیلدهای شماره کارت و یا شماره شبا الزامی است.",
						);
					}

					if (data[Ids.pettyCostIds] && pettyCosts) {
						const existsNoAttachmentCost = pettyCosts.some(
							(cost) => !cost.files.length,
						);

						if (existsNoAttachmentCost) {
							throw new Error(
								"افزودن حداقل یک پیوست برای هر یک از هزینه ها الزامی است.",
							);
						}

						await updatePettyCostStatus(
							PettyCostStatus.Pending,
							data[Ids.pettyCostIds]!,
						);
					}
				} else if (data.IsCancel === "true") {
					if (data[Ids.processType] === ProcessType.PettyCash) {
						if (data[Ids.pettyCostIds] && pettyCosts) {
							await updatePettyCostStatus(
								PettyCostStatus.Unpaid,
								data[Ids.pettyCostIds]!,
							);

							if (pettyCostType === PettyCostType.Unofficial) {
								await deleteUnofficialPettyCosts(data[Ids.pettyCostIds]!);
							}
						}
					} else if (data[Ids.processType] === ProcessType.Beneficiary) {
						await cancelCostsPayment({
							instanceId: task.instanceId,
						});
					}
				}
			},
		);

		hooks.registerHook("submit", async ({ task, data }) => {
			if (data.IsCancel === "true") {
				setStageOfInstance(task.instanceId, "paymentOrder-cancel");
			} else {
				const isReview =
					data[Ids.currency] !== Currency.Rial ||
					data[Ids.amount] >= 30_000_000 ||
					data[Ids.processType] === ProcessType.Beneficiary;

				if (isReview) {
					setStageOfInstance(task.instanceId, "paymentOrder-review");
				} else {
					setStageOfInstance(task.instanceId, "paymentOrder-pay");
				}
			}
		});

		return () => hooks.removeAll();
	}, [hooks]);

	const handleUserBankInfoSelectDialog = useCallback(async () => {
		const result = await dialog.open(UserBankInfoSelectDialog, {
			userId: userInfo!.id,
		});

		if (result) {
			setValue("BankAccountsOwner", result.bankAccountOwner ?? "");
			setValue("BankCardNumber", result.bankCardNumber ?? "");
			setValue("Sheba", result.bankSheba ?? "");
		}
	}, [dialog, userInfo, setValue]);

	return (
		<div className="grid grid-cols-12 gap-x-4 gap-y-6 md:gap-x-10">
			<FormField
				control={control}
				name={Ids.isCancel}
				render={({ field: { value, onChange, ...field } }) => (
					<FormItem className="col-span-full col-start-1">
						<FormLabel className="flex gap-2">
							<FormControl>
								<Checkbox
									checked={value === "true"}
									onCheckedChange={(value) =>
										onChange(value ? "true" : "false")
									}
									{...field}
								/>
							</FormControl>
							<span>لغو درخواست</span>
						</FormLabel>
						<FormMessage />
					</FormItem>
				)}
			/>

			<Separator className="col-span-full h-1" />

			<FormField
				control={control}
				name={Ids.title}
				render={({ field: { disabled, ...field } }) => (
					<FormItem className="col-span-full col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
						<FormLabel>
							عنوان
							{isPositiveOrNeutral && <span className="text-red-600"> *</span>}
						</FormLabel>
						<FormControl>
							<Input disabled={disabled || isFromOutside} {...field} />
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
				rules={{
					required: isPositiveOrNeutral && messages.validation.required,
				}}
			/>

			<FormField
				control={control}
				name={Ids.paymentDate}
				render={({ field }) => (
					<FormItem className="col-span-full !col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
						<FormLabel>
							تاریخ پرداخت
							{isPositiveOrNeutral && <span className="text-red-600"> *</span>}
						</FormLabel>
						<FormControl>
							<DateInput {...field} />
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
				rules={{
					required: isPositiveOrNeutral && messages.validation.required,
				}}
			/>

			<FormField
				control={control}
				name={Ids.priority}
				render={({ field: { ref, onChange, ...field } }) => (
					<FormItem className="col-span-full !col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
						<FormLabel>
							اولویت پرداخت
							{isPositiveOrNeutral && <span className="text-red-600"> *</span>}
						</FormLabel>
						<FormControl>
							<Select onValueChange={onChange} {...field}>
								<SelectTrigger ref={ref}>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{PaymentPriority.map((priority) => (
										<SelectItem key={priority.value} value={priority.value}>
											{priority.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
				rules={{
					required: isPositiveOrNeutral && messages.validation.required,
				}}
			/>

			{(typeof task.data[Ids.reviewDes] !== "undefined" ||
				typeof task.data[Ids.payDes] !== "undefined") && (
				<>
					<Separator className="col-span-full h-1" />

					{typeof task.data[Ids.reviewDes] !== "undefined" && (
						<FormItem className="col-span-full col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
							<FormLabel>توضیحات مدیر</FormLabel>
							<FormControl>
								<Textarea
									className="h-40 resize-none"
									disabled
									readOnly
									value={task.data[Ids.reviewDes] || "-"}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}

					{typeof task.data[Ids.payDes] !== "undefined" && (
						<FormItem className="col-span-full col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
							<FormLabel>توضیحات مالی</FormLabel>
							<FormControl>
								<Textarea
									className="h-40 resize-none"
									disabled
									readOnly
									value={task.data[Ids.payDes] || "-"}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				</>
			)}

			<Separator className="col-span-full h-1" />

			{!!pettyCostIds && (
				<PettyCostList
					pettyCostIds={pettyCostIds}
					pettyCosts={pettyCosts}
					loading={isLoadingPettyCosts}
					currency={currency}
					isFromOutside={isFromOutside}
				/>
			)}

			{!!inspectionCostIds && <InspectionCostList />}

			<FormItem className="col-span-full !col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
				<FormLabel>مبلغ</FormLabel>
				<FormControl>
					<Input
						disabled
						value={
							amount && currency
								? `${toCurrency(amount)} ${currencies[currency]?.title}`
								: ""
						}
					/>
				</FormControl>
			</FormItem>

			<Separator className="col-span-full h-1" />

			<FormField
				control={control}
				name={Ids.cashPay}
				render={({ field: { ref, onChange, ...field } }) => (
					<FormItem className="col-span-full col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
						<FormLabel>
							نحوه پرداخت
							{isPositiveOrNeutral && <span className="text-red-600"> *</span>}
						</FormLabel>
						<FormControl>
							<Select onValueChange={onChange} {...field}>
								<SelectTrigger ref={ref}>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{[
										{ value: "true", label: "نقدی" },
										{ value: "false", label: "واریز بانکی" },
									].map((type) => (
										<SelectItem key={type.value} value={type.value}>
											{type.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
				rules={{
					required: isPositiveOrNeutral && messages.validation.required,
				}}
			/>

			<FormField
				control={control}
				name={Ids.userInformation}
				render={({ field: { onChange, ...field } }) => (
					<FormItem className="col-span-full col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
						<FormLabel>کاربر</FormLabel>
						<FormControl>
							<UserSelect
								onValueChange={(value) => {
									onChange(value ? pickUserInformation(value) : value);

									setValue(Ids.nationalCode, value?.nationalCode ?? "");
								}}
								{...field}
							/>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>

			<FormField
				key={userInfo?.id}
				control={control}
				name={Ids.nationalCode}
				render={({ field: { ref, onChange, ...field } }) => (
					<FormItem className="col-span-full col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
						<FormLabel>
							کد / شناسه ملی
							{isPositiveOrNeutral &&
								currency === Currency.Rial &&
								(parseFloat(amount) || 0) >= 20_000_000 && (
									<span className="text-red-600"> *</span>
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
				rules={{
					required:
						isPositiveOrNeutral &&
						currency === Currency.Rial &&
						(parseFloat(amount) || 0) >= 20_000_000 &&
						messages.validation.required,
					validate: (value) => {
						if (value && !verifyNationalOrLegalCode(value)) {
							return "کد / شناسه ملی وارد شده نامعتبر است.";
						}
					},
				}}
			/>

			{isCash === "false" && (
				<>
					<FormField
						control={control}
						name={Ids.bankAccountsOwner}
						render={({ field }) => (
							<FormItem className="col-span-full col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3 xl:col-start-1">
								<FormLabel className="flex items-center justify-between gap-3">
									<div>
										نام صاحب حساب<span className="text-red-600"> *</span>
									</div>

									{userInfo?.id && (
										<button
											className="me-2 flex items-center gap-1.5"
											type="button"
											onClick={handleUserBankInfoSelectDialog}
										>
											<FaList />
											<span>حساب های کاربر</span>
										</button>
									)}
								</FormLabel>
								<FormControl>
									<Input {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
						rules={{
							required:
								isCash === "false" &&
								isPositiveOrNeutral &&
								messages.validation.required,
						}}
					/>

					<FormField
						control={control}
						name={Ids.bankCardNumber}
						render={({ field }) => (
							<FormItem className="col-span-full col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
								<FormLabel>شماره کارت</FormLabel>
								<FormControl>
									<Input maxLength={16} {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
						rules={{
							validate: (value) => {
								if (
									value &&
									isPositiveOrNeutral &&
									!verifyCardNumber(value as any)
								) {
									return "شماره کارت وارد شده نامعتبر است.";
								}
							},
						}}
					/>

					<FormField
						control={control}
						name={Ids.bankSheba}
						render={({ field }) => (
							<FormItem className="col-span-full col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
								<FormLabel>
									شماره شبا
									{(parseFloat(amount) || 0) >= 50_000_000 &&
										isPositiveOrNeutral && (
											<span className="text-red-600"> *</span>
										)}
								</FormLabel>
								<FormControl>
									<Input maxLength={26} {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
						rules={{
							required:
								isCash === "false" &&
								(parseFloat(amount) || 0) >= 50_000_000 &&
								isPositiveOrNeutral &&
								messages.validation.required,
							validate: (value) => {
								if (
									value &&
									isPositiveOrNeutral &&
									(value.length !== 26 || !isShebaValid(value))
								) {
									return "شماره شبا وارد شده نامعتبر است.";
								}
							},
						}}
					/>
				</>
			)}

			<Separator className="col-span-full h-1" />

			<FormField
				control={control}
				name={Ids.description}
				render={({ field: { disabled, ...field } }) => (
					<FormItem className="col-span-full">
						<FormLabel>توضیحات</FormLabel>
						<FormControl>
							<Textarea
								className="h-40"
								disabled={disabled || isFromOutside}
								{...field}
							/>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
				rules={{
					required: isNegative && messages.validation.required,
				}}
			/>
		</div>
	);
};

const PhaseEntry: TaskDetailsReturn<FormData> = {
	schema,
	render: <PhasePage />,
};

export default PhaseEntry;
