"use client";

import { useEffect, useMemo, useState } from "react";
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
	currency as currencies,
	Currency,
	currencyOptions,
} from "@/enums/Currency";
import { getDocuments } from "@/felo/files/services/getDocuments";
import { addWatcherToInstance } from "@/felo/instances/services/addWatcherToInstance";
import { setStageOfInstance } from "@/felo/instances/services/setStageOfInstance";
import { useTaskCancel } from "@/felo/tasks/hooks/useTaskCancel";
import { useTaskContext } from "@/felo/tasks/hooks/useTaskContext";
import { useTaskStatus } from "@/felo/tasks/hooks/useTaskStatus";
import { Task } from "@/felo/tasks/models/Task";
import { getCurrencyRate } from "@/financial/currency-rate/services/getCurrencyRate";
import { UserType } from "@/identity/users/models/UserType";
import { getUsers } from "@/identity/users/services/getUsers";
import searchUserNationalCode from "@/identity/users/utils/searchUserNationalCode";
import PreviousTaskReferrer from "@/inspection/flows/_module/referrer/PreviousTaskReferrer";
import { PreviousTask } from "@/inspection/models/PreviousTask";
import { getInspectionMethodOptions } from "@/inspection/shared/enums/InspectionMethod";
import { InspectionRiskLevel } from "@/inspection/shared/enums/InspectionRiskLevel";
import { messages } from "@/messages";
import { toCurrency } from "@/utils/String";

import {
	proformaValueCurrencies,
	ProformaValueCurrency,
	proformaValueCurrencyOptions,
} from "../../enums/ProformaValueCurrency";
import {
	Assignees,
	assigneesTemplate,
	AssigneeType,
} from "../../models/Assignee";
import { BuyerInfo } from "../../models/BuyerInfo";
import { ContractNumberInfo } from "../../models/ContractNumberInfo";
import { CustomerInfo } from "../../models/CustomerInfo";
import { ids } from "../../models/Ids";
import { InspectionProcessDefinitionInfo } from "../../models/InspectionProcessDefinitionInfo";
import { pickBuyerInfo } from "../../utils/pickBuyerInfo";
import { pickCustomerInfo } from "../../utils/pickCustomerInfo";
import { BuyerSelect } from "./BuyerSelect";
import { CustomsTariffNosWidget } from "./CustomsTariffNosWidget";
import { InspectionProcessDefinitionSelect } from "./InspectionProcessDefinitionSelect";
import { ReviewStatus, reviewStatusOptions } from "./ReviewStatus";
import { UserSelect } from "./UserSelect";

