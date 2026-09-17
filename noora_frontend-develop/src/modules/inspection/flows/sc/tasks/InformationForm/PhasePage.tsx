"use client";

import "num2persian";

import { useCallback, useEffect, useMemo } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { FaPencil } from "react-icons/fa6";
import { z } from "zod";

import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import { getBranchById } from "@/branches/services/getBranchById";
import { BuyerType } from "@/buyers/enums/BuyerType";
import { AlertDescription } from "@/components/ui/alert";
import { DestructiveAlert } from "@/components/ui/alert/destructive-alert";
import { Button } from "@/components/ui/button";
import { useContractDifference } from "@/contract-number/hooks/useContractDifference";
import { addWatcherToInstance } from "@/felo/instances/services/addWatcherToInstance";
import { getInstanceById } from "@/felo/instances/services/getInstanceById";
import { setStageOfInstance } from "@/felo/instances/services/setStageOfInstance";
import { useTaskContext } from "@/felo/tasks/hooks/useTaskContext";
import { Task } from "@/felo/tasks/models/Task";
import { isFieldInTaskForm } from "@/felo/tasks/utils/isFieldInTaskForm";
import { FinancialCategoryType } from "@/financial/financial-category/enums/FinancialCategoryType";
import { getFinancialCategories } from "@/financial/financial-category/services/getFinancialCategories";
import { IncomesWidget } from "@/financial/incomes/components/task-incomes/IncomesWidget";
import { getIncomes } from "@/financial/incomes/services/getIncomes";
import { DateInput } from "@/form/DateInput";
import { FieldError } from "@/form/FieldError";
import { Input } from "@/form/Input";
import { Textarea } from "@/form/textarea";
import BuyerSelect from "@/inspection/flows/_module/BuyerSelect";
import CustomerSelect from "@/inspection/flows/_module/CustomerSelect";
import getGoodsInspectionFieldOptions from "@/inspection/goodsInspectionFields/services/getGoodsInspectionFieldOptions";
import { CaseType, caseType } from "@/inspection/models/CaseType";
import { goodsFields } from "@/inspection/models/GoodsFields";
import getRelations from "@/inspection/services/getRelations";
import { convertToContractData } from "@/inspection/shared/utils/convertToContractData";
import { messages } from "@/messages";
import Select from "@/ui/Select/Select";
import { Seperator } from "@/ui/Seperator";

import { AssigneeType } from "../../models/Assignee";
import { Branch } from "../../models/Branch";
import { contractAttachmentStatuses } from "../../models/ContractAttachmentStatus";
import { ids } from "../../models/Ids";
import { InformationReviewStatus } from "../../models/InformationReviewStatus";
import { validateInspectionFee } from "../../utils/validateInspectionFee";
import { EmployerObligationsWidget } from "../_components/EmployerObligations/EmployerObligationsWidget";
import { GoodsDescriptionsWidget } from "../_components/GoodsDescriptions/GoodsDescriptionsWidget";
import { InspectorObligationsWidget } from "../_components/InspectorObligations/InspectorObligationsWidget";
import { ObligationsFulfillmentClausesWidget } from "../_components/ObligationsFulfillmentClauses/ObligationsFulfillmentClausesWidget";
import { schema } from "./PhaseSchema";

export type FormData = z.infer<typeof schema>;

