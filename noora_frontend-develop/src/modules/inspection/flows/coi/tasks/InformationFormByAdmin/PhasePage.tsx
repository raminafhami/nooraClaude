"use client";

import { useEffect } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { z } from "zod";

import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import { getBranchById } from "@/branches/services/getBranchById";
import { useContractDifference } from "@/contract-number/hooks/useContractDifference";
import { customs } from "@/data/customs";
import { addWatcherToInstance } from "@/felo/instances/services/addWatcherToInstance";
import { getInstanceById } from "@/felo/instances/services/getInstanceById";
import { setStageOfInstance } from "@/felo/instances/services/setStageOfInstance";
import { useTaskCancel } from "@/felo/tasks/hooks/useTaskCancel";
import { useTaskContext } from "@/felo/tasks/hooks/useTaskContext";
import { Task } from "@/felo/tasks/models/Task";
import { isFieldInTaskForm } from "@/felo/tasks/utils/isFieldInTaskForm";
import { createDebts } from "@/financial/debts/services/createDebts";
import { FinancialCategoryType } from "@/financial/financial-category/enums/FinancialCategoryType";
import { getFinancialCategories } from "@/financial/financial-category/services/getFinancialCategories";
import { IncomesWidget } from "@/financial/incomes/components/task-incomes/IncomesWidget";
import { getIncomes } from "@/financial/incomes/services/getIncomes";
import { FieldError } from "@/form/FieldError";
import { Input } from "@/form/Input";
import { Textarea } from "@/form/textarea";
import BuyerSelect from "@/inspection/flows/_module/BuyerSelect";
import CustomerSelect from "@/inspection/flows/_module/CustomerSelect";
import PreviousTaskReferrer from "@/inspection/flows/_module/referrer/PreviousTaskReferrer";
import Referrer from "@/inspection/flows/_module/referrer/Referrer";
import ReferrerNote from "@/inspection/flows/_module/referrer/ReferrerNote";
import getGoodsInspectionFieldOptions from "@/inspection/goodsInspectionFields/services/getGoodsInspectionFieldOptions";
import { useInspectionCancellation } from "@/inspection/hooks/useInspectionCancellation";
import { CaseType, caseType } from "@/inspection/models/CaseType";
import { cancelInspection } from "@/inspection/services/cancelInspection";
import getRelations from "@/inspection/services/getRelations";
import { convertToContractData } from "@/inspection/shared/utils/convertToContractData";
import { messages } from "@/messages";
import { MobileNoInput } from "@/ui/MaskInput/MobileNoInput";
import Select from "@/ui/Select/Select";
import { Seperator } from "@/ui/Seperator";
import { ObjectType } from "@/utils/object/ObjectType";
import { allowEnglishChars } from "@/utils/string/allowEnglishChars";

import { assigneesTemplate, AssigneeType } from "../../models/Assignee";
import { Branch } from "../../models/Branch";
import { ids } from "../../models/Ids";
import {
	InspectionMethod,
	inspectionMethod,
} from "../../models/InspectionMethod";
import { validateInspectionFee } from "../../utils/validateInspectionFee";
import { schema } from "./PhaseSchema";
import { ReviewStatus, reviewStatusOptions } from "./ReviewStatus";

export type FormData = z.infer<typeof schema>;