const schema = z.object({
	[ids.previousTask]: z.custom<PreviousTask>(),
	[ids.assignees]: z.custom<Assignees>(),
	[ids.informationFormStatus]: z.custom<ReviewStatus>(),
	[ids.informationFormNote]: z.string(),
	[ids.inspectionProcessDefinition]:
		z.custom<InspectionProcessDefinitionInfo>(),
	[ids.inspectionMethod]: z.string().nullable(),
	[ids.buyer]: z.custom<BuyerInfo>(),
	[ids.customer]: z.custom<CustomerInfo>(),
	[ids.proformaNo]: z.string(),
	[ids.contractNumber]: z.custom<ContractNumberInfo>().optional(),
	[ids.customsTariffNos]: z.array(z.string()),
	[ids.customName]: z.string(),
	[ids.proformaValue]: z.string(),
	[ids.proformaValueCurrency]: z.custom<ProformaValueCurrency>(),
	[ids.proformaValueCurrencyRate]: z.string(),
	[ids.proformaValueInEuro]: z.string(),
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

	const { [ids.previousTask]: previousTask } = task.data;

	useEffect(() => {
		dispatch({ type: "update", options: { saveBtn: true } });
	}, [dispatch]);

	const { control, setValue, watch } = useFormContext<FormSchema>();

	const {
		[ids.inspectionProcessDefinition]: inspectionProcessDefinition,
		[ids.proformaValue]: proformaValue,
		[ids.proformaValueCurrency]: proformaValueCurrency,
		[ids.proformaValueInEuro]: proformaValueInEuro,
		[ids.inspectionFee]: fee,
		[ids.inspectionFeeCurrency]: currency,
		[ids.inspectionFeeCurrencyRate]: currencyRate,
		[ids.inspectionFeeInRial]: feeInRial,
	} = watch();

	const isNonCoiProcess =
		!!inspectionProcessDefinition &&
		inspectionProcessDefinition.key !== "Inspection_Case_COI";

	const inspectionMethodOptions = useMemo(
		() =>
			inspectionProcessDefinition
				? getInspectionMethodOptions(inspectionProcessDefinition?.key)
				: [],
		[inspectionProcessDefinition],
	);

	const { isPositiveOrNeutral } = useTaskStatus(ids.informationFormStatus);

	const { openTaskCancelDialog } = useTaskCancel();

	const [isPending, setIsPending] = useState<boolean>(false);

	useEffect(() => {
		if (!parseFloat(proformaValue) || !proformaValueCurrency) {
			setValue(ids.proformaValueCurrencyRate, "");
			setValue(ids.proformaValueInEuro, "");
			return;
		}

		const currencyRate = proformaValueCurrencies[proformaValueCurrency].rate;

		setValue(ids.proformaValueCurrencyRate, currencyRate);
		setValue(
			ids.proformaValueInEuro,
			(parseFloat(proformaValue) * parseFloat(currencyRate)).toFixed(0),
		);
	}, [proformaValue, proformaValueCurrency, setValue]);

	useEffect(() => {
		if (!parseFloat(fee) || !currency || !parseInt(currencyRate)) {
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
				// initialize assignees
				if (!data[ids.assignees]) {
					data[ids.assignees] = {};
				}

				// set assignee:creator
				data[ids.assignees][AssigneeType.Creator] = {
					id: identity.id,
					name: identity.fullname,
				};

				// set previous task
				data[ids.previousTask] = {
					taskKey: task.key,
					assigneeKey: AssigneeType.Creator,
					assigneeTitle: assigneesTemplate[AssigneeType.Creator],
					noteContent: data[ids.informationFormNote],
				};

				if (data[ids.informationFormStatus] === ReviewStatus.Forward) {
					// set assignee:manager
					// const managerNationalCode = (() => {
					// 	switch (data[ids.inspectionProcessDefinition].key) {
					// 		case "Inspection_Case_IC":
					// 		case "Inspection_Case_LC":
					// 		case "Inspection_Case_Bank_COI":
					// 		case "Inspection_Case_SC":
					// 			return "0011878223"; // Fatemeh Esfandiari
					// 		case "Inspection_Case_COI":
					// 			return "4610257211"; // Sharareh Ghanadian
					// 		case "Inspection_Case_Source":
					// 			return "0064758826"; // Kiarash Shabdiz
					// 	}
					// })();

					// const manager =
					// 	managerNationalCode &&
					// 	(await getUsers({
					// 		filters: {
					// 			type: UserType.Personnel,
					// 			...searchUserNationalCode(managerNationalCode),
					// 		},
					// 	}).then((users) => users.at(0)));

					// if (!manager) {
					// 	throw Error("مدیر مربوط به درخواست بازرسی مورد نظر یافت نشد.");
					// }

					// data[ids.assignees][AssigneeType.Manager] = {
					// 	id: manager.id,
					// 	name: manager.fullname,
					// };
					data[ids.assignees][AssigneeType.Manager] = {
						id: identity.id,
						name: identity.fullname,
					};

					// verify at least one document in docs folder
					const documents = await getDocuments({
						instanceId: task.instanceId,
					});

					if (!documents.files.filter((x) => x.folder === "docs").length) {
						throw new Error("بارگذاری حداقل یک مدرک در بخش مدارک الزامی است.");
					}

					// set risk level
					const proformaValueInEuro = parseInt(data[ids.proformaValueInEuro]);
					if (proformaValueInEuro < 100_000) {
						data[ids.riskLevel] = InspectionRiskLevel.Normal;
					} else if (proformaValueInEuro < 500_000) {
						data[ids.riskLevel] = InspectionRiskLevel.High;
					} else {
						data[ids.riskLevel] = InspectionRiskLevel.VeryHigh;
					}
				} else if (data[ids.informationFormStatus] === ReviewStatus.Cancel) {
					await openTaskCancelDialog();
				}
			},
		);

		hooks.registerHook(
			"submit",
			async ({ task, data }: { task: Task; data: FormSchema }) => {
				// update watchers
				await addWatcherToInstance(task.instanceId, identity.id);

				// set stage
				if (data[ids.informationFormStatus] === ReviewStatus.Forward) {
					await setStageOfInstance(task.instanceId, "information-review");
				} else if (data[ids.informationFormStatus] === ReviewStatus.Cancel) {
					await setStageOfInstance(task.instanceId, "cancelled");
				}
			},
		);

		return () => hooks.removeAll();
	}, [hooks, identity, openTaskCancelDialog]);

	return (
		<div className="grid grid-cols-12 gap-x-4 gap-y-6 md:gap-x-10">
			{previousTask && (
				<>
					<PreviousTaskReferrer />
					<Separator className="col-span-full my-4 h-1" />
				</>
			)}

			<FormField
				control={control}
				name={ids.inspectionProcessDefinition}
				render={({ field: { onChange, ...field } }) => (
					<FormItem className="col-span-full !col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
						<FormLabel>
							نوع بازرسی
							{isPositiveOrNeutral && <span className="text-red-600"> *</span>}
						</FormLabel>
						<FormControl>
							<InspectionProcessDefinitionSelect
								onChange={(value) => {
									onChange(value);

									setValue(ids.inspectionMethod, null);
								}}
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

			{!!inspectionMethodOptions.length && (
				<FormField
					control={control}
					name={ids.inspectionMethod}
					render={({ field: { ref, value, onChange, ...field } }) => (
						<FormItem className="col-span-full !col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
							<FormLabel>
								روش بازرسی<span className="text-red-600"> *</span>
							</FormLabel>
							<FormControl>
								<Select value={value ?? ""} onValueChange={onChange} {...field}>
									<SelectTrigger ref={ref}>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{inspectionMethodOptions.map((x) => (
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
						required:
							isPositiveOrNeutral &&
							!!inspectionMethodOptions.length &&
							messages.validation.required,
					}}
				/>
			)}

			<Separator className="col-span-full my-4 h-1" />

			<FormField
				control={control}
				name={ids.buyer}
				render={({ field: { onChange, ...field } }) => (
					<FormItem className="col-span-full !col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
						<FormLabel>
							خریدار
							{isPositiveOrNeutral && <span className="text-red-600"> *</span>}
						</FormLabel>
						<FormControl>
							<BuyerSelect
								onChange={(value) => {
									onChange(value ? pickBuyerInfo(value) : value);
								}}
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

			<FormField
				control={control}
				name={ids.customer}
				render={({ field: { onChange, ...field } }) => (
					<FormItem className="col-span-full !col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
						<FormLabel>مشتری</FormLabel>
						<FormControl>
							<UserSelect
								onChange={(value) => {
									onChange(value ? pickCustomerInfo(value) : value);
								}}
								{...field}
							/>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
				rules={{}}
			/>

			<FormField
				control={control}
				name={ids.proformaNo}
				render={({ field }) => (
					<FormItem className="col-span-full !col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
						<FormLabel>شماره پروفرما</FormLabel>
						<FormControl>
							<Input {...field} />
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
				rules={{}}
			/>

			<Separator className="col-span-full my-4 h-1" />

			<CustomsTariffNosWidget required={isPositiveOrNeutral} />

			<FormField
				control={control}
				name={ids.customName}
				render={({ field: { ref, onChange, ...field } }) => (
					<FormItem className="col-span-full !col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
						<FormLabel>
							گمرک
							{isPositiveOrNeutral && <span className="text-red-600"> *</span>}
						</FormLabel>
						<FormControl>
							<Select onValueChange={onChange} {...field}>
								<SelectTrigger ref={ref}>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{customs.map((x, index) => (
										<SelectItem key={index} value={x.value}>
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
				name={ids.proformaValue}
				render={({ field: { ref, onChange, ...field } }) => (
					<FormItem className="col-span-full !col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
						<FormLabel>
							مبلغ پروفرما
							{isPositiveOrNeutral && <span className="text-red-600"> *</span>}
						</FormLabel>
						<FormControl>
							<MaskInput
								className="tracking-wider rtl:text-right"
								dir="ltr"
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
						{proformaValueInEuro &&
							proformaValueCurrency !== ProformaValueCurrency.Euro && (
								<FormDescription>
									<Numeric value={toCurrency(proformaValueInEuro)} />
									&nbsp;یورو
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
				name={ids.proformaValueCurrency}
				render={({ field: { ref, onChange, ...field } }) => (
					<FormItem className="col-span-full !col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
						<FormLabel>
							نوع ارز
							{isPositiveOrNeutral && isNonCoiProcess && (
								<span className="text-red-600"> *</span>
							)}
						</FormLabel>
						<FormControl>
							<Select onValueChange={onChange} {...field}>
								<SelectTrigger ref={ref}>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{proformaValueCurrencyOptions.map((currency) => (
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

			<Separator className="col-span-full my-4 h-1" />

			<FormField
				control={control}
				name={ids.inspectionFee}
				render={({ field: { ref, onChange, ...field } }) => (
					<FormItem className="col-span-full !col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
						<FormLabel>
							کارمزد پایه بازرسی
							{isPositiveOrNeutral && isNonCoiProcess && (
								<span className="text-red-600"> *</span>
							)}
						</FormLabel>
						<FormControl>
							<MaskInput
								className="tracking-wider rtl:text-right"
								dir="ltr"
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
					required:
						isPositiveOrNeutral &&
						isNonCoiProcess &&
						messages.validation.required,
				}}
			/>

			<FormField
				control={control}
				name={ids.inspectionFeeCurrency}
				render={({ field: { ref, onChange, ...field } }) => (
					<FormItem className="col-span-full !col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
						<FormLabel>
							نوع ارز
							{isPositiveOrNeutral && isNonCoiProcess && (
								<span className="text-red-600"> *</span>
							)}
						</FormLabel>
						<FormControl>
							<Select
								onValueChange={(value) => {
									onChange(value !== "clear" ? value : "");

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
									{field.value && !isNonCoiProcess && (
										<SelectItem value="clear">-</SelectItem>
									)}
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
					required:
						isPositiveOrNeutral &&
						isNonCoiProcess &&
						messages.validation.required,
				}}
			/>

			{currency && currency !== Currency.Rial && (
				<FormField
					control={control}
					name={ids.inspectionFeeCurrencyRate}
					render={({ field: { ref, onChange, ...field } }) => (
						<FormItem className="col-span-full !col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
							<FormLabel>
								نرخ ارز
								{isPositiveOrNeutral && isNonCoiProcess && (
									<span className="text-red-600"> *</span>
								)}
							</FormLabel>
							<div className="relative">
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

								{currencies[currency].code && (
									<TooltipProvider>
										<Tooltip>
											<TooltipTrigger asChild>
												<Button
													className="absolute bottom-0 end-3.5 top-0 w-3.5 text-muted-foreground"
													disabled={isPending}
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
						required:
							isPositiveOrNeutral &&
							isNonCoiProcess &&
							messages.validation.required,
					}}
				/>
			)}

			<Separator className="col-span-full my-4 h-1" />

			<FormField
				control={control}
				name={ids.informationFormStatus}
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

			{isPositiveOrNeutral && (
				<FormField
					control={control}
					name={ids.informationFormNote}
					render={({ field }) => (
						<FormItem className="col-span-full">
							<FormLabel>توضیحات</FormLabel>
							<FormControl>
								<Textarea className="min-h-48" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
					rules={{}}
				/>
			)}
		</div>
	);
}

const PhaseEntry = { schema, render: <PhasePage /> };

export default PhaseEntry;
