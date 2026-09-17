"use client";

import { useEffect, useMemo, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { z } from "zod";

import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import { Button } from "@/components/ui/button";
import { customs } from "@/data/customs";
import { transferInstanceFiles } from "@/felo/files/services/transferInstanceFiles";
import { addWatcherToInstance } from "@/felo/instances/services/addWatcherToInstance";
import { getInstances } from "@/felo/instances/services/getInstances";
import { setStageOfInstance } from "@/felo/instances/services/setStageOfInstance";
import { useTaskContext } from "@/felo/tasks/hooks/useTaskContext";
import { Task } from "@/felo/tasks/models/Task";
import { isFieldInTaskData } from "@/felo/tasks/utils/isFieldInTaskData";
import { isFieldInTaskForm } from "@/felo/tasks/utils/isFieldInTaskForm";
import { CostMethod } from "@/financial/costs/enums/CostMethod";
import { CostPeriod } from "@/financial/costs/enums/CostPeriod";
import { CostService } from "@/financial/costs/enums/CostService";
import { CostType } from "@/financial/costs/enums/CostType";
import { CreateCostModel } from "@/financial/costs/services/createCost";
import { FinancialsWidget } from "@/financial/financial/components/task-financials/FinancialsWidget";
import { FieldError } from "@/form/FieldError";
import { Input } from "@/form/Input";
import { Textarea } from "@/form/textarea";
import getUsersByGroupName from "@/identity/users/services/getUsersByGroupName";
import PreviousTaskReferrer from "@/inspection/flows/_module/referrer/PreviousTaskReferrer";
import Referrer from "@/inspection/flows/_module/referrer/Referrer";
import getGoodsInspectionFieldById from "@/inspection/goodsInspectionFields/services/getGoodsInspectionFieldById";
import { CaseType, caseType } from "@/inspection/models/CaseType";
import { initiateInspectionProcess } from "@/inspection/services/initiateInspectionProcess";
import { messages } from "@/messages";
import { GenericObject } from "@/ts/GenericObject";
import Select from "@/ui/Select/Select";
import { Seperator } from "@/ui/Seperator";
import { compareById } from "@/utils/Comparators";

import {
  Assignee,
  assigneesTemplate,
  AssigneeType,
} from "../../models/Assignee";
import { ids } from "../../models/Ids";
import {
  inspectionMethod,
  InspectionMethod,
} from "../../models/InspectionMethod";
import { reviewOptions } from "./PhaseData";
import { schema } from "./PhaseSchema";

type FormData = z.infer<typeof schema>;

export function PhasePage() {
	const { identity } = useLoggedInUser();

	const { task, hooks, dispatch } = useTaskContext();

	const { control, register, watch } = useFormContext<FormData>();

	const fields = watch();

	const {
		[ids.assignees]: { technicalExpert, seniorExpert, technicalManager },
	} = fields;

	const { [ids.informationReviewStatus]: reviewStatus } = fields;

	const [inspectionCoordinators, setInspectionCoordinators] = useState<
		Assignee[]
	>([]);
	const [experts, setExperts] = useState<Assignee[]>();
	const [techManagers, setTechManagers] = useState<Assignee[]>();

	const [defaultCosts, setDefaultCosts] = useState<CreateCostModel[]>([]);
	const [defaultCostDynamics, setDefaultCostDynamics] = useState<
		Partial<GenericObject<Assignee>>
	>({
		[CostService.TechExpert]:
			task.data[ids.assignees][AssigneeType.TechnicalExpert],
		[CostService.SeniorExpert]:
			task.data[ids.assignees][AssigneeType.SeniorExpert],
		[CostService.TechManager]:
			task.data[ids.assignees][AssigneeType.TechnicalManager],
	});

	function handleDefaultCostDynamicsChange() {
		setDefaultCostDynamics({
			[CostService.TechExpert]: technicalExpert,
			[CostService.SeniorExpert]: seniorExpert,
			[CostService.TechManager]: technicalManager,
		});
	}

	useEffect(() => {
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

		Object.keys(defaultCostDynamics).forEach((k) => {
			const entity = defaultCostDynamics[k];

			if (entity) {
				costs.push({
					caseId: task.instanceId,
					caseNo: task.caseNo,
					categoryKey: k,
					personId: entity.id,
					personName: entity.name,
					period: CostPeriod.AfterReceive,
					options: { service: "personnel", role: k },
				});
			}
		});

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

		setDefaultCosts(costs);
	}, [defaultCostDynamics, task.caseNo, task.data, task.instanceId]);

	const isReviewStatusPositive = useMemo(() => {
		return reviewStatus === "approve";
	}, [reviewStatus]);

	const isReviewStatusNegative = useMemo(() => {
		return (
			reviewStatus === "return-coordinator" ||
			reviewStatus === "return-admin" ||
			reviewStatus === "cancel"
		);
	}, [reviewStatus]);

	useEffect(() => {
		dispatch({ type: "update", options: { saveBtn: true } });
	}, [dispatch]);

	useEffect(() => {
		register(ids.assignees);
	}, [register]);

	useEffect(() => {
		(async () => {
			setExperts(
				await getUsersByGroupName("coi-expert").then((users) =>
					users.map((x) => {
						return { id: x.id, name: x.fullname };
					}),
				),
			);
		})();

		(async () => {
			const users = await getUsersByGroupName("inspection-coordinator");
			setInspectionCoordinators(
				users.map((user) => ({ id: user.id, name: user.fullname })),
			);
		})();
	}, []);

	useEffect(() => {
		(async () => {
			setTechManagers(
				await getUsersByGroupName("coi-manager").then((users) =>
					users.map((x) => {
						return { id: x.id, name: x.fullname };
					}),
				),
			);
		})();
	}, []);

	useEffect(() => {
		if (hooks.get().length === 0) {
			hooks.registerHook(
				"pre-submit",
				async ({ task, data }: { task: Task; data: FormData }) => {
					// set assignees
					if (!data[ids.assignees][AssigneeType.Manager]) {
						const { id, fullname: name } = identity;
						data[ids.assignees][AssigneeType.Manager] = {
							id,
							name,
						};
					}

					// set previous task
					data[ids.previousTask] = {
						taskKey: task.key,
						assigneeKey: AssigneeType.Manager,
						assigneeTitle: assigneesTemplate[AssigneeType.Manager],
						noteContent: data[ids.informationReviewNote],
						noteType:
							data[ids.informationReviewStatus] === "approve"
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

					if (data[ids.informationReviewStatus] === "approve") {
						// create inspection instance
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
									InspectionType: "coi",
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
											?.title || "",
									ProformaNo: task.data[ids.proformaNo],
									ProformaDate: task.data[ids.proformaDate],
									DischargerName: task.data[ids.dischargerName] || "",
									DischargerPhoneNo: task.data[ids.dischargerPhoneNo] || "",
									CustomName: task.data[ids.customName],
									InspectionMethod: task.data[ids.inspectionMethod],
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
					if (data[ids.informationReviewStatus] === "approve") {
						await Promise.allSettled([
							setStageOfInstance(task.instanceId, "certificate-issuance"),
							addWatcherToInstance(
								task.instanceId,
								data[ids.assignees][AssigneeType.Admin]?.id ?? "",
							),
						]);
					} else {
						await setStageOfInstance(task.instanceId, "information-filling");
					}
				},
			);
		}
	}, [hooks, identity]);

	return (
		<>
			<div className="grid grid-cols-12 gap-x-4 gap-y-6 md:gap-x-10">
				{task.data[ids.previousTask] ? (
					<PreviousTaskReferrer />
				) : (
					<Referrer
						assigneeKey={AssigneeType.Admin}
						noteId={ids.informationFormByAdminNote}
					/>
				)}

				<Seperator className="mt-5" />

				{task.data[ids.inspectionMethod] && (
					<>
						<div className="col-span-full !col-start-1 space-y-2 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
							<label>روش بازرسی:</label>
							<Input
								defaultValue={
									inspectionMethod[
										task.data[ids.inspectionMethod] as InspectionMethod
									]
								}
								disabled
							/>
						</div>

						<Seperator className="mt-5" />
					</>
				)}

				<div className="col-span-full !col-start-1 space-y-2 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
					<label>نوع درخواست:</label>
					<Input
						defaultValue={caseType[task.data[ids.caseType] as CaseType]}
						disabled
					/>
				</div>

				<div className="col-span-full !col-start-1 space-y-2 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
					<label>مشتری:</label>
					<Input
						defaultValue={task.data[ids.assignees][AssigneeType.Customer].name}
						disabled
					/>
				</div>

				<Seperator className="mt-5" />

				<div className="col-span-full !col-start-1 space-y-2 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
					<label>خریدار:</label>
					<Input defaultValue={task.data[ids.buyer].name} disabled />
				</div>

				<Seperator className="mt-5" />

				<div className="col-span-full !col-start-1 space-y-2 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
					<label>گمرک:</label>
					<Input
						defaultValue={
							customs.find((x) => x.value === task.data[ids.customName])?.label
						}
						disabled
					/>
				</div>

				<div className="col-span-full !col-start-1 space-y-2 md:col-span-10 lg:col-span-8 xl:col-span-6">
					<label>شرح کالاها:</label>
					<Input defaultValue={task.data[ids.goodsDescriptions]} disabled />
				</div>

				<div className="col-span-full !col-start-1 space-y-2 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
					<label>نوع کالاها:</label>
					<Input
						defaultValue={
							getGoodsInspectionFieldById(task.data[ids.goodsField])?.title
						}
						disabled
					/>
				</div>

				<Seperator className="mt-5" />

				<div className="col-span-full !col-start-1 space-y-2 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
					<label>نام ترخیص کار:</label>
					<Input defaultValue={task.data[ids.dischargerName]} disabled />
				</div>

				<div className="col-span-full !col-start-1 space-y-2 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
					<label>شماره تماس ترخیص کار:</label>
					<div>
						<Input defaultValue={task.data[ids.dischargerPhoneNo]} disabled />
					</div>
				</div>

				<Seperator className="mt-5" />

				<div className="col-span-full !col-start-1 space-y-2 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
					<label>کشور مبدأ:</label>
					<Input
						className="text-right"
						defaultValue={task.data[ids.countryOfOrigin]}
						dir="ltr"
						disabled
					/>
				</div>

				<div className="col-span-full !col-start-1 space-y-2 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
					<label>محل بازرسی:</label>
					<Input
						className="text-right"
						defaultValue={task.data[ids.inspectionPlace]}
						dir="ltr"
						disabled
					/>
				</div>

				<Seperator className="mt-5" />

				<div className="col-span-full !col-start-1 space-y-2 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
					<label>هماهنگ کننده:</label>
					<Input
						defaultValue={
							task.data[ids.assignees][AssigneeType.Coordinator]?.name ?? "-"
						}
						disabled
					/>
				</div>

				<div className="col-span-full !col-start-1 space-y-2 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
					<label>ادمین:</label>
					<Input
						defaultValue={task.data[ids.assignees][AssigneeType.Admin]?.name}
						disabled
					/>
				</div>

				<div className="col-span-full !col-start-1 space-y-2 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
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
						rules={{}}
					/>
				</div>

				<div className="col-span-full !col-start-1 space-y-2 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
					<label htmlFor={`${ids.assignees}.TechnicalExpert`}>
						کارشناس فنی:
					</label>
					<Controller
						control={control}
						name={`${ids.assignees}.${AssigneeType.TechnicalExpert}`}
						render={({ field, fieldState }) => (
							<>
								<Select
									compareFn={compareById}
									items={
										experts?.map((x) => ({
											label: x.name,
											value: { ...x },
										})) ?? []
									}
									{...field}
								/>
								<FieldError error={fieldState.error} />
							</>
						)}
						rules={{
							required: isReviewStatusPositive && messages.validation.required,
						}}
					/>
				</div>

				{task.data[ids.inspectionMethod] !== InspectionMethod.TechnicalSpec && (
					<div className="col-span-full !col-start-1 space-y-2 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
						<label htmlFor={`${ids.assignees}.SeniorExpert`}>
							کارشناس ارشد:
						</label>
						<Controller
							control={control}
							name={`${ids.assignees}.${AssigneeType.SeniorExpert}`}
							render={({ field, fieldState }) => (
								<>
									<Select
										compareFn={compareById}
										items={
											experts?.map((x) => ({
												label: x.name,
												value: { ...x },
											})) ?? []
										}
										{...field}
									/>
									<FieldError error={fieldState.error} />
								</>
							)}
							rules={{
								required:
									isReviewStatusPositive && messages.validation.required,
							}}
						/>
					</div>
				)}

				<div className="col-span-full !col-start-1 space-y-2 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
					<label htmlFor={`${ids.assignees}.TechnicalManager`}>مدیر فنی:</label>
					<Controller
						control={control}
						name={`${ids.assignees}.${AssigneeType.TechnicalManager}`}
						render={({ field, fieldState }) => (
							<>
								<Select
									compareFn={compareById}
									items={
										techManagers?.map((x) => ({
											label: x.name,
											value: { ...x },
										})) ?? []
									}
									{...field}
								/>
								<FieldError error={fieldState.error} />
							</>
						)}
						rules={{
							required: isReviewStatusPositive && messages.validation.required,
						}}
						shouldUnregister
					/>
				</div>

				<div className="col-span-full !col-start-1 space-y-2 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
					<Button type="button" onClick={handleDefaultCostDynamicsChange}>
						اعمال در جدول هزینه ها
					</Button>
				</div>

				<Seperator className="mt-5" />

				{isFieldInTaskData(task, ids.numOfInspectionDays) && (
					<div className="col-span-full !col-start-1 space-y-2 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
						<label>تعداد روزهای بازرسی:</label>
						<Input defaultValue={task.data[ids.numOfInspectionDays]} disabled />
					</div>
				)}

				<FinancialsWidget defaultCosts={defaultCosts} />

				<Seperator className="mt-5" />

				<div className="col-span-full !col-start-1 space-y-2 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
					<label htmlFor={ids.informationReviewStatus}>نتیجه بررسی:</label>
					<Controller
						control={control}
						name={ids.informationReviewStatus}
						render={({ field, fieldState }) => (
							<>
								<Select items={reviewOptions} {...field} />
								<FieldError error={fieldState.error} />
							</>
						)}
						rules={{
							deps: [ids.informationReviewNote, ids.assignees],
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
							required: isReviewStatusNegative && messages.validation.required,
						}}
					/>
				</div>
			</div>
		</>
	);
}