export function PhasePage() {
	const { identity } = useLoggedInUser();

	const { task, hooks, dispatch } = useTaskContext();

	const { verifyContractData } = useContractDifference(
		task.instanceContractNo!,
	);

	const { control, register, setValue, watch } = useFormContext<FormData>();
	const fields = watch();

	const { [ids.assignees]: assignees } = fields;

	const {
		[ids.branch]: branch,
		[ids.buyer]: buyer,
		[ids.caseOperationDescription]: caseOperationDescription,
		[ids.caseOperationSummary]: caseOperationSummary,
		[ids.cottageNo]: cottageNo,
		[ids.goodsDescriptions]: goodsDescriptions,
		[ids.goodsQuantity]: goodsQuantity,
		[ids.goodsQuantityUnit]: goodsQuantityUnit,
		[ids.inspectionPlace]: inspectionPlace,
	} = fields;

	const fillContractSubject = useCallback(() => {
		const goodsDescriptionsArray = goodsDescriptions?.split(",") || [];

		setValue(
			ids.contractSubject,
			`${caseOperationSummary || "{خلاصه عملیات نظارتی}"} به محموله ${
				goodsDescriptionsArray.length === 1 ? "کالای" : "کالاهای"
			} ${
				goodsDescriptionsArray.join("، ") || "{نام کالا(ها)}"
			} موضوع اظهارنامه به شماره کوتاژ ${
				cottageNo || "{شماره کوتاژ}"
			} متعلق به ${buyer?.type === BuyerType.Legal ? "شرکت" : "آقا/خانم"} ${
				buyer?.name || "{نام خریدار}"
			}`,
			{
				shouldDirty: true,
				shouldTouch: true,
				shouldValidate: true,
			},
		);
	}, [
		buyer?.name,
		buyer?.type,
		caseOperationSummary,
		cottageNo,
		goodsDescriptions,
		setValue,
	]);

	const fillContractSubjectArticle = useCallback(() => {
		const goodsDescriptionsArray = goodsDescriptions?.split(",") || [];

		setValue(
			ids.contractSubjectArticle,
			`${
				caseOperationDescription || "{شرح عملیات نظارتی}"
			} مطابق اظهارنامه به شماره کوتاژ ${
				cottageNo || "{شماره کوتاژ}"
			} به تعداد ${goodsQuantity || "{تعداد کالاها}"} ${
				goodsQuantityUnit || "{واحد شمارش کالاها}"
			} ${goodsDescriptionsArray.length === 1 ? "کالای" : "کالاهای"} ${
				goodsDescriptionsArray.join("، ") || "{نام کالا(ها)}"
			} در محل ${inspectionPlace || "{محل بازرسی}"}`,
			{
				shouldDirty: true,
				shouldTouch: true,
				shouldValidate: true,
			},
		);
	}, [
		caseOperationDescription,
		cottageNo,
		goodsDescriptions,
		goodsQuantity,
		goodsQuantityUnit,
		inspectionPlace,
		setValue,
	]);

	useEffect(() => {
		dispatch({ type: "update", options: { saveBtn: true } });
	}, [dispatch]);

	useEffect(() => {
		register(ids.assignees);
		register(ids.branch);
	}, [register]);

	useEffect(() => {
		if (!assignees) {
			setValue(ids.assignees, {});
		}
	}, [assignees, setValue]);

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
					if (!task.data[ids.assignees]?.[AssigneeType.Expert]) {
						const { id, fullname: name } = identity;

						data[ids.assignees][AssigneeType.Expert] = { id, name };
					}

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

					// contract
					await verifyContractData(convertToContractData(data));
				},
			);

			hooks.registerHook(
				"submit",
				async ({ task, data }: { task: Task; data: FormData }) => {
					if (data[ids.assignees][AssigneeType.Customer]) {
						await addWatcherToInstance(
							task.instanceId,
							data[ids.assignees][AssigneeType.Customer]!.id,
						);
					}
				},
			);

			hooks.registerHook("submit", async ({ task }) => {
				await setStageOfInstance(task.instanceId, "information-review");
			});
		}
	}, [hooks, identity, verifyContractData]);

	const goodsFieldsItems = useMemo(
		() =>
			task.instanceVersion <= 3
				? goodsFields
				: getGoodsInspectionFieldOptions(),
		[task.instanceVersion],
	);

	return (
		<>
			<div className="grid grid-cols-12 gap-x-10 gap-y-6">
				{task.data[ids.informationReviewStatus] ===
					InformationReviewStatus.Return && (
					<>
						<div className="col-span-3 col-start-1">
							<div>ارجاع دهنده:</div>
							<Input
								className="mt-2"
								defaultValue={
									task.data[ids.assignees][AssigneeType.Manager].name
								}
								disabled
							/>
						</div>

						{task.data[ids.informationReviewNote] && (
							<div className="col-span-full">
								<DestructiveAlert>
									<AlertDescription>
										<div className="font-bold">
											توضیحات مدیر:{" "}
											{task.data[ids.assignees][AssigneeType.Manager].name}
										</div>
										<div className="whitespace-pre-wrap">
											{task.data[ids.informationReviewNote]}
										</div>
									</AlertDescription>
								</DestructiveAlert>
							</div>
						)}

						<Seperator className="mt-5" />
					</>
				)}

				<div className="col-span-3 col-start-1 space-y-2">
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

				<CustomerSelect />

				<Seperator className="mt-5" />

				<BuyerSelect />

				<Seperator className="mt-5" />

				<div className="col-span-3 col-start-1 space-y-2">
					<label htmlFor={ids.authorityOrganization}>سازمان مرجع مسئول:</label>
					<Controller
						control={control}
						name={ids.authorityOrganization}
						render={({ field, fieldState }) => (
							<>
								<Input id={field.name} {...field} />
								<FieldError error={fieldState.error} />
							</>
						)}
						rules={{ required: messages.validation.required }}
					/>
				</div>

				<div className="col-span-3 space-y-2">
					<label htmlFor={ids.authorityPerson}>شخص مرجع مسئول:</label>
					<Controller
						control={control}
						name={ids.authorityPerson}
						render={({ field, fieldState }) => (
							<>
								<Input id={field.name} {...field} />
								<FieldError error={fieldState.error} />
							</>
						)}
						rules={{ required: messages.validation.required }}
					/>
				</div>

				<div className="col-span-full col-start-1 space-y-2">
					<label htmlFor={ids.caseOperationDescription}>
						شرح عملیات نظارتی:
					</label>
					<Controller
						control={control}
						name={ids.caseOperationDescription}
						render={({ field, fieldState }) => (
							<>
								<Textarea id={field.name} {...field} />
								<FieldError error={fieldState.error} />
							</>
						)}
						rules={{ required: messages.validation.required }}
					/>
				</div>

				<div className="col-span-full col-start-1 space-y-2">
					<label htmlFor={ids.caseOperationSummary}>خلاصه عملیات نظارتی:</label>
					<Controller
						control={control}
						name={ids.caseOperationSummary}
						render={({ field, fieldState }) => (
							<>
								<Input id={field.name} {...field} />
								<FieldError error={fieldState.error} />
							</>
						)}
						rules={{ required: messages.validation.required }}
					/>
				</div>

				<Seperator className="mt-5" />

				<div className="col-span-3 col-start-1 space-y-2">
					<label htmlFor={ids.cottageNo}>شماره کوتاژ:</label>
					<Controller
						control={control}
						name={ids.cottageNo}
						render={({ field, fieldState }) => (
							<>
								<Input id={field.name} {...field} />
								<FieldError error={fieldState.error} />
							</>
						)}
						rules={{ required: messages.validation.required }}
					/>
				</div>

				<div className="col-span-full col-start-1 space-y-2">
					<label htmlFor={ids.inspectionPlace}>مکان بازرسی:</label>
					<Controller
						control={control}
						name={ids.inspectionPlace}
						render={({ field, fieldState }) => (
							<>
								<Input id={field.name} {...field} />
								<FieldError error={fieldState.error} />
							</>
						)}
						rules={{ required: messages.validation.required }}
					/>
				</div>

				<Seperator className="mt-5" />

				<div className="col-span-3 col-start-1 space-y-2">
					<label htmlFor={ids.goodsQuantity}>تعداد کالاها:</label>
					<Controller
						control={control}
						name={ids.goodsQuantity}
						render={({ field, fieldState }) => (
							<>
								<Input id={field.name} {...field} />
								<FieldError error={fieldState.error} />
							</>
						)}
						rules={{ required: messages.validation.required }}
					/>
				</div>

				<div className="col-span-3 space-y-2">
					<label htmlFor={ids.goodsQuantityUnit}>واحد شمارش کالاها:</label>
					<Controller
						control={control}
						name={ids.goodsQuantityUnit}
						render={({ field, fieldState }) => (
							<>
								<Input id={field.name} {...field} />
								<FieldError error={fieldState.error} />
							</>
						)}
						rules={{ required: messages.validation.required }}
					/>
				</div>

				<GoodsDescriptionsWidget />

				<div className="col-span-3 col-start-1 space-y-2">
					<label htmlFor={ids.goodsField}>نوع کالاها:</label>
					<Controller
						control={control}
						name={ids.goodsField}
						render={({ field, fieldState }) => (
							<>
								<Select items={goodsFieldsItems} {...field} />
								<FieldError error={fieldState.error} />
							</>
						)}
						rules={{ required: messages.validation.required }}
					/>
				</div>

				<Seperator className="mt-5" />

				<div className="col-span-3 col-start-1 space-y-2">
					<label htmlFor={ids.contractStartDate}>تاریخ شروع قرارداد:</label>
					<Controller
						control={control}
						name={ids.contractStartDate}
						render={({
							field: { name, value, onBlur, onChange },
							fieldState,
						}) => (
							<>
								<DateInput
									id={name}
									value={value}
									onLeave={onBlur}
									onMutate={onChange}
								/>
								<FieldError error={fieldState.error} />
							</>
						)}
						rules={{ required: messages.validation.required }}
					/>
				</div>

				<div className="col-span-3 space-y-2">
					<label htmlFor={ids.contractEndDate}>تاریخ پایان قرارداد:</label>
					<Controller
						control={control}
						name={ids.contractEndDate}
						render={({
							field: { name, value, onBlur, onChange },
							fieldState,
						}) => (
							<>
								<DateInput
									id={name}
									value={value}
									onLeave={onBlur}
									onMutate={onChange}
								/>
								<FieldError error={fieldState.error} />
							</>
						)}
						rules={{ required: messages.validation.required }}
					/>
				</div>

				<div className="col-span-3 space-y-2">
					<label htmlFor={ids.contractDuration}>مدت زمان قرارداد:</label>
					<Controller
						control={control}
						name={ids.contractDuration}
						render={({ field, fieldState }) => (
							<>
								<Input id={field.name} {...field} />
								<FieldError error={fieldState.error} />
							</>
						)}
						rules={{ required: messages.validation.required }}
					/>
				</div>

				<Seperator className="mt-5" />

				<div className="col-span-3 col-start-1 space-y-2">
					<label htmlFor={ids.authorityOrganization}>
						وضعیت پیوست قرارداد:
					</label>
					<Controller
						control={control}
						name={ids.contractAttachmentStatus}
						render={({ field, fieldState }) => (
							<>
								<Select
									id={field.name}
									items={contractAttachmentStatuses}
									{...field}
								/>
								<FieldError error={fieldState.error} />
							</>
						)}
						rules={{ required: messages.validation.required }}
					/>
				</div>

				<div className="col-span-full col-start-1 space-y-2">
					<label htmlFor={ids.contractSubject}>موضوع قرارداد:</label>
					<Controller
						control={control}
						name={ids.contractSubject}
						render={({ field, fieldState }) => (
							<>
								<Input id={field.name} {...field} />
								<FieldError error={fieldState.error} />
							</>
						)}
						rules={{ required: messages.validation.required }}
					/>
					<Button size="sm" type="button" onClick={() => fillContractSubject()}>
						<FaPencil />
						<span>پر کردن</span>
					</Button>
				</div>

				<Seperator className="mt-5" />

				<div className="col-span-full">
					<span className="text-sm font-bold">ماده 1: موضوع قرارداد</span>
				</div>

				<div className="col-span-full col-start-1 space-y-2">
					<label htmlFor={ids.contractSubjectArticle}>توضیحات ماده:</label>
					<Controller
						control={control}
						name={ids.contractSubjectArticle}
						render={({ field, fieldState }) => (
							<>
								<Textarea id={field.name} {...field} />
								<FieldError error={fieldState.error} />
							</>
						)}
						rules={{ required: messages.validation.required }}
					/>
					<Button
						size="sm"
						type="button"
						onClick={() => fillContractSubjectArticle()}
					>
						<FaPencil />
						<span>پر کردن</span>
					</Button>
				</div>

				<Seperator className="mt-5" />

				<div className="col-span-full">
					<span className="text-sm font-bold">ماده 4: تعهدات کارفرما</span>
				</div>

				<EmployerObligationsWidget />

				<Seperator className="mt-5" />

				<div className="col-span-full">
					<span className="text-sm font-bold">ماده 5: تعهدات بازرس</span>
				</div>

				<InspectorObligationsWidget />

				<Seperator className="mt-5" />

				<div className="col-span-full">
					<span className="text-sm font-bold">
						ماده 6: انجام تعهدات قرارداد
					</span>
				</div>

				<div className="col-span-full col-start-1">
					<label htmlFor={ids.contractObligationsFulfillmentArticle}>
						توضیحات ماده:
					</label>
					<Controller
						control={control}
						name={ids.contractObligationsFulfillmentArticle}
						render={({ field, fieldState }) => (
							<>
								<Textarea id={field.name} {...field} />
								<FieldError error={fieldState.error} />
							</>
						)}
						rules={{}}
					/>
				</div>

				<ObligationsFulfillmentClausesWidget />

				<Seperator className="mt-5" />

				<IncomesWidget />

				<Seperator className="mt-5" />

				<div className="col-span-full col-start-1 space-y-2">
					<label htmlFor={ids.informationFormNote}>توضیحات:</label>
					<Controller
						control={control}
						name={ids.informationFormNote}
						render={({ field, fieldState }) => (
							<>
								<Textarea id={field.name} {...field} />
								<FieldError error={fieldState.error} />
							</>
						)}
						rules={{}}
					/>
				</div>
			</div>
		</>
	);
}
