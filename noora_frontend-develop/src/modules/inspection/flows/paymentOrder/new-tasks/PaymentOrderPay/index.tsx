"use client";

import moment from "jalali-moment";
import dynamic from "next/dynamic";
import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { z } from "zod";

import updateInspectionCostsMany from "@/api/payment-order/updateInspectionCostsMany";
import { isApiResponse } from "@/api/utils/isApiResponse";
import { DateInput } from "@/components/ui/date-input";
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
import { updateCostsPaymentVouchers } from "@/financial/costs/services/updateCostsPaymentVouchers";
import { PettyCostStatus } from "@/financial/petty-cost/enums/PettyCostStatus";
import { updatePettyCostStatus } from "@/financial/petty-cost/services/updatePettyCostStatus";
import { updateUnofficialPettyCostsSpentDate } from "@/financial/petty-cost/services/updateUnofficialPettyCostsSpentDate";
import { getUserFullname } from "@/identity/users/utils/getUserFullname";
import { messages } from "@/messages";
import { zeroDateTimeString } from "@/utils/date/zeroDateTimeString";
import { toCurrency } from "@/utils/String";
import { verifyNationalOrLegalCode } from "@/utils/verifyNationalOrLegalCode";

import { Ids } from "../../data";
import { PaymentPriority } from "../../data/PaymentPriority";
import { ProcessType } from "../../enums/ProcessType";
import { useIsFromOutside } from "../../hooks/useIsFromOutside";
import { usePettyCosts } from "../../hooks/usePettyCosts";
import { ReviewStatus, reviewStatusOptions } from "./ReviewStatus";

const PettyCostList = dynamic(() => import("./PettyCostList"));

const InspectionCostList = dynamic(
	() => import("../../components/InspectionCostList"),
);

const schema = z.object({
	[Ids.paymentDate]: z.string(),
	[Ids.priority]: z.string(),
	[Ids.currencyRate]: z.string(),
	[Ids.nationalCode]: z.string(),
	[Ids.expertState]: z.custom<ReviewStatus>(),
	[Ids.payDes]: z.string(),

	// TODO: deprecated paying in parts
	[Ids.remainingAmount]: z.string().optional(),
	[Ids.paidAmount]: z.custom<any>().optional(),
});

type FormSchema = z.infer<typeof schema>;

