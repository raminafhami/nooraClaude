"use client";

import { useContext, useEffect, useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import { z } from "zod";

import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
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
import { addWatcherToInstance } from "@/felo/instances/services/addWatcherToInstance";
import { getInstances } from "@/felo/instances/services/getInstances";
import { setStageOfInstance } from "@/felo/instances/services/setStageOfInstance";
import { useTaskContext } from "@/felo/tasks/hooks/useTaskContext";
import { Task } from "@/felo/tasks/models/Task";
import { isFieldInTaskForm } from "@/felo/tasks/utils/isFieldInTaskForm";
import { CostMethod } from "@/financial/costs/enums/CostMethod";
import { CostPeriod } from "@/financial/costs/enums/CostPeriod";
import { CostType } from "@/financial/costs/enums/CostType";
import { CreateCostModel } from "@/financial/costs/services/createCost";
import { FinancialsWidget } from "@/financial/financial/components/task-financials/FinancialsWidget";
import { UserLookup } from "@/identity/users/models/UserLookup";
import getUsersByGroupName from "@/identity/users/services/getUsersByGroupName";
import PreviousTaskReferrer from "@/inspection/flows/_module/referrer/PreviousTaskReferrer";
import getGoodsInspectionFieldById from "@/inspection/goodsInspectionFields/services/getGoodsInspectionFieldById";
import { caseType, CaseType } from "@/inspection/models/CaseType";
import { PreviousTask } from "@/inspection/models/PreviousTask";
import { initiateInspectionProcess } from "@/inspection/services/initiateInspectionProcess";
import { messages } from "@/messages";
import { formatString } from "@/utils/string/formatString";

import { GoodsCustomTariffNosList } from "../../components/GoodsCustomTariffNos/GoodsCustomTariffNosList";
import { GoodsDescriptionsList } from "../../components/GoodsDescriptions/GoodsDescriptionsList";
import {
  Assignees,
  assigneesTemplate,
  AssigneeType,
} from "../../models/Assignee";
import { ids } from "../../models/Ids";
import {
  inspectionMethod,
  InspectionMethod,
} from "../../models/InspectionMethod";
import { processType, ProcessType } from "../../models/ProcessType";
import { ReviewStatus, reviewStatusOptions } from "./ReviewStatus";

const schema = z.object({
	[ids.previousTask]: z.custom<PreviousTask>(),
	[ids.assignees]: z.custom<Partial<Assignees>>(),
	[ids.informationReviewStatus]: z.custom<ReviewStatus>(),
	[ids.informationReviewNote]: z.string(),
	[ids.inspectionInstanceId]: z.string().nullable(),
	[ids.inspectionCaseNo]: z.string().nullable(),
});

type FormData = z.infer<typeof schema>;

function PhasePage() {
	const { identity } = useLoggedInUser();
	const { task, hooks } = useTaskContext();

	const { control, watch } = useFormContext<FormData>();

	const {
		[ids.informationReviewStatus]: reviewStatus,
		[ids.assignees]: { coordinator, marketer, expert, inspectionCoordinator },
	} = watch();

	const isPositiveStatus =
		typeof reviewStatus === "undefined" ||
		reviewStatus === ReviewStatus.Forward;
	const isNegativeStatus = reviewStatus === ReviewStatus.Return;

	const [inspectionCoordinators, setInspectionCoordinators] = useState<
		UserLookup[]
	>([]);

	const defaultCosts = useMemo(() => {
		const costs: CreateCostModel[] = [];

		costs.push({
			caseId: task.instanceId,
			caseNo: task.caseNo,
			categoryKey: "customer",
			personId: task.data[ids.assignees][AssigneeType.Customer].id,
			personName: task.data[ids.assignees][AssigneeType.Customer].name,
			period: CostPeriod.AfterReceive,
			options: { service: "liaison" },
		});

		if (task.data[ids.branch]) {
			costs.push({
				caseId: task.instanceId,
				caseNo: task.caseNo,
				categoryKey: "agency",
				personId: task.data[ids.branch].managerId,
				personName: task.data[ids.branch].managerName,
				period: CostPeriod.AfterReceive,
				options: { service: "agency" },
			});
		}

		if (task.data[ids.assignees][AssigneeType.Marketer]) {
			costs.push({
				caseId: task.instanceId,
				caseNo: task.caseNo,
				categoryKey: "marketer",
				personId: task.data[ids.assignees][AssigneeType.Marketer].id,
				personName: task.data[ids.assignees][AssigneeType.Marketer].name,
				type: CostType.Percentage,
				method: CostMethod.Remaining,
				amount: "4.5",
				period: CostPeriod.AfterReceive,
			});
		}

		if (task.data[ids.assignees][AssigneeType.Coordinator]) {
			costs.push({
				caseId: task.instanceId,
				caseNo: task.caseNo,
				categoryKey: "coordinator",
				personId: task.data[ids.assignees][AssigneeType.Coordinator].id,
				personName: task.data[ids.assignees][AssigneeType.Coordinator].name,
				type: CostType.Percentage,
				method: CostMethod.Remaining,
				amount: "0.5",
				period: CostPeriod.AfterReceive,
			});
		}

		if (task.data[ids.caseType] === CaseType.Official) {
			costs.push({
				caseId: task.instanceId,
				caseNo: task.caseNo,
				categoryKey: "insurance",
				type: CostType.Percentage,
				method: CostMethod.Total,
				amount: "16.67",
				period: CostPeriod.Any,
			});
		}

		return costs;
	}, [task.caseNo, task.data, task.instanceId]);

	useEffect(() => {
		(async () => {
			const users = await getUsersByGroupName("inspection-coordinator");
			setInspectionCoordinators(
				users.map((user) => ({ id: user.id, name: user.fullname })),
			);
		})();
	}, []);

	useEffect(() => {
		hooks.registerHook(
			"pre-submit",
			async ({ task, data }: { task: Task; data: FormData }) => {
				// set assignee:manager
				data[ids.assignees][AssigneeType.Manager] = {
					id: identity.id,
					name: identity.fullname,
				};

				// set previous task
				data[ids.previousTask] = {
					taskKey: task.key,
					assigneeKey: AssigneeType.Manager,
					assigneeTitle: assigneesTemplate[AssigneeType.Manager],
					noteContent:
						data[ids.informationReviewStatus] === ReviewStatus.Forward
							? ""
							: data[ids.informationReviewNote],
					noteType:
						data[ids.informationReviewStatus] === ReviewStatus.Forward
							? "info"
							: "danger",
				};

				// rewrite invoice payment status
				if (isFieldInTaskForm(task, ids.invoicePaymentStatus)) {
					const instance = await getInstances({
						filters: [{ name: "_id", value: task.instanceId }],
						props: [ids.invoicePaymentStatus],
					}).then((instances) => instances[0]);

					(data as any)[ids.invoicePaymentStatus] =
						instance.parameters[ids.invoicePaymentStatus];
				}

				if (data[ids.informationReviewStatus] === ReviewStatus.Forward) {
					// verify and prepare inspection process
					if (!data[ids.inspectionInstanceId]) {
						let inspectionInstanceId = null;
						let inspectionCaseNo = null;

						if (data[ids.assignees][AssigneeType.InspectionCoordinator]) {
							const createdInstance = await initiateInspectionProcess({
								InspectionCaseNo: task.caseNo,
								InspectionInstanceId: task.instanceId,
								InspectionType: "source",
								InspectionExpert:
									data[ids.assignees][AssigneeType.InspectionCoordinator]!.id,
								InspectionExpertName:
									data[ids.assignees][AssigneeType.InspectionCoordinator]!.name,
								BuyerName: task.data[ids.buyer].name,
								DescriptionOfGoods: (task.data[ids.goodsDescriptions] as string)
									.split(",")
									.map((x) => x.trim()),
								FieldOfGoods:
									getGoodsInspectionFieldById(task.data[ids.goodsField])
										?.title || "",
								ProformaNo: task.data[ids.proformaNo],
								ProformaDate: task.data[ids.proformaDate],
								DischargerName: "",
								DischargerPhoneNo: "",
								CustomName: null,
								InspectionMethod: task.data[ids.inspectionMethod],
							});

							inspectionInstanceId = createdInstance.id;
							inspectionCaseNo = createdInstance.caseNo;
						}

						data[ids.inspectionInstanceId] = inspectionInstanceId;
						data[ids.inspectionCaseNo] = inspectionCaseNo;
					}
				}
			},
		);

		hooks.registerHook(
			"submit",
			async ({ task, data }: { task: Task; data: FormData }) => {
				// update watchers
				await addWatcherToInstance(task.instanceId, identity.id);

				// set stage
				await setStageOfInstance(
					task.instanceId,
					data[ids.informationReviewStatus] === ReviewStatus.Forward
						? "completed"
						: "information-form",
				);
			},
		);

		return () => hooks.removeAll();
	}, [hooks, identity]);

	return (
		<div className="grid grid-cols-12 gap-x-4 gap-y-6 md:gap-x-10">
			<PreviousTaskReferrer />

			<Separator className="col-span-full h-1" />

			<FormItem className="col-span-full !col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
				<FormLabel>نوع فرایند:</FormLabel>
				<FormControl>
					<Input
						disabled
						value={
							processType[task.data[ids.processType] as ProcessType]?.title
						}
					/>
				</FormControl>
			</FormItem>

			<FormItem className="col-span-full !col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
				<FormLabel>روش بازرسی:</FormLabel>
				<FormControl>
					<Input
						disabled
						value={
							inspectionMethod[
								task.data[ids.inspectionMethod] as InspectionMethod
							]?.title
						}
					/>
				</FormControl>
			</FormItem>

			{task.data[ids.branch] && (
				<FormItem className="col-span-full !col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
					<FormLabel>شعبه:</FormLabel>
					<FormControl>
						<Input
							disabled
							value={formatString(
								task.data[ids.branch].managerName ? "{0} ({1})" : "{0}",
								task.data[ids.branch].name,
								task.data[ids.branch].managerName,
							)}
						/>
					</FormControl>
				</FormItem>
			)}

			<FormItem className="col-span-full !col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
				<FormLabel>مشتری:</FormLabel>
				<FormControl>
					<Input
						disabled
						value={task.data[ids.assignees][AssigneeType.Customer]?.name}
					/>
				</FormControl>
			</FormItem>

			<FormItem className="col-span-full !col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
				<FormLabel>هماهنگ کننده:</FormLabel>
				<FormControl>
					<Input disabled value={coordinator?.name || "-"} />
				</FormControl>
			</FormItem>

			<FormItem className="col-span-full !col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
				<FormLabel>بازاریاب:</FormLabel>
				<FormControl>
					<Input disabled value={marketer?.name || "-"} />
				</FormControl>
			</FormItem>

			<FormItem className="col-span-full !col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
				<FormLabel>نوع درخواست:</FormLabel>
				<FormControl>
					<Input
						disabled
						value={caseType[task.data[ids.caseType] as CaseType] ?? "-"}
					/>
				</FormControl>
			</FormItem>

			<Separator className="col-span-full h-1" />

			<FormItem className="col-span-full !col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
				<FormLabel>خریدار:</FormLabel>
				<FormControl>
					<Input disabled value={task.data[ids.buyer]?.name ?? "-"} />
				</FormControl>
			</FormItem>

			<FormItem className="col-span-full !col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
				<FormLabel>خریدار (نام انگلیسی):</FormLabel>
				<FormControl>
					<Input disabled value={task.data[ids.buyer]?.nameEn ?? "-"} />
				</FormControl>
				<FormMessage />
			</FormItem>

			<FormItem className="col-span-full !col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
				<FormLabel>فروشنده:</FormLabel>
				<FormControl>
					<Input
						className="rtl:text-right"
						dir="ltr"
						disabled
						value={task.data[ids.seller] || "-"}
					/>
				</FormControl>
			</FormItem>

			<Separator className="col-span-full h-1" />

			<FormItem className="col-span-full !col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
				<FormLabel>شماره پروفرما:</FormLabel>
				<FormControl>
					<Input
						className="rtl:text-right"
						dir="ltr"
						disabled
						value={task.data[ids.proformaNo] || "-"}
					/>
				</FormControl>
			</FormItem>

			<FormItem className="col-span-full !col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
				<FormLabel>تاریخ پروفرما:</FormLabel>
				<FormControl>
					<Input
						className="rtl:text-right"
						dir="ltr"
						disabled
						value={task.data[ids.proformaDate] || "-"}
					/>
				</FormControl>
			</FormItem>

			<FormItem className="col-span-full !col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
				<FormLabel>مبلغ پروفرما / فاکتور (یورو):</FormLabel>
				<FormControl>
					{task.data[ids.proformaOrInvoicePrice] ? (
						<Input disabled value={"-"} />
					) : (
						<MaskInput
							className="rtl:text-right"
							dir="ltr"
							disabled
							mapToRadix={["."]}
							mask={Number}
							radix="."
							scale={2}
							thousandsSeparator=","
							value={task.data[ids.proformaOrInvoicePrice]}
							unmask
						/>
					)}
				</FormControl>
			</FormItem>

			<Separator className="col-span-full h-1" />

			<GoodsCustomTariffNosList />

			<GoodsDescriptionsList />

			<FormItem className="col-span-full !col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
				<FormLabel>نوع کالاها:</FormLabel>
				<FormControl>
					<Input
						disabled
						value={
							getGoodsInspectionFieldById(task.data[ids.goodsField])?.title ||
							"-"
						}
					/>
				</FormControl>
			</FormItem>

			<Separator className="col-span-full h-1" />

			<FormItem className="col-span-full !col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
				<FormLabel>کارشناس:</FormLabel>
				<FormControl>
					<Input disabled value={expert?.name || "-"} />
				</FormControl>
			</FormItem>

			<FormField
				control={control}
				name={`${ids.assignees}.${AssigneeType.InspectionCoordinator}`}
				render={({ field }) => (
					<FormItem className="col-span-full !col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
						<FormLabel>هماهنگ کننده بازرسی:</FormLabel>
						<FormControl>
							<Select
								disabled={task.data[ids.inspectionInstanceId]}
								value={field.value?.id ?? ""}
								onValueChange={(value) => {
									const user = inspectionCoordinators.find(
										(x) => x.id === value,
									);
									if (user) {
										field.onChange(user);
									}
								}}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{inspectionCoordinators.map((x) => (
										<SelectItem key={x.id} value={x.id}>
											{x.name}
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

			<FinancialsWidget defaultCosts={defaultCosts} />

			<Separator className="col-span-full h-1" />

			<FormItem className="col-span-full !col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
				<FormLabel>محل بازرسی:</FormLabel>
				<FormControl>
					<Input
						className="rtl:text-right"
						dir="ltr"
						disabled
						value={task.data[ids.inspectionPlace] || "-"}
					/>
				</FormControl>
				<FormMessage />
			</FormItem>

			<FormItem className="col-span-full !col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
				<FormLabel>تاریخ بازرسی:</FormLabel>
				<FormControl>
					<Input
						className="rtl:text-right"
						dir="ltr"
						disabled
						value={task.data[ids.inspectionDate] || "-"}
					/>
				</FormControl>
				<FormMessage />
			</FormItem>

			<Separator className="col-span-full h-1" />

			<FormField
				control={control}
				name={ids.informationReviewStatus}
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

			<FormField
				control={control}
				name={ids.informationReviewNote}
				render={({ field }) => (
					<FormItem className="col-span-full">
						<FormLabel>توضیحات:</FormLabel>
						<FormControl>
							<Textarea className="min-h-48" {...field} />
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
				rules={{ required: isNegativeStatus && messages.validation.required }}
			/>
		</div>
	);
}

const PhaseEntry = { schema, render: <PhasePage /> };

export default PhaseEntry;
