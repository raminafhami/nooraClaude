"use client";

import moment from "jalali-moment";
import { useEffect, useMemo, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { FaInfoCircle } from "react-icons/fa";
import { z } from "zod";

import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { transferInstanceFiles } from "@/felo/files/services/transferInstanceFiles";
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
import { FieldError } from "@/form/FieldError";
import { Input } from "@/form/Input";
import { Select } from "@/form/select";
import { Textarea } from "@/form/textarea";
import getUsersByGroupName from "@/identity/users/services/getUsersByGroupName";
import getGoodsInspectionFieldById from "@/inspection/goodsInspectionFields/services/getGoodsInspectionFieldById";
import { CaseType, caseType } from "@/inspection/models/CaseType";
import { initiateInspectionProcess } from "@/inspection/services/initiateInspectionProcess";
import { messages } from "@/messages";
import { Seperator } from "@/ui/Seperator";
import { compareById } from "@/utils/Comparators";

import { Assignee, AssigneeType } from "../../models/Assignee";
import {
	ContractAttachmentStatus,
	contractAttachmentStatus,
} from "../../models/ContractAttachmentStatus";
import { ids } from "../../models/Ids";
import {
	InformationReviewStatus,
	informationReviewStatuses,
} from "../../models/InformationReviewStatus";
import { EmployerObligationsList } from "../_components/EmployerObligations/EmployerObligationsList";
import { GoodsDescriptionsList } from "../_components/GoodsDescriptions/GoodsDescriptionsList";
import { InspectorObligationsList } from "../_components/InspectorObligations/InspectorObligationsList";
import { ObligationsFulfillmentClausesList } from "../_components/ObligationsFulfillmentClauses/ObligationsFulfillmentClausesList";
import { schema } from "./PhaseSchema";

type FormData = z.infer<typeof schema>;

export function PhasePage() {
	const { identity } = useLoggedInUser();

	const { task, hooks } = useTaskContext();

	const { control, register, watch } = useFormContext<FormData>();
	const fields = watch();

	const { [ids.informationReviewStatus]: reviewStatus } = fields;

	const [inspectionCoordinators, setInspectionCoordinators] = useState<
		Assignee[]
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
		register(ids.assignees);
		register(ids.contractIssueDate);
		register(ids.contractIssueNo);
	}, [register]);

	useEffect(() => {
		(async () => {
			const users = await getUsersByGroupName("inspection-coordinator");
			setInspectionCoordinators(
				users.map((user) => ({ id: user.id, name: user.fullname })),
			);
		})();
	}, []);

	useEffect(() => {
		if (!hooks.get().length) {
			hooks.registerHook(
				"pre-submit",
				async ({ task, data }: { task: Task; data: FormData }) => {
					// set assignees
					if (!task.data[ids.assignees][AssigneeType.Manager]) {
						const { id, fullname: name } = identity;
						data[ids.assignees][AssigneeType.Manager] = { id, name };
					}

					// rewrite invoice payment status
					if (isFieldInTaskForm(task, ids.invoicePaymentStatus)) {
						const instance = await getInstances({
							filters: [{ name: "_id", value: task.instanceId }],
							props: [ids.invoicePaymentStatus],
						}).then((instances) => instances[0]);

						(data as any)[ids.invoicePaymentStatus] =
							instance.parameters[ids.invoicePaymentStatus];
					}

					if (
						data[ids.informationReviewStatus] ===
						InformationReviewStatus.Confirm
					) {
						// set contract parameters
						data[ids.contractIssueDate] = moment().format("jYYYY/jMM/jDD");
						data[ids.contractIssueNo] = `${task.caseNo}`;

						// verify and prepare inspection process
						if (data[ids.assignees][AssigneeType.InspectionCoordinator]) {
							const inspectionInstance = await getInstances({
								filters: [
									{ name: "processDefinitionKey", value: "Inspectors" },
									{
										name: "parameters.InspectionInstanceId",
										value: task.instanceId,
									},
								],
							}).then((instances) => instances.at(0));

							if (!inspectionInstance) {
								const createdInstance = await initiateInspectionProcess({
									InspectionCaseNo: task.caseNo,
									InspectionInstanceId: task.instanceId,
									InspectionType: "sc",
									InspectionExpert:
										data[ids.assignees][AssigneeType.InspectionCoordinator]!.id,
									InspectionExpertName:
										data[ids.assignees][AssigneeType.InspectionCoordinator]!
											.name,
									BuyerName: task.data[ids.buyer].name,
									DescriptionOfGoods: (
										task.data[ids.goodsDescriptions] as string
									)
										.split(",")
										.map((x) => x.trim()),
									FieldOfGoods:
										getGoodsInspectionFieldById(task.data[ids.goodsField])
											?.title ?? "",
									ProformaNo: "",
									ProformaDate: "",
									DischargerName: "",
									DischargerPhoneNo: "",
									CustomName: null,
									InspectionMethod: null,
								});

								await transferInstanceFiles({
									sourceInstanceId: task.instanceId,
									destinationInstanceId: createdInstance.id,
									files: [
										{
											sourceFieldName: "packing_list",
											destinationFieldName: "packing_list",
											destinationFolder: "docs",
										},
										{
											sourceFieldName: "warehouse_receipt",
											destinationFieldName: "warehouse_receipt",
											destinationFolder: "docs",
										},
									],
								});

								data[ids.inspectionInstanceId] = createdInstance.id;
								data[ids.inspectionCaseNo] = createdInstance.caseNo;
							} else {
								data[ids.inspectionInstanceId] = inspectionInstance.id;
								data[ids.inspectionCaseNo] = inspectionInstance.caseNo;
							}
						} else {
							data[ids.inspectionInstanceId] = null;
							data[ids.inspectionCaseNo] = null;
						}
					}
				},
			);

			hooks.registerHook("submit", async ({ task, data }) => {
				// add watcher and set stage
				if (
					data[ids.informationReviewStatus] === InformationReviewStatus.Confirm
				) {
					await Promise.all([
						addWatcherToInstance(
							task.instanceId,
							data[ids.assignees][AssigneeType.Coordinator].id,
						),
						setStageOfInstance(task.instanceId, "inspection"),
					]);
				} else {
					await setStageOfInstance(task.instanceId, "information-filling");
				}
			});
		}
	}, [hooks, identity]);

	return (
		<>
			<div className="grid grid-cols-12 gap-x-10 gap-y-6">
				<div className="col-span-3 col-start-1">
					<div>ارجاع دهنده:</div>
					<Input
						className="mt-2"
						defaultValue={task.data[ids.assignees][AssigneeType.Expert].name}
						disabled
					/>
				</div>

				{task.data[ids.informationFormNote] && (
					<div className="col-span-full">
						<Alert variant="info">
							<FaInfoCircle />
							<AlertDescription>
								<div className="font-bold">
									توضیحات کارشناس:{" "}
									{task.data[ids.assignees][AssigneeType.Expert].name}
								</div>
								<div className="whitespace-pre-wrap">
									{task.data[ids.informationFormNote]}
								</div>
							</AlertDescription>
						</Alert>
					</div>
				)}

				<Seperator className="mt-5" />

				<div className="col-span-3 col-start-1">
					<div>نوع درخواست:</div>
					<Input
						className="mt-2"
						defaultValue={caseType[task.data[ids.caseType] as CaseType]}
						disabled
					/>
				</div>

				<div className="col-span-3 col-start-1">
					<label>مشتری:</label>
					<Input
						className="mt-2"
						defaultValue={task.data[ids.assignees][AssigneeType.Customer].name}
						disabled
					/>
				</div>

				<Seperator className="mt-5" />

				<div className="col-span-3 col-start-1">
					<label>خریدار:</label>
					<Input
						className="mt-2"
						defaultValue={task.data[ids.buyer].name}
						disabled
					/>
				</div>

				<Seperator className="mt-5" />

				<div className="col-span-3 col-start-1">
					<div>سازمان مرجع مسئول:</div>
					<Input
						className="mt-2"
						defaultValue={task.data[ids.authorityOrganization]}
						disabled
					/>
				</div>

				<div className="col-span-3">
					<div>شخص مرجع مسئول:</div>
					<Input
						className="mt-2"
						defaultValue={task.data[ids.authorityPerson] || "-"}
						disabled
					/>
				</div>

				<div className="col-span-full col-start-1">
					<div>شرح عملیات نظارتی:</div>
					<div>
						<Textarea
							className="mt-2 min-h-fit"
							defaultValue={task.data[ids.caseOperationDescription]}
							disabled
						/>
					</div>
				</div>

				<div className="col-span-full col-start-1">
					<div>خلاصه عملیات نظارتی:</div>
					<div>
						<Input
							className="mt-2"
							defaultValue={task.data[ids.caseOperationSummary]}
							disabled
						/>
					</div>
				</div>

				<Seperator className="mt-5" />

				<div className="col-span-3 col-start-1">
					<div>شماره کوتاژ:</div>
					<div>
						<Input
							className="mt-2"
							defaultValue={task.data[ids.cottageNo]}
							disabled
						/>
					</div>
				</div>

				<div className="col-span-full col-start-1">
					<div>مکان بازرسی:</div>
					<div>
						<Input
							className="mt-2"
							defaultValue={task.data[ids.inspectionPlace]}
							disabled
						/>
					</div>
				</div>

				<Seperator className="mt-5" />

				<div className="col-span-3 col-start-1">
					<div>تعداد کالاها:</div>
					<div>
						<Input
							className="mt-2"
							defaultValue={task.data[ids.goodsQuantity]}
							disabled
						/>
					</div>
				</div>

				<div className="col-span-3">
					<div>واحد شمارش کالاها:</div>
					<div>
						<Input
							className="mt-2"
							defaultValue={task.data[ids.goodsQuantityUnit]}
							disabled
						/>
					</div>
				</div>

				<GoodsDescriptionsList />

				<div className="col-span-3 col-start-1">
					<div>نوع کالاها:</div>
					<Input
						className="mt-2"
						defaultValue={
							getGoodsInspectionFieldById(task.data[ids.goodsField])?.title ??
							"-"
						}
						disabled
					/>
				</div>

				<Seperator className="mt-5" />

				<div className="col-span-3 col-start-1">
					<div>تاریخ شروع قرارداد:</div>
					<div>
						<Input
							className="mt-2"
							defaultValue={task.data[ids.contractStartDate]}
							disabled
						/>
					</div>
				</div>

				<div className="col-span-3">
					<div>تاریخ پایان قرارداد:</div>
					<div>
						<Input
							className="mt-2"
							defaultValue={task.data[ids.contractEndDate]}
							disabled
						/>
					</div>
				</div>

				<div className="col-span-3">
					<div>مدت زمان قرارداد:</div>
					<div>
						<Input
							className="mt-2"
							defaultValue={task.data[ids.contractDuration]}
							disabled
						/>
					</div>
				</div>

				<Seperator className="mt-5" />

				<div className="col-span-full col-start-1">
					<div>موضوع قرارداد:</div>
					<Input
						className="mt-2"
						defaultValue={task.data[ids.contractSubject]}
						disabled
					/>
				</div>

				<div className="col-span-3 col-start-1">
					<div>وضعیت پیوست قرارداد:</div>
					<Input
						className="mt-2"
						defaultValue={
							contractAttachmentStatus[
								task.data[
									ids.contractAttachmentStatus
								] as ContractAttachmentStatus
							]
						}
						disabled
					/>
				</div>

				<Seperator className="mt-5" />

				<div className="col-span-full">
					<span className="text-sm font-bold">ماده 1: موضوع قرارداد</span>
				</div>

				<div className="col-span-full col-start-1">
					<div>توضیحات ماده:</div>
					<div>
						<Textarea
							className="mt-2 min-h-fit"
							defaultValue={task.data[ids.contractSubjectArticle]}
							disabled
						/>
					</div>
				</div>

				<Seperator className="mt-5" />

				<div className="col-span-full">
					<span className="text-sm font-bold">ماده 4: تعهدات کارفرما</span>
				</div>

				<EmployerObligationsList />

				<Seperator className="mt-5" />

				<div className="col-span-full">
					<span className="text-sm font-bold">ماده 5: تعهدات بازرس</span>
				</div>

				<InspectorObligationsList />

				<Seperator className="mt-5" />

				<div className="col-span-full">
					<span className="text-sm font-bold">
						ماده 6: انجام تعهدات قرارداد
					</span>
				</div>

				<div className="col-span-full col-start-1">
					<div>توضیحات ماده:</div>
					<div>
						<Textarea
							className="mt-2 min-h-fit"
							defaultValue={
								task.data[ids.contractObligationsFulfillmentArticle]
							}
							disabled
						/>
					</div>
				</div>

				<ObligationsFulfillmentClausesList />

				<Seperator className="mt-5" />

				<div className="col-span-3 col-start-1">
					<label
						htmlFor={`${ids.assignees}.${AssigneeType.InspectionCoordinator}`}
					>
						هماهنگ کننده بازرسی:
					</label>
					<div className="mt-2">
						<Controller
							control={control}
							name={`${ids.assignees}.${AssigneeType.InspectionCoordinator}`}
							render={({
								field: { name, value, onBlur, onChange },
								fieldState: { error },
							}) => (
								<>
									<Select<Assignee>
										id={name}
										items={inspectionCoordinators.map((x) => {
											return {
												label: x.name,
												value: { id: x.id, name: x.name },
											};
										})}
										value={value}
										onCompare={compareById}
										onLeave={onBlur}
										onMutate={onChange}
									/>
									<FieldError error={error} />
								</>
							)}
							rules={{
								required:
									reviewStatus === "approve" && messages.validation.required,
							}}
						/>
					</div>
				</div>

				<Seperator className="mt-5" />

				<FinancialsWidget defaultCosts={defaultCosts} />

				<Seperator className="mt-5" />

				<div className="col-span-3">
					<label htmlFor={ids.informationReviewStatus}>نتیجه بررسی:</label>
					<div className="mt-2">
						<Controller
							control={control}
							name={ids.informationReviewStatus}
							render={({
								field: { name, value, onBlur, onChange },
								fieldState: { error },
							}) => (
								<>
									<Select
										id={name}
										items={informationReviewStatuses}
										value={value}
										onLeave={onBlur}
										onMutate={onChange}
									/>
									<FieldError error={error} />
								</>
							)}
							rules={{
								deps: [
									`${ids.assignees}.${AssigneeType.InspectionCoordinator}`,
									ids.informationReviewNote,
								],
								required: messages.validation.required,
							}}
						/>
					</div>
				</div>

				<div className="col-span-full space-y-2">
					<label htmlFor={ids.informationReviewNote}>توضیحات بررسی:</label>
					<Controller
						control={control}
						name={ids.informationReviewNote}
						render={({ field, fieldState: { error } }) => (
							<>
								<Textarea id={field.name} {...field} />
								<FieldError error={error} />
							</>
						)}
						rules={{
							required:
								reviewStatus === "return" && messages.validation.required,
						}}
					/>
				</div>
			</div>
		</>
	);
}
