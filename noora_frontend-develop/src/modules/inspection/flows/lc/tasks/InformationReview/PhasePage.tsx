"use client";

import { useEffect, useMemo, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { z } from "zod";

import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import { banks } from "@/data/banks";
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
import { Textarea } from "@/form/textarea";
import getUsersByGroupName from "@/identity/users/services/getUsersByGroupName";
import Referrer from "@/inspection/flows/_module/referrer/Referrer";
import getGoodsInspectionFieldById from "@/inspection/goodsInspectionFields/services/getGoodsInspectionFieldById";
import { CaseType, caseType } from "@/inspection/models/CaseType";
import { initiateInspectionProcess } from "@/inspection/services/initiateInspectionProcess";
import { messages } from "@/messages";
import { PriceInput } from "@/ui/MaskInput/PriceInput";
import Select from "@/ui/Select/Select";
import { Seperator } from "@/ui/Seperator";
import { compareById } from "@/utils/Comparators";

import {
  Assignee,
  assigneesTemplate,
  AssigneeType,
} from "../../models/Assignee";
import { ids } from "../../models/Ids";
import { reviewStatuses } from "../../models/ReviewStatus";
import { GoodsDescriptionsList } from "../_components/GoodsDescriptionsList";
import { schema } from "./PhaseSchema";

type FormData = z.infer<typeof schema>;

export function PhasePage() {
	const { identity } = useLoggedInUser();

	const { task, hooks } = useTaskContext();

	const { control, register, setValue, watch } = useFormContext<FormData>();
	const fields = watch();

	const { [ids.informationReviewStatus]: reviewStatus } = fields;

	const [experts, setExperts] = useState<Assignee[]>([]);
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
	}, [register]);

	useEffect(() => {
		(async () => {
			const users = await getUsersByGroupName("ic-expert");
			setExperts(users.map((user) => ({ id: user.id, name: user.fullname })));
		})();

		(async () => {
			const users = await getUsersByGroupName("inspection-coordinator");
			setInspectionCoordinators(
				users.map((user) => ({ id: user.id, name: user.fullname })),
			);
		})();
	}, []);

	useEffect(() => {
		const expert = task.data[ids.assignees]?.[AssigneeType.Expert];
		const technicalExpert =
			task.data[ids.assignees]?.[AssigneeType.TechnicalExpert];
		if (!technicalExpert) {
			setValue(`${ids.assignees}.${AssigneeType.TechnicalExpert}`, expert, {
				shouldDirty: true,
				shouldTouch: true,
				shouldValidate: true,
			});
		}
	}, [task.data, setValue]);

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

					if (data[ids.informationReviewStatus] === "confirm") {
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
									InspectionType: "lc",
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
									ProformaNo: task.data[ids.proformaNo],
									ProformaDate: task.data[ids.proformaDate],
									DischargerName: task.data[ids.dischargerName] || null,
									DischargerPhoneNo: task.data[ids.dischargerPhoneNo] || null,
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

			hooks.registerHook(
				"submit",
				async ({ task, data }: { task: Task; data: FormData }) => {
					if (data[ids.informationReviewStatus] === "confirm") {
						await Promise.all([
							data[ids.assignees][AssigneeType.TechnicalExpert] &&
								addWatcherToInstance(
									task.instanceId,
									data[ids.assignees][AssigneeType.TechnicalExpert]!.id,
								),
							setStageOfInstance(task.instanceId, "inspection"),
						]);

						if (task.data[ids.assignees][AssigneeType.InspectionCoordinator]) {
							await addWatcherToInstance(
								task.instanceId,
								data[ids.assignees][AssigneeType.InspectionCoordinator]!.id,
							);
						}
					} else {
						await setStageOfInstance(task.instanceId, "information-filling");
					}
				},
			);
		}
	}, [hooks, identity]);

	return (
		<>
			<div className="grid grid-cols-12 gap-x-10 gap-y-6">
				{task.data[ids.certificateFormStatus] ? (
					<Referrer
						assigneeKey={AssigneeType.TechnicalExpert}
						noteId={ids.certificateFormNote}
						noteType="danger"
						title={assigneesTemplate[AssigneeType.TechnicalExpert]}
					/>
				) : (
					<Referrer
						assigneeKey={AssigneeType.Expert}
						noteId={ids.informationFormNote}
						title={assigneesTemplate[AssigneeType.Expert]}
					/>
				)}

				<Seperator className="mt-5" />

				<div className="col-span-3 col-start-1 space-y-2">
					<div>نوع درخواست:</div>
					<Input
						defaultValue={caseType[task.data[ids.caseType] as CaseType]}
						disabled
					/>
				</div>

				<div className="col-span-3 col-start-1 space-y-2">
					<label>مشتری:</label>
					<Input
						defaultValue={task.data[ids.assignees][AssigneeType.Customer].name}
						disabled
					/>
				</div>

				<Seperator className="mt-5" />

				<div className="col-span-3 col-start-1 space-y-2">
					<label>خریدار:</label>
					<Input defaultValue={task.data[ids.buyer].name} disabled />
				</div>

				<Seperator className="mt-5" />

				<div className="col-span-3 col-start-1 space-y-2">
					<div>شماره پیش فاکتور:</div>
					<Input defaultValue={task.data[ids.proformaNo]} disabled />
				</div>

				<div className="col-span-3 col-start-1 space-y-2">
					<div>تاریخ پیش فاکتور:</div>
					<Input defaultValue={task.data[ids.proformaDate]} disabled />
				</div>

				<Seperator className="mt-5" />

				<div className="col-span-3 col-start-1 space-y-2">
					<div>نام بانک گشایش کننده اعتبار:</div>
					<div>
						<Input
							defaultValue={
								banks.find(
									(x) => x.value === task.data[ids.creditOpeningBankName],
								)?.label
							}
							disabled
						/>
					</div>
				</div>

				<div className="col-span-3 col-start-1 space-y-2">
					<div>شعبه بانک گشایش کننده اعتبار:</div>
					<Input
						defaultValue={task.data[ids.creditOpeningBankBranch]}
						disabled
					/>
				</div>

				<Seperator className="mt-5" />

				<GoodsDescriptionsList />

				<div className="col-span-3 col-start-1 space-y-2">
					<div>نوع کالاها:</div>
					<Input
						defaultValue={
							getGoodsInspectionFieldById(task.data[ids.goodsField])?.title ??
							"-"
						}
						disabled
					/>
				</div>

				<Seperator className="mt-5" />

				<div className="col-span-3 col-start-1 space-y-2">
					<div>FOB فاکتور (ریال):</div>
					<PriceInput defaultValue={task.data[ids.invoiceFob]} disabled />
				</div>

				<Seperator className="mt-5" />

				<div className="col-span-3 col-start-1 space-y-2">
					<div>نام ترخیص کار:</div>
					<Input defaultValue={task.data[ids.dischargerName] || "-"} disabled />
				</div>

				<div className="col-span-3 col-start-1 space-y-2">
					<div>شماره تماس ترخیص کار:</div>
					<Input
						defaultValue={task.data[ids.dischargerPhoneNo] || "-"}
						disabled
					/>
				</div>

				<Seperator className="mt-5" />

				<div className="col-span-3 col-start-1 space-y-2">
					<label htmlFor={`${ids.assignees}.${AssigneeType.TechnicalExpert}`}>
						کارشناس:
					</label>
					<Controller
						control={control}
						name={`${ids.assignees}.${AssigneeType.TechnicalExpert}`}
						render={({ field, fieldState }) => (
							<>
								<Select
									compareFn={compareById}
									items={experts.map((x) => {
										return {
											label: x.name,
											value: { id: x.id, name: x.name },
										};
									})}
									{...field}
								/>
								<FieldError error={fieldState.error} />
							</>
						)}
						rules={{
							required:
								reviewStatus === "confirm" && messages.validation.required,
						}}
					/>
				</div>

				<div className="col-span-3 col-start-1 space-y-2">
					<label
						htmlFor={`${ids.assignees}.${AssigneeType.InspectionCoordinator}`}
					>
						هماهنگ کننده بازرسی:
					</label>
					<Controller
						control={control}
						name={`${ids.assignees}.${AssigneeType.InspectionCoordinator}`}
						render={({ field, fieldState }) => (
							<>
								<Select
									compareFn={compareById}
									items={inspectionCoordinators.map((x) => {
										return {
											label: x.name,
											value: { id: x.id, name: x.name },
										};
									})}
									{...field}
								/>
								<FieldError error={fieldState.error} />
							</>
						)}
						rules={{
							required:
								reviewStatus === "confirm" && messages.validation.required,
						}}
					/>
				</div>

				<Seperator className="mt-5" />

				<FinancialsWidget defaultCosts={defaultCosts} />

				<Seperator className="mt-5" />

				<div className="col-span-3 col-start-1 space-y-2">
					<label htmlFor={ids.informationReviewStatus}>نتیجه بررسی:</label>
					<Controller
						control={control}
						name={ids.informationReviewStatus}
						render={({ field, fieldState }) => (
							<>
								<Select items={reviewStatuses} {...field} />
								<FieldError error={fieldState.error} />
							</>
						)}
						rules={{
							deps: [
								`${ids.assignees}.${AssigneeType.TechnicalExpert}`,
								`${ids.assignees}.${AssigneeType.InspectionCoordinator}`,
								ids.informationReviewNote,
							],
							required: messages.validation.required,
						}}
					/>
				</div>

				<div className="col-span-full space-y-2">
					<label htmlFor={ids.informationReviewNote}>توضیحات بررسی:</label>
					<Controller
						control={control}
						name={ids.informationReviewNote}
						render={({ field, fieldState }) => (
							<>
								<Textarea {...field} />
								<FieldError error={fieldState.error} />
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
