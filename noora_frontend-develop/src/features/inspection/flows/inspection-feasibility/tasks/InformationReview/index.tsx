"use client";

import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { FaWandMagicSparkles } from "react-icons/fa6";
import { toast } from "sonner";
import { z } from "zod";

import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import { Button } from "@/components/ui/button";
import {
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { MaskInput } from "@/components/ui/mask-input";
import { Numeric } from "@/components/ui/numeric";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { customs } from "@/data/customs";
import {
	Currency,
	currency as currencies,
	currencyOptions,
} from "@/enums/Currency";
import { addWatcherToInstance } from "@/felo/instances/services/addWatcherToInstance";
import { setStageOfInstance } from "@/felo/instances/services/setStageOfInstance";
import { useTaskContext } from "@/felo/tasks/hooks/useTaskContext";
import { useTaskStatus } from "@/felo/tasks/hooks/useTaskStatus";
import { Task } from "@/felo/tasks/models/Task";
import { getCurrencyRate } from "@/financial/currency-rate/services/getCurrencyRate";
import { getUserFullname } from "@/identity/users/utils/getUserFullname";
import PreviousTaskReferrer from "@/inspection/flows/_module/referrer/PreviousTaskReferrer";
import { PreviousTask } from "@/inspection/models/PreviousTask";
import {
	ReviewStatus,
	reviewStatusOptions,
} from "@/inspection/models/ReviewStatus";
import {
	InspectionMethod,
	inspectionMethods,
} from "@/inspection/shared/enums/InspectionMethod";
import {
	InspectionRiskLevel,
	inspectionRiskLevelOptions,
} from "@/inspection/shared/enums/InspectionRiskLevel";
import { messages } from "@/messages";
import { toCurrency } from "@/utils/String";

import { CustomsTariffNosList } from "../../components/CustomsTariffNosList";
import {
	proformaValueCurrencies,
	ProformaValueCurrency,
} from "../../enums/ProformaValueCurrency";
import {
	Assignees,
	assigneesTemplate,
	AssigneeType,
} from "../../models/Assignee";
import { ids } from "../../models/Ids";

const schema = z.object({
	[ids.previousTask]: z.custom<PreviousTask>(),
	[ids.assignees]: z.custom<Assignees>(),
	[ids.informationReviewStatus]: z.custom<ReviewStatus>(),
	[ids.informationReviewNote]: z.string(),
	[ids.inspectionFee]: z.string(),
	[ids.inspectionFeeCurrency]: z.custom<Currency>(),
	[ids.inspectionFeeCurrencyRate]: z.string(),
	[ids.inspectionFeeInRial]: z.string(),
	[ids.riskLevel]: z.custom<InspectionRiskLevel>(),
});

type FormSchema = z.infer<typeof schema>;

function PhasePage() {
	const { identity } = useLoggedInUser();

	const { task, hooks, dispatch } = useTaskContext();

	const isNonCoiProcess =
		task.data[ids.inspectionProcessDefinition].key !== "Inspection_Case_COI";

	useEffect(() => {
		dispatch({ type: "update", options: { saveBtn: true } });
	}, [dispatch]);

	const { control, setValue, watch } = useFormContext<FormSchema>();

	const {
		[ids.inspectionFee]: fee,
		[ids.inspectionFeeCurrency]: currency,
		[ids.inspectionFeeCurrencyRate]: currencyRate,
		[ids.inspectionFeeInRial]: feeInRial,
	} = watch();

	const { isNegative, isPositiveOrNeutral } = useTaskStatus(
		ids.informationReviewStatus,
	);

	const [isPending, setIsPending] = useState<boolean>(false);

	useEffect(() => {
		if (!fee || !currency || !parseInt(currencyRate)) {
			setValue(ids.inspectionFeeInRial, "");
			return;
		}

		setValue(
			ids.inspectionFeeInRial,
			(parseFloat(fee) * parseInt(currencyRate)).toString(),
		);
	}, [currency, currencyRate, fee, setValue]);

	useEffect(() => {
		hooks.registerHook(
			"pre-submit",
			async ({ task, data }: { task: Task; data: FormSchema }) => {
				// set previous task
				data[ids.previousTask] = {
					taskKey: task.key,
					assigneeKey: AssigneeType.Manager,
					assigneeTitle: assigneesTemplate[AssigneeType.Manager],
					noteContent: data[ids.informationReviewNote],
					noteType:
						data[ids.informationReviewStatus] === ReviewStatus.Forward
							? "info"
							: "danger",
				};

				if (data[ids.informationReviewStatus] === ReviewStatus.Forward) {
					data[ids.assignees][AssigneeType.Executor] =
						task.data[ids.assignees][AssigneeType.Creator];
				} else if (data[ids.informationReviewStatus] === ReviewStatus.Return) {
				}
			},
		);

		hooks.registerHook(
			"submit",
			async ({ task, data }: { task: Task; data: FormSchema }) => {
				// update watchers
				await addWatcherToInstance(task.instanceId, identity.id);

				// set stage
				if (data[ids.informationReviewStatus] === ReviewStatus.Forward) {
					await setStageOfInstance(task.instanceId, "process-execution-start");
				} else if (data[ids.informationReviewStatus] === ReviewStatus.Return) {
					await setStageOfInstance(task.instanceId, "information-form");
				}
			},
		);

		return () => hooks.removeAll();
	}, [hooks, identity]);

	return (
		<div className="grid grid-cols-12 gap-x-4 gap-y-6 md:gap-x-10">
			<PreviousTaskReferrer />

			<Separator className="col-span-full my-4 h-1" />

			<FormItem className="col-span-full !col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
				<FormLabel>نوع بازرسی</FormLabel>
				<FormControl>
					<Input
						disabled
						value={task.data[ids.inspectionProcessDefinition].name}
					/>
				</FormControl>
			</FormItem>

			{task.data[ids.inspectionMethod] && (
				<FormItem className="col-span-full !col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
					<FormLabel>روش بازرسی</FormLabel>
					<FormControl>
						<Input
							disabled
							value={
								inspectionMethods[
									task.data[ids.inspectionMethod] as InspectionMethod
								]?.title
							}
						/>
					</FormControl>
				</FormItem>
			)}

			<Separator className="col-span-full my-4 h-1" />

			<FormItem className="col-span-full !col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
				<FormLabel>خریدار</FormLabel>
				<FormControl>
					<Input disabled value={task.data[ids.buyer].name} />
				</FormControl>
			</FormItem>

			<FormItem className="col-span-full !col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
				<FormLabel>مشتری</FormLabel>
				<FormControl>
					<Input
						disabled
						value={getUserFullname(task.data[ids.customer]) || "-"}
					/>
				</FormControl>
			</FormItem>

			<FormItem className="col-span-full !col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
				<FormLabel>شماره پروفرما</FormLabel>
				<FormControl>
					<Input
						className="tracking-wider rtl:text-right"
						dir="ltr"
						disabled
						value={task.data[ids.proformaNo] || "-"}
					/>
				</FormControl>
			</FormItem>

			<Separator className="col-span-full my-4 h-1" />

			<CustomsTariffNosList />

			<FormItem className="col-span-full !col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
				<FormLabel>گمرک</FormLabel>
				<FormControl>
					<Input
						disabled
						value={
							customs.find((x) => x.value === task.data[ids.customName])?.label
						}
					/>
				</FormControl>
			</FormItem>

			<Separator className="col-span-full my-4 h-1" />

			<FormItem className="col-span-full !col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
				<FormLabel>مبلغ پروفرما</FormLabel>
				<FormControl>
					<Input
						disabled
						value={`${toCurrency(task.data[ids.proformaValue])} ${proformaValueCurrencies[task.data[ids.proformaValueCurrency] as ProformaValueCurrency]?.title}`}
					/>
				</FormControl>
				{task.data[ids.proformaValueCurrency] !==
					ProformaValueCurrency.Euro && (
					<FormDescription>
						<Numeric value={toCurrency(task.data[ids.proformaValueInEuro])} />
						&nbsp;یورو
					</FormDescription>
				)}
			</FormItem>

			<Separator className="col-span-full my-4 h-1" />

			<FormField
				control={control}
				name={ids.inspectionFee}
				render={({ field: { ref, disabled, onChange, ...field } }) => (
					<FormItem className="col-span-full !col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
						<FormLabel>
							کارمزد پایه بازرسی
							{isPositiveOrNeutral && !isNonCoiProcess && (
								<span className="text-red-600"> *</span>
							)}
						</FormLabel>
						<FormControl>
							<MaskInput
								className="tracking-wider rtl:text-right"
								dir="ltr"
								disabled={isNonCoiProcess || disabled}
								inputRef={ref}
								mapToRadix={["."]}
								mask={Number}
								radix="."
								scale={2}
								thousandsSeparator=","
								unmask
								onAccept={(value) => onChange(value)}
								{...field}
							/>
						</FormControl>
						{fee && feeInRial && fee !== feeInRial && (
							<FormDescription>
								<Numeric value={toCurrency(feeInRial)} />
								&nbsp;ریال
							</FormDescription>
						)}
						<FormMessage />
					</FormItem>
				)}
				rules={{
					required: isPositiveOrNeutral && messages.validation.required,
				}}
			/>

			<FormField
				control={control}
				name={ids.inspectionFeeCurrency}
				render={({ field: { ref, disabled, onChange, ...field } }) => (
					<FormItem className="col-span-full !col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
						<FormLabel>
							نوع ارز
							{isPositiveOrNeutral && !isNonCoiProcess && (
								<span className="text-red-600"> *</span>
							)}
						</FormLabel>
						<FormControl>
							<Select
								disabled={isNonCoiProcess || disabled}
								onValueChange={(value) => {
									onChange(value);

									setValue(
										ids.inspectionFeeCurrencyRate,
										value === Currency.Rial ? "1" : "",
									);
								}}
								{...field}
							>
								<SelectTrigger ref={ref}>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{currencyOptions.map((currency) => (
										<SelectItem key={currency.value} value={currency.value}>
											{currency.label}
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

			{currency && currency !== Currency.Rial && (
				<FormField
					control={control}
					name={ids.inspectionFeeCurrencyRate}
					render={({ field: { ref, disabled, onChange, ...field } }) => (
						<FormItem className="col-span-full !col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
							<FormLabel>
								نرخ ارز
								{isPositiveOrNeutral && !isNonCoiProcess && (
									<span className="text-red-600"> *</span>
								)}
							</FormLabel>
							<div className="relative">
								<FormControl>
									<MaskInput
										className="tracking-wider rtl:text-right"
										dir="ltr"
										disabled={isNonCoiProcess || disabled}
										inputRef={ref}
										mask={Number}
										scale={0}
										thousandsSeparator=","
										unmask
										onAccept={(value) => onChange(value)}
										{...field}
									/>
								</FormControl>

								{currencies[currency].code && (
									<TooltipProvider>
										<Tooltip>
											<TooltipTrigger asChild>
												<Button
													className="absolute bottom-0 end-3.5 top-0 w-3.5 text-muted-foreground"
													disabled={isNonCoiProcess || isPending || disabled}
													type="button"
													variant="link"
													onClick={async () => {
														try {
															setIsPending(true);

															const rate = await getCurrencyRate(
																currencies[currency].code!,
															);

															onChange(rate);
														} catch (err) {
															console.error(err);
															toast.error(
																"خطای نامشخصی در هنگام دریافت اطلاعات رخ داد.",
															);
														} finally {
															setIsPending(false);
														}
													}}
												>
													<Spinner loading={isPending} size="xs">
														<FaWandMagicSparkles />
													</Spinner>
												</Button>
											</TooltipTrigger>
											<TooltipContent>درج خودکار نرخ ارز</TooltipContent>
										</Tooltip>
									</TooltipProvider>
								)}
							</div>
							<FormMessage />
						</FormItem>
					)}
					rules={{
						required: isPositiveOrNeutral && messages.validation.required,
					}}
				/>
			)}

			<Separator className="col-span-full my-4 h-1" />

			<FormField
				control={control}
				name={ids.riskLevel}
				render={({ field: { ref, onChange, ...field } }) => (
					<FormItem className="col-span-full !col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
						<FormLabel>
							سطح ریسک
							{isPositiveOrNeutral && <span className="text-red-600"> *</span>}
						</FormLabel>
						<FormControl>
							<Select onValueChange={onChange} {...field}>
								<SelectTrigger ref={ref}>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{inspectionRiskLevelOptions.map((x) => (
										<SelectItem key={x.value} value={x.value}>
											{x.label}
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

			<Separator className="col-span-full my-4 h-1" />

			<FormField
				control={control}
				name={ids.informationReviewStatus}
				render={({ field: { ref, onChange, ...field } }) => (
					<FormItem className="col-span-full !col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
						<FormLabel>
							وضعیت<span className="text-red-600"> *</span>
						</FormLabel>
						<FormControl>
							<Select onValueChange={onChange} {...field}>
								<SelectTrigger ref={ref}>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{reviewStatusOptions.map((x) => (
										<SelectItem key={x.value} value={x.value}>
											{x.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
				rules={{ required: messages.validation.required }}
			/>

			<FormField
				control={control}
				name={ids.informationReviewNote}
				render={({ field }) => (
					<FormItem className="col-span-full">
						<FormLabel>
							توضیحات{isNegative && <span className="text-red-600"> *</span>}
						</FormLabel>
						<FormControl>
							<Textarea className="min-h-48" {...field} />
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
				rules={{ required: isNegative && messages.validation.required }}
			/>
		</div>
	);
}

const PhaseEntry = { schema, render: <PhasePage /> };

export default PhaseEntry;