const PhasePage = () => {
	const { task, hooks } = useTaskContext();

	const {
		[Ids.processType]: processType,
		[Ids.pettyCostIds]: pettyCostIds,
		[Ids.costsIds]: inspectionCostIds,
		[Ids.currency]: currency,
	} = task.data;

	const { control } = useFormContext<FormSchema>();

	const { isPositiveOrNeutral, isNegative } = useTaskStatus<ReviewStatus>(
		Ids.expertState,
		{
			isPositive: (status) => status === ReviewStatus.Forward,
			isNegative: (status) =>
				[ReviewStatus.ReturnManager, ReviewStatus.ReturnCreator].includes(
					status,
				),
		},
	);

	const { pettyCosts, pettyCostType, isLoadingPettyCosts, fetchPettyCosts } =
		usePettyCosts({
			pettyCostIds,
		});

	const isFromOutside = useIsFromOutside({ processType, pettyCostType });

	useEffect(() => {
		hooks.registerHook(
			"pre-submit",
			async ({ task, data }: { task: Task; data: FormSchema }) => {
				if (data[Ids.expertState] === ReviewStatus.Forward) {
					data[Ids.remainingAmount] = "0";
					data[Ids.paidAmount] = [
						{
							value: task.data[Ids.amount],
							currency: task.data[Ids.currency],
							rate: "1",
							isDocument: true,
						},
					];

					if (
						task.data[Ids.processType] === ProcessType.PettyCash &&
						task.data[Ids.pettyCostIds]
					) {
						if (!isFromOutside) {
							await updateUnofficialPettyCostsSpentDate({
								costIds: task.data[Ids.pettyCostIds],
								spentDate: zeroDateTimeString(
									moment(data[Ids.paymentDate], "jYYYY/jMM/jDD"),
								),
							});
						}

						try {
							await updatePettyCostStatus(
								PettyCostStatus.Paid,
								task.data[Ids.pettyCostIds]!,
							);
						} catch (err: any) {
							let errorMessage: string | undefined;
							if (isApiResponse(err)) {
								if (
									err.message ===
									"Category budget not found. Please ensure that all costs have both a categoryId and a spentDate."
								) {
									errorMessage =
										"برای مراکز بودجه انتخاب شده، بودجه ای تخصیص داده نشده است.";
								}
							}

							if (errorMessage) {
								console.error(err);
								throw new Error(errorMessage);
							}

							throw err;
						}
					} else if (
						task.data[Ids.processType] === ProcessType.Beneficiary &&
						task.data[Ids.costsIds]
					) {
						const paymentDate = moment(
							task.data[Ids.paymentDate],
							"jYYYY/jMM/jDD",
						).format("YYYY-MM-DD");

						await updateCostsPaymentVouchers(
							task.data[Ids.costsIds].map((costId: string) => {
								return {
									id: costId,
									vouchers: [{ voucherNo: 0, date: paymentDate }],
								};
							}),
						);

						if (task.data[Ids.currency] === Currency.Rial) {
							data[Ids.currencyRate] = "1";
						}

						if (task.data[Ids.currency] !== Currency.Rial) {
							await updateInspectionCostsMany({
								currency: task.data[Ids.currency],
								currencyRate: parseInt(data[Ids.currencyRate]),
								inspectionCostIds: task.data[Ids.costsIds],
							});
						}
					}
				} else if (
					[ReviewStatus.ReturnCreator, ReviewStatus.ReturnManager].includes(
						data[Ids.expertState],
					)
				) {
					data[Ids.remainingAmount] = task.data[Ids.amount];
					data[Ids.paidAmount] = [];
				}
			},
		);

		hooks.registerHook("submit", async ({ task, data }) => {
			if (data[Ids.state] === ReviewStatus.Forward) {
				setStageOfInstance(task.instanceId, "paymentOrder-paid");
			} else if (data[Ids.state] === ReviewStatus.ReturnCreator) {
				setStageOfInstance(task.instanceId, "paymentOrder-request");
			} else if (data[Ids.state] === ReviewStatus.ReturnManager) {
				setStageOfInstance(task.instanceId, "paymentOrder-review");
			}
		});

		return () => hooks.removeAll();
	}, [hooks, isFromOutside]);

	return (
		<div className="grid grid-cols-12 gap-x-4 gap-y-6 md:gap-x-10">
			<FormItem className="col-span-full !col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
				<FormLabel>درخواست دهنده</FormLabel>
				<FormControl>
					<Input disabled value={task.data[Ids.userData]} />
				</FormControl>
			</FormItem>

			<Separator className="col-span-full h-1" />

			<FormItem className="col-span-full col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
				<FormLabel>عنوان</FormLabel>
				<FormControl>
					<Input disabled value={task.data[Ids.title]} />
				</FormControl>
			</FormItem>

			<FormField
				control={control}
				name={Ids.paymentDate}
				render={({ field }) => (
					<FormItem className="col-span-full !col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
						<FormLabel>
							تاریخ پرداخت<span className="text-red-600"> *</span>
						</FormLabel>
						<FormControl>
							<DateInput minDate={new Date()} {...field} />
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
				rules={{
					required: messages.validation.required,
				}}
			/>

			<FormItem className="col-span-full !col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
				<FormLabel>اولویت پرداخت</FormLabel>
				<FormControl>
					<Input
						disabled
						value={
							PaymentPriority.find((x) => x.value === task.data[Ids.priority])
								?.label
						}
					/>
				</FormControl>
			</FormItem>

			<Separator className="col-span-full h-1" />

			<FormItem className="col-span-full !col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
				<FormLabel>توضیحات درخواست دهنده</FormLabel>
				<FormControl>
					<Textarea
						className="h-40 resize-none"
						disabled
						value={task.data[Ids.description] || "-"}
					/>
				</FormControl>
			</FormItem>

			{typeof task.data[Ids.reviewDes] !== "undefined" && (
				<FormItem className="col-span-full col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
					<FormLabel>توضیحات مدیر</FormLabel>
					<FormControl>
						<Textarea
							className="h-40 resize-none"
							disabled
							value={task.data[Ids.reviewDes] || "-"}
						/>
					</FormControl>
					<FormMessage />
				</FormItem>
			)}

			<Separator className="col-span-full h-1" />

			{!!pettyCostIds && (
				<PettyCostList
					pettyCostIds={pettyCostIds}
					pettyCosts={pettyCosts}
					loading={isLoadingPettyCosts}
					isFromOutside={isFromOutside}
					onChange={fetchPettyCosts}
				/>
			)}

			{!!inspectionCostIds && <InspectionCostList />}

			<FormItem className="col-span-full !col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
				<FormLabel>مبلغ</FormLabel>
				<FormControl>
					<Input
						disabled
						value={`${toCurrency(task.data[Ids.amount])} ${currencies[task.data[Ids.currency] as Currency].title}`}
					/>
				</FormControl>
			</FormItem>

			{processType === ProcessType.Beneficiary &&
				currency !== Currency.Rial && (
					<FormField
						control={control}
						name={Ids.currencyRate}
						render={({ field: { ref, onChange, ...field } }) => (
							<FormItem className="col-span-full col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
								<FormLabel>
									نرخ ارز
									{isPositiveOrNeutral && (
										<span className="text-red-600"> *</span>
									)}
								</FormLabel>
								<FormControl>
									<MaskInput
										className="tracking-wider rtl:text-right"
										dir="ltr"
										inputRef={ref}
										mask={Number}
										scale={0}
										thousandsSeparator=","
										unmask
										onAccept={(value) => onChange(value)}
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
						rules={{
							required: isPositiveOrNeutral && messages.validation.required,
						}}
					/>
				)}

			<Separator className="col-span-full h-1" />

			<FormItem className="col-span-full col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
				<FormLabel>نحوه پرداخت</FormLabel>
				<FormControl>
					<Input
						disabled
						value={task.data[Ids.cashPay] === "true" ? "نقدی" : "واریز بانکی"}
					/>
				</FormControl>
			</FormItem>

			{task.data[Ids.userInformation]?.id && (
				<FormItem className="col-span-full col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
					<FormLabel>کاربر</FormLabel>
					<FormControl>
						<Input
							disabled
							value={getUserFullname(task.data[Ids.userInformation]) || "-"}
						/>
					</FormControl>
				</FormItem>
			)}

			<FormField
				control={control}
				name={Ids.nationalCode}
				render={({ field: { ref, onChange, ...field } }) => (
					<FormItem className="col-span-full col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
						<FormLabel>کد / شناسه ملی</FormLabel>
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
					validate: (value) => {
						if (value && !verifyNationalOrLegalCode(value)) {
							return "کد / شناسه ملی وارد شده نامعتبر است.";
						}
					},
				}}
			/>

			{task.data[Ids.cashPay] === "false" && (
				<>
					<FormItem className="col-span-full col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3 xl:col-start-1">
						<FormLabel>نام صاحب حساب</FormLabel>
						<FormControl>
							<Input disabled value={task.data[Ids.bankAccountsOwner]} />
						</FormControl>
					</FormItem>

					<FormItem className="col-span-full col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
						<FormLabel>شماره کارت</FormLabel>
						<FormControl>
							<Input
								className="rtl:text-right"
								dir="ltr"
								disabled
								value={task.data[Ids.bankCardNumber] || "-"}
							/>
						</FormControl>
					</FormItem>

					<FormItem className="col-span-full col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
						<FormLabel>شماره شبا</FormLabel>
						<FormControl>
							<Input
								className="rtl:text-right"
								dir="ltr"
								disabled
								value={task.data[Ids.bankSheba] || "-"}
							/>
						</FormControl>
					</FormItem>
				</>
			)}

			<Separator className="col-span-full h-1" />

			<FormField
				control={control}
				name={Ids.expertState}
				render={({ field: { ref, onChange, ...field } }) => (
					<FormItem className="col-span-full !col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
						<FormLabel>
							وضعیت بررسی<span className="text-red-600"> *</span>
						</FormLabel>
						<FormControl>
							<Select onValueChange={onChange} {...field}>
								<SelectTrigger ref={ref}>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{reviewStatusOptions.map((item) => (
										<SelectItem key={item.value} value={item.value}>
											{item.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
				rules={{
					required: messages.validation.required,
				}}
			/>

			<FormField
				control={control}
				name={Ids.payDes}
				render={({ field }) => (
					<FormItem className="col-span-full">
						<FormLabel>
							توضیحات{isNegative && <span className="text-red-600"> *</span>}
						</FormLabel>
						<FormControl>
							<Textarea className="h-40" {...field} />
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