export function PhasePage() {
	const { identity } = useLoggedInUser();

	const { task, hooks, dispatch } = useTaskContext();

	const { verifyContractData } = useContractDifference(
		task.instanceContractNo!,
	);

	const { openTaskCancelDialog } = useTaskCancel();

	useInspectionCancellation({
		statusId: ids.informationFormByAdminStatus,
	});

	const { control, register, setValue, watch } = useFormContext<FormData>();
	const fields = watch();

	const {
		[ids.branch]: branch,
		[ids.informationFormByAdminStatus]: reviewStatus,
	} = fields;

	const isPositiveStatus =
		typeof reviewStatus === "undefined" ||
		reviewStatus === ReviewStatus.Forward;
	const isNegativeStatus = !isPositiveStatus;

	useEffect(() => {
		dispatch({ type: "update", options: { saveBtn: true } });
	}, [dispatch]);

	useEffect(() => {
		register(ids.assignees);
		register(ids.branch);
	}, [register]);

	useEffect(() => {
		(async () => {
			if (branch === undefined) {
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
		if (hooks.get().length === 0) {
			hooks.registerHook(
				"pre-submit",
				async ({ task, data }: { task: Task; data: FormData }) => {
					// set admin in assignee
					if (!data[ids.assignees][AssigneeType.Admin]) {
						const { id, fullname: name } = identity;
						data[ids.assignees][AssigneeType.Admin] = {
							id,
							name,
						};
					}

					// set previous task
					data[ids.previousTask] = {
						taskKey: task.key,
						assigneeKey: AssigneeType.Admin,
						assigneeTitle: assigneesTemplate[AssigneeType.Admin],
						noteContent: data[ids.informationFormByAdminNote],
					};

					const reviewStatus = data[ids.informationFormByAdminStatus];
					if (
						typeof reviewStatus === "undefined" ||
						reviewStatus === ReviewStatus.Forward
					) {
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

						// validate inspection fee
						validateInspectionFee({
							inspectionFeeInRial: totalIncome,
							inspectionMethod: task.data[ids.inspectionMethod],
							caseType,
						});

						// set coordinator & marketer
						const { coordinator, marketer } = await getRelations(
							data[ids.assignees][AssigneeType.Customer]?.id,
							data[ids.branch]?.["managerId"],
						);

						coordinator &&
							(data[ids.assignees][AssigneeType.Coordinator] = {
								id: coordinator.id,
								name: coordinator.fullname,
							});

						marketer &&
							(data[ids.assignees][AssigneeType.Marketer] = {
								id: marketer.id,
								name: marketer.fullname,
							});

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
									id: data[ids.assignees][AssigneeType.Coordinator]
										?.id as string,
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
					} else if (reviewStatus === ReviewStatus.Cancel) {
						const { reason, description } = await openTaskCancelDialog();
						await cancelInspection(task, data as any, { reason, description });
					}
				},
			);

			hooks.registerHook(
				"submit",
				async ({ task, data }: { task: Task; data: FormData }) => {
					// add admin to watchers
					await addWatcherToInstance(task.instanceId, identity.id);

					// set next stage based on status
					const nextStage =
						data[ids.informationFormByAdminStatus] === ReviewStatus.Cancel
							? "canceled"
							: "information-review";
					await setStageOfInstance(task.instanceId, nextStage);
				},
			);
		}
	}, [hooks, identity, verifyContractData, openTaskCancelDialog]);

	return (
		<>
			<div className="grid grid-cols-12 gap-x-4 gap-y-6 md:gap-x-10">
				{task.data[ids.previousTask] ? (
					<>
						<PreviousTaskReferrer />

						<Seperator className="mt-5" />
					</>
				) : task.data[ids.informationReviewStatus] ? (
					<>
						<Referrer
							assigneeKey={AssigneeType.Manager}
							noteId={ids.informationReviewNote}
							noteType="danger"
						/>

						<ReferrerNote
							assigneeKey={AssigneeType.Coordinator}
							noteId={ids.informationFormByCoordinatorNote}
						/>

						<Seperator className="mt-5" />
					</>
				) : (
					task.data[ids.assignees][AssigneeType.Coordinator] && (
						<>
							<Referrer
								assigneeKey={AssigneeType.Coordinator}
								noteId={ids.informationFormByCoordinatorNote}
							/>

							<Seperator className="mt-5" />
						</>
					)
				)}

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
					<label htmlFor={ids.caseType}>نوع درخواست:</label>
					<Controller
						control={control}
						name={ids.caseType}
						render={({ field }) => (
							<>
								<Input
									disabled
									value={
										(field.value
											? caseType[field.value]
											: task.data[ids.caseType] &&
												caseType[task.data[ids.caseType] as CaseType]) || "-"
									}
								/>
							</>
						)}
						rules={{}}
					/>
				</div>

				<CustomerSelect required={isPositiveStatus} />

				<Seperator className="mt-5" />

				<BuyerSelect required={isPositiveStatus} />

				<Seperator className="mt-5" />

				<div className="col-span-full !col-start-1 space-y-2 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
					<label htmlFor={ids.customName}>گمرک:</label>
					<Controller
						control={control}
						name={ids.customName}
						render={({ field, fieldState }) => (
							<>
								<Select items={customs} {...field} />
								<FieldError error={fieldState.error} />
							</>
						)}
						rules={{
							required: isPositiveStatus && messages.validation.required,
						}}
					/>
				</div>

				<div className="col-span-full !col-start-1 space-y-2 md:col-span-10 lg:col-span-8 xl:col-span-6">
					<label htmlFor={ids.goodsDescriptions}>شرح کالاها:</label>
					<Controller
						control={control}
						name={ids.goodsDescriptions}
						render={({ field: { onChange, ...field }, fieldState }) => (
							<>
								<Input
									className="text-right"
									dir="ltr"
									onChange={(e) => onChange(allowEnglishChars(e, field.value))}
									{...field}
								/>
								<FieldError error={fieldState.error} />
							</>
						)}
						rules={{
							required: isPositiveStatus && messages.validation.required,
						}}
					/>
				</div>

				<div className="col-span-full !col-start-1 space-y-2 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
					<label htmlFor={ids.goodsField}>نوع کالاها:</label>
					<Controller
						control={control}
						name={ids.goodsField}
						render={({ field, fieldState }) => (
							<>
								<Select items={getGoodsInspectionFieldOptions()} {...field} />
								<FieldError error={fieldState.error} />
							</>
						)}
						rules={{
							required: isPositiveStatus && messages.validation.required,
						}}
					/>
				</div>

				<Seperator className="mt-5" />

				{isFieldInTaskForm(task, ids.numOfInspectionDays) && (
					<div className="col-span-full !col-start-1 space-y-2 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
						<label htmlFor={ids.numOfInspectionDays}>
							تعداد روزهای بازرسی:
						</label>
						<Controller
							control={control}
							name={ids.numOfInspectionDays}
							render={({ field, fieldState }) => (
								<>
									<Input id={field.name} {...field} />
									<FieldError error={fieldState.error} />
								</>
							)}
							rules={{
								required: isPositiveStatus && messages.validation.required,
							}}
						/>
					</div>
				)}

				<IncomesWidget />

				<Seperator className="mt-5" />

				<div className="col-span-full !col-start-1 space-y-2 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
					<label htmlFor={ids.dischargerName}>نام ترخیص کار:</label>
					<Controller
						control={control}
						name={ids.dischargerName}
						render={({ field, fieldState }) => (
							<>
								<Input {...field} />
								<FieldError error={fieldState.error} />
							</>
						)}
						rules={{
							required: isPositiveStatus && messages.validation.required,
						}}
					/>
				</div>

				<div className="col-span-full !col-start-1 space-y-2 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
					<label htmlFor={ids.dischargerPhoneNo}>شماره تماس ترخیص کار:</label>
					<Controller
						control={control}
						name={ids.dischargerPhoneNo}
						render={({ field, fieldState }) => (
							<>
								<MobileNoInput {...field} />
								<FieldError error={fieldState.error} />
							</>
						)}
					/>
				</div>

				<Seperator className="mt-5" />

				<div className="col-span-full !col-start-1 space-y-2 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
					<label htmlFor={ids.countryOfOrigin}>کشور مبدأ:</label>
					<Controller
						control={control}
						name={ids.countryOfOrigin}
						render={({ field: { onChange, ...field }, fieldState }) => (
							<>
								<Input
									className="text-right"
									dir="ltr"
									onChange={(e) => onChange(allowEnglishChars(e, field.value))}
									{...field}
								/>
								<FieldError error={fieldState.error} />
							</>
						)}
						rules={{
							required: isPositiveStatus && messages.validation.required,
						}}
					/>
				</div>

				<div className="col-span-full !col-start-1 space-y-2 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
					<label htmlFor={ids.inspectionPlace}>محل بازرسی:</label>
					<Controller
						control={control}
						name={ids.inspectionPlace}
						render={({ field: { onChange, ...field }, fieldState }) => (
							<>
								<Input
									className="text-right"
									dir="ltr"
									onChange={(e) => onChange(allowEnglishChars(e, field.value))}
									{...field}
								/>
								<FieldError error={fieldState.error} />
							</>
						)}
						rules={{
							required: isPositiveStatus && messages.validation.required,
						}}
					/>
				</div>

				<Seperator className="mt-5" />

				<div className="col-span-full !col-start-1 space-y-2 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
					<label htmlFor={ids.informationFormByAdminStatus}>وضعیت:</label>
					<Controller
						control={control}
						name={ids.informationFormByAdminStatus}
						render={({ field, fieldState }) => (
							<>
								<Select items={reviewStatusOptions} {...field} />
								<FieldError error={fieldState.error} />
							</>
						)}
						rules={{
							required: messages.validation.required,
						}}
					/>
				</div>

				{isPositiveStatus && (
					<div className="col-span-full space-y-2">
						<label htmlFor={ids.informationFormByAdminNote}>توضیحات:</label>
						<Controller
							control={control}
							name={ids.informationFormByAdminNote}
							render={({ field, fieldState }) => (
								<>
									<Textarea {...field} />
									<FieldError error={fieldState.error} />
								</>
							)}
							rules={{}}
						/>
					</div>
				)}
			</div>
		</>
	);
}
