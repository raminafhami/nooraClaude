"use client";

import { useContext, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { z } from "zod";

import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import { getBranchById } from "@/branches/services/getBranchById";
import { Buyer } from "@/buyers/models/Buyer";
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
import { useContractDifference } from "@/contract-number/hooks/useContractDifference";
import { addWatcherToInstance } from "@/felo/instances/services/addWatcherToInstance";
import { getInstanceById } from "@/felo/instances/services/getInstanceById";
import { setStageOfInstance } from "@/felo/instances/services/setStageOfInstance";
import { useTaskCancel } from "@/felo/tasks/hooks/useTaskCancel";
import { useTaskContext } from "@/felo/tasks/hooks/useTaskContext";
import { Task } from "@/felo/tasks/models/Task";
import { TaskDetailsReturn } from "@/felo/tasks/models/TaskDetails";
import { isFieldInTaskForm } from "@/felo/tasks/utils/isFieldInTaskForm";
import { createDebts } from "@/financial/debts/services/createDebts";
import { FinancialCategoryType } from "@/financial/financial-category/enums/FinancialCategoryType";
import { getFinancialCategories } from "@/financial/financial-category/services/getFinancialCategories";
import { IncomesWidget } from "@/financial/incomes/components/task-incomes/IncomesWidget";
import { getIncomes } from "@/financial/incomes/services/getIncomes";
import BuyerSelect from "@/inspection/flows/_module/BuyerSelect";
import CustomerSelect from "@/inspection/flows/_module/CustomerSelect";
import PreviousTaskReferrer from "@/inspection/flows/_module/referrer/PreviousTaskReferrer";
import getGoodsInspectionFieldOptions from "@/inspection/goodsInspectionFields/services/getGoodsInspectionFieldOptions";
import { caseType, CaseType } from "@/inspection/models/CaseType";
import { PreviousTask } from "@/inspection/models/PreviousTask";
import { cancelInspection } from "@/inspection/services/cancelInspection";
import getRelations from "@/inspection/services/getRelations";
import { convertToContractData } from "@/inspection/shared/utils/convertToContractData";
import { messages } from "@/messages";
import { ObjectType } from "@/utils/object/ObjectType";

import { GoodsCustomTariffNosWidget } from "../../components/GoodsCustomTariffNos/GoodsCustomTariffNosWidget";
import { GoodsDescriptionsWidget } from "../../components/GoodsDescriptions/GoodsDescriptionsWidget";
import {
	Assignees,
	assigneesTemplate,
	AssigneeType,
} from "../../models/Assignee";
import { Branch } from "../../models/Branch";
import { ids } from "../../models/Ids";
import {
	InspectionMethod,
	inspectionMethodOptions,
} from "../../models/InspectionMethod";
import { ProcessType, processTypeOptions } from "../../models/ProcessType";
import { ReviewStatus, reviewStatusOptions } from "./ReviewStatus";

const schema = z.object({
	[ids.previousTask]: z.custom<PreviousTask>(),
	[ids.assignees]: z.custom<Assignees>(),
	[ids.branch]: z.custom<Branch>().nullable(),
	[ids.informationFormStatus]: z.custom<ReviewStatus>(),
	[ids.informationFormNote]: z.string(),
	[ids.processType]: z.custom<ProcessType>(),
	[ids.inspectionMethod]: z.custom<InspectionMethod>(),
	[ids.caseType]: z.custom<CaseType>().optional(),
	[ids.buyer]: z.custom<Buyer>(),
	[ids.seller]: z.string(),
	[ids.proformaNo]: z.string(),
	[ids.proformaDate]: z.string(),
	[ids.proformaOrInvoicePrice]: z.string(),
	[ids.goodsCustomTariffNos]: z.string(),
	[ids.goodsDescriptions]: z.string(),
	[ids.goodsField]: z.string(),
	[ids.inspectionPlace]: z.string(),
	[ids.inspectionDate]: z.string(),
});

type FormData = z.infer<typeof schema>;

const goodsInspectionFieldOptions = getGoodsInspectionFieldOptions();

function PhasePage() {
	const { identity } = useLoggedInUser();

	const { task, hooks, dispatch } = useTaskContext();

	const { verifyContractData } = useContractDifference(
		task.instanceContractNo!,
	);

	const { openTaskCancelDialog } = useTaskCancel();

	const { control, setValue, watch } = useFormContext<FormData>();

	const { [ids.previousTask]: previousTask } = task.data;

	const {
		[ids.assignees]: assignees,
		[ids.branch]: branch,
		[ids.informationFormStatus]: reviewStatus,
	} = watch();

	const { customer, coordinator, marketer } = assignees ?? {};

	const isPositiveStatus =
		typeof reviewStatus === "undefined" ||
		reviewStatus === ReviewStatus.Forward;
	const isNegativeStatus = reviewStatus === ReviewStatus.Cancel;

	useEffect(() => {
		dispatch({ type: "update", options: { saveBtn: true } });
	}, [dispatch]);

	useEffect(() => {
		(async () => {
			if (typeof branch === "undefined") {
				let userBranch: Branch | null = null;
				if (identity.branchId) {
					const { id, title, managerId, manager } = await getBranchById(
						identity.branchId,
					);

					userBranch = {
						id,
						name: title,
						managerId: managerId || "",
						managerName: manager?.fullname || "",
					};
				}

				setValue(ids.branch, userBranch);
			}
		})();
	}, [branch, identity.branchId, setValue]);

	useEffect(() => {
		// set coordinator & marketer
		(async () => {
			if (customer?.id || branch?.managerId) {
				const { coordinator, marketer } = await getRelations(
					customer?.id,
					branch?.managerId,
				);

				setValue(
					`${ids.assignees}.${AssigneeType.Coordinator}`,
					coordinator
						? {
								id: coordinator.id,
								name: coordinator.fullname,
							}
						: null,
				);

				setValue(
					`${ids.assignees}.${AssigneeType.Marketer}`,
					marketer
						? {
								id: marketer.id,
								name: marketer.fullname,
							}
						: null,
				);
			} else {
				setValue(`${ids.assignees}.${AssigneeType.Coordinator}`, undefined);
				setValue(`${ids.assignees}.${AssigneeType.Marketer}`, undefined);
			}
		})();
	}, [branch?.managerId, customer?.id, setValue]);

	useEffect(() => {
		hooks.registerHook(
			"pre-submit",
			async ({ task, data }: { task: Task; data: FormData }) => {
				// initialize assignees
				if (!data[ids.assignees]) {
					data[ids.assignees] = {};
				}

				// set assignee:expert
				data[ids.assignees][AssigneeType.Expert] = {
					id: identity.id,
					name: identity.fullname,
				};

				// set previous task
				data[ids.previousTask] = {
					taskKey: task.key,
					assigneeKey: AssigneeType.Expert,
					assigneeTitle: assigneesTemplate[AssigneeType.Expert],
					noteContent: data[ids.informationFormNote],
				};

				if (data[ids.informationFormStatus] === ReviewStatus.Forward) {
					// verify caseType
					let caseType = data[ids.caseType] || task.data[ids.caseType];
					if (!caseType) {
						const instance = await getInstanceById(task.instanceId, [
							ids.caseType,
						]);

						if (instance.parameters[ids.caseType]) {
							caseType = instance.parameters[ids.caseType];
						} else {
							throw new Error("نوع درخواست مشخص نشده است.");
						}
					}

					if (!isFieldInTaskForm(task, ids.caseType)) {
						delete data[ids.caseType];
					} else if (caseType && !data[ids.caseType]) {
						data[ids.caseType] = caseType;
					}

					// set financial fields
					const financials = await getIncomes({
						filters: { instanceId: task.instanceId, isDeleted: false },
					});

					const inspectionCategory = await getFinancialCategories({
						filters: {
							type: FinancialCategoryType.Income,
							key: "inspection-certificate",
						},
					}).then((categories) => categories.at(0));

					if (!inspectionCategory) {
						throw new Error("inspection-certificate category is not found.");
					}

					if (
						!financials.length ||
						!financials.some((x) => x.categoryId === inspectionCategory.id)
					) {
						throw new Error(
							`ثبت حداقل یک درآمد «${inspectionCategory.title}» الزامی است.`,
						);
					}

					const totalIncome = financials
						.map((income) => income.total)
						.reduce((acc, curr) => (acc += curr), 0);

					if (isFieldInTaskForm(task, ids.inspectionFeeInRial)) {
						(data as any)[ids.inspectionFeeInRial] = totalIncome.toString();
					}

					// debts
					try {
						const usersInDebt: ObjectType<"id" | "type">[] = [
							{
								id: data[ids.assignees][AssigneeType.Customer]?.id as string,
								type: "customer",
							},
						];

						if (data[ids.assignees][AssigneeType.Coordinator]) {
							usersInDebt.push({
								id: data[ids.assignees][AssigneeType.Coordinator]?.id as string,
								type: "coordinator",
							});
						}

						await createDebts({
							instanceId: task.instanceId,
							users: usersInDebt,
						});
					} catch (err) {
						console.error(err);
					}

					// contract
					await verifyContractData(convertToContractData(data));
				} else if (data[ids.informationFormStatus] === ReviewStatus.Cancel) {
					const { reason, description } = await openTaskCancelDialog();
					await cancelInspection(task, data as any, { reason, description });
				}
			},
		);

		hooks.registerHook(
			"submit",
			async ({ task, data }: { task: Task; data: FormData }) => {
				// add expert to watchers
				await addWatcherToInstance(task.instanceId, identity.id);

				// set next stage based on status
				const nextStage =
					data[ids.informationFormStatus] === ReviewStatus.Cancel
						? "cancelled"
						: "information-review";
				await setStageOfInstance(task.instanceId, nextStage);
			},
		);

		return () => hooks.removeAll();
	}, [hooks, identity, verifyContractData, openTaskCancelDialog]);

	return (
		<div className="grid grid-cols-12 gap-x-4 gap-y-6 md:gap-x-10">
			{previousTask && (
				<>
					<PreviousTaskReferrer />

					<Separator className="col-span-full h-1" />
				</>
			)}

			<FormField
				control={control}
				name={ids.processType}
				render={({ field }) => (
					<FormItem className="col-span-full !col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
						<FormLabel>نوع فرایند:</FormLabel>
						<FormControl>
							<Select value={field.value} onValueChange={field.onChange}>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{processTypeOptions.map((x) => (
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
				rules={{ required: isPositiveStatus && messages.validation.required }}
			/>

			<FormField
				control={control}
				name={ids.inspectionMethod}
				render={({ field }) => (
					<FormItem className="col-span-full !col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
						<FormLabel>روش بازرسی:</FormLabel>
						<FormControl>
							<Select value={field.value} onValueChange={field.onChange}>
								<SelectTrigger>
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
				rules={{ required: isPositiveStatus && messages.validation.required }}
			/>

			<CustomerSelect required={isPositiveStatus} />

			{typeof coordinator !== "undefined" && (
				<FormItem className="col-span-full !col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
					<FormLabel>هماهنگ کننده:</FormLabel>
					<FormControl>
						<Input disabled value={coordinator?.name || "-"} />
					</FormControl>
				</FormItem>
			)}

			{typeof marketer !== "undefined" && (
				<FormItem className="col-span-full !col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
					<FormLabel>بازاریاب:</FormLabel>
					<FormControl>
						<Input disabled value={marketer?.name || "-"} />
					</FormControl>
				</FormItem>
			)}

			<FormField
				control={control}
				name={ids.caseType}
				render={({ field }) => (
					<FormItem className="col-span-full !col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
						<FormLabel>نوع درخواست:</FormLabel>
						<FormControl>
							<Input
								disabled
								value={
									(field.value
										? caseType[field.value]
										: task.data[ids.caseType] &&
											caseType[task.data[ids.caseType] as CaseType]) || "-"
								}
							/>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
				rules={{}}
			/>

			<Separator className="col-span-full h-1" />

			<BuyerSelect required={isPositiveStatus} />

			<FormField
				control={control}
				name={ids.seller}
				render={({ field }) => (
					<FormItem className="col-span-full !col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
						<FormLabel>فروشنده:</FormLabel>
						<FormControl>
							<Input className="rtl:text-right" dir="ltr" {...field} />
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
				rules={{}}
			/>

			<Separator className="col-span-full h-1" />

			<FormField
				control={control}
				name={ids.proformaNo}
				render={({ field }) => (
					<FormItem className="col-span-full !col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
						<FormLabel>شماره پروفرما:</FormLabel>
						<FormControl>
							<Input className="rtl:text-right" dir="ltr" {...field} />
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
				rules={{}}
			/>

			<FormField
				control={control}
				name={ids.proformaDate}
				render={({ field }) => (
					<FormItem className="col-span-full !col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
						<FormLabel>تاریخ پروفرما:</FormLabel>
						<FormControl>
							<DateInput calendarType="gregorian" {...field} />
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
				rules={{}}
			/>

			<FormField
				control={control}
				name={ids.proformaOrInvoicePrice}
				render={({ field: { ref, onChange, ...field } }) => (
					<FormItem className="col-span-full !col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
						<FormLabel>مبلغ پروفرما / فاکتور (یورو):</FormLabel>
						<FormControl>
							<MaskInput
								className="rtl:text-right"
								dir="ltr"
								inputRef={ref}
								mapToRadix={["."]}
								mask={Number}
								radix="."
								scale={2}
								thousandsSeparator=","
								unmask
								onAccept={onChange}
								{...field}
							/>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
				rules={{}}
			/>

			<Separator className="col-span-full h-1" />

			<GoodsCustomTariffNosWidget required={false} />

			<GoodsDescriptionsWidget required={isPositiveStatus} />

			<FormField
				control={control}
				name={ids.goodsField}
				render={({ field }) => (
					<FormItem className="col-span-full !col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
						<FormLabel>نوع کالاها:</FormLabel>
						<FormControl>
							<Select value={field.value} onValueChange={field.onChange}>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{goodsInspectionFieldOptions.map((x) => (
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
				rules={{ required: isPositiveStatus && messages.validation.required }}
			/>

			<Separator className="col-span-full h-1" />

			<IncomesWidget />

			<Separator className="col-span-full h-1" />

			<FormField
				control={control}
				name={ids.inspectionPlace}
				render={({ field }) => (
					<FormItem className="col-span-full !col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
						<FormLabel>محل بازرسی:</FormLabel>
						<FormControl>
							<Input className="rtl:text-right" dir="ltr" {...field} />
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
				rules={{}}
			/>

			<FormField
				control={control}
				name={ids.inspectionDate}
				render={({ field }) => (
					<FormItem className="col-span-full !col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
						<FormLabel>تاریخ بازرسی:</FormLabel>
						<FormControl>
							<DateInput calendarType="gregorian" {...field} />
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
				rules={{}}
			/>

			<Separator className="col-span-full h-1" />

			<FormField
				control={control}
				name={ids.informationFormStatus}
				render={({ field }) => (
					<FormItem className="col-span-full !col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
						<FormLabel>وضعیت:</FormLabel>
						<FormControl>
							<Select value={field.value} onValueChange={field.onChange}>
								<SelectTrigger>
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

			{isPositiveStatus && (
				<FormField
					control={control}
					name={ids.informationFormNote}
					render={({ field }) => (
						<FormItem className="col-span-full">
							<FormLabel>توضیحات:</FormLabel>
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

const PhaseEntry: TaskDetailsReturn<FormData> = {
	schema,
	render: <PhasePage />,
};

export default PhaseEntry;
