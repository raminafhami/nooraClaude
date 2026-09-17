"use client";

import dynamic from "next/dynamic";
import { useFormContext } from "react-hook-form";
import { z } from "zod";

import {
	FormControl,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Currency, currency as currencies } from "@/enums/Currency";
import { useTaskContext } from "@/felo/tasks/hooks/useTaskContext";
import { TaskDetailsReturn } from "@/felo/tasks/models/TaskDetails";
import { getUserFullname } from "@/identity/users/utils/getUserFullname";
import { toCurrency } from "@/utils/String";

import { Ids } from "../../data";
import { PaymentPriority } from "../../data/PaymentPriority";
import { ProcessType } from "../../enums/ProcessType";
import { useIsFromOutside } from "../../hooks/useIsFromOutside";
import { usePettyCosts } from "../../hooks/usePettyCosts";

const PettyCostList = dynamic(() => import("../../components/PettyCostList"));

const InspectionCostList = dynamic(
	() => import("../../components/InspectionCostList"),
);

const schema = z.object({});

type FormSchema = z.infer<typeof schema>;

const PhasePage = () => {
	const { task, hooks } = useTaskContext();

	const {
		[Ids.processType]: processType,
		[Ids.pettyCostIds]: pettyCostIds,
		[Ids.costsIds]: inspectionCostIds,
		[Ids.currency]: currency,
	} = task.data;

	const {} = useFormContext<FormSchema>();

	const { pettyCosts, pettyCostType, isLoadingPettyCosts } = usePettyCosts({
		pettyCostIds,
	});

	const isFromOutside = useIsFromOutside({ processType, pettyCostType });

	return (
		<div className="grid grid-cols-12 gap-x-4 gap-y-6 md:gap-x-10">
			<FormItem className="col-span-full !col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
				<FormLabel>عنوان</FormLabel>
				<FormControl>
					<Input disabled value={task.data[Ids.title]} />
				</FormControl>
			</FormItem>

			<FormItem className="col-span-full !col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
				<FormLabel>تاریخ پرداخت</FormLabel>
				<FormControl>
					<Input
						className="rtl:text-right"
						disabled
						dir="ltr"
						value={task.data[Ids.paymentDate]}
					/>
				</FormControl>
			</FormItem>

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

			{task.data[Ids.reviewDes] && (
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

			<FormItem className="col-span-full col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
				<FormLabel>توضیحات مالی</FormLabel>
				<FormControl>
					<Textarea
						className="h-40 resize-none"
						disabled
						value={task.data[Ids.payDes] || "-"}
					/>
				</FormControl>
				<FormMessage />
			</FormItem>

			<Separator className="col-span-full h-1" />

			{!!pettyCostIds && (
				<PettyCostList
					pettyCostIds={pettyCostIds}
					pettyCosts={pettyCosts}
					loading={isLoadingPettyCosts}
					isFromOutside={isFromOutside}
				/>
			)}

			{!!inspectionCostIds && <InspectionCostList />}

			<FormItem className="col-span-full !col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
				<FormLabel>مبلغ</FormLabel>
				<FormControl>
					<Input
						disabled
						value={`${toCurrency(task.data[Ids.amount])} ${currencies[task.data[Ids.currency] as Currency]?.title}`}
					/>
				</FormControl>
			</FormItem>

			{processType === ProcessType.Beneficiary &&
				currency !== Currency.Rial && (
					<FormItem className="col-span-full col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
						<FormLabel>نرخ ارز</FormLabel>
						<FormControl>
							<Input disabled value={toCurrency(task.data[Ids.currencyRate])} />
						</FormControl>
					</FormItem>
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

			<FormItem className="col-span-full col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
				<FormLabel>کد / شناسه ملی</FormLabel>
				<FormControl>
					<Input
						className="rtl:text-right"
						dir="ltr"
						disabled
						value={task.data[Ids.nationalCode] || "-"}
					/>
				</FormControl>
			</FormItem>

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
		</div>
	);
};

const PhaseEntry: TaskDetailsReturn<FormData> = {
	schema,
	render: <PhasePage />,
};

export default PhaseEntry;
