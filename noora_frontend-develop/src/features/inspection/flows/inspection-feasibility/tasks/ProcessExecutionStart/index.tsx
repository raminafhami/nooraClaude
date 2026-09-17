"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { z } from "zod";

import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import { parseBuyer } from "@/buyers/utils/parseBuyer";
import { useDialogs } from "@/components/ui/dialog/use-dialogs";
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
import { Textarea } from "@/components/ui/textarea";
import { customs } from "@/data/customs";
import { currency as currencies, Currency } from "@/enums/Currency";
import { getInstanceFileDefinitions } from "@/felo/files/services/getFileDefinitions";
import { transferInstanceFiles } from "@/felo/files/services/transferInstanceFiles";
import { addWatcherToInstance } from "@/felo/instances/services/addWatcherToInstance";
import { createInstance } from "@/felo/instances/services/createInstance";
import { setStageOfInstance } from "@/felo/instances/services/setStageOfInstance";
import getProcessByKey from "@/felo/processes/services/getProcessByKey";
import { useTaskContext } from "@/felo/tasks/hooks/useTaskContext";
import { useTaskStatus } from "@/felo/tasks/hooks/useTaskStatus";
import { Task } from "@/felo/tasks/models/Task";
import { getMyNextTask } from "@/felo/tasks/services/getMyNextTask";
import { getUserFullname } from "@/identity/users/utils/getUserFullname";
import { parseUserLookup } from "@/identity/users/utils/parseUserLookup";
import PreviousTaskReferrer from "@/inspection/flows/_module/referrer/PreviousTaskReferrer";
import { newGoodsItem } from "@/inspection/flows/coi/utils/newGoodsItem";
import { PreviousTask } from "@/inspection/models/PreviousTask";
import {
	ReviewStatus,
	reviewStatusOptions,
} from "@/inspection/models/ReviewStatus";
import {
	InspectionMethod,
	inspectionMethods,
} from "@/inspection/shared/enums/InspectionMethod";
import { messages } from "@/messages";
import { asNavigationProp } from "@/utils/asNavigationProp";
import { toCurrency } from "@/utils/String";
import { getDynamicUrl } from "@/utils/url/getDynamicUrl";

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
import { ContractNumberInfo } from "../../models/ContractNumberInfo";
import { ids } from "../../models/Ids";
import { pickContractNumberInfo } from "../../utils/pickContractNumberInfo";

const ContractNumberSelectDialog = dynamic(() =>
	import(
		"@/contract-number/components/contract-number-select/ContractNumberSelectDialog"
	).then((x) => x.ContractNumberSelectDialog),
);

const schema = z.object({
	[ids.previousTask]: z.custom<PreviousTask>(),
	[ids.assignees]: z.custom<Assignees>(),
	[ids.processExecutionStartStatus]: z.custom<ReviewStatus>(),
	[ids.processExecutionStartNote]: z.string(),
	[ids.contractNumber]: z.custom<ContractNumberInfo>(),
	[ids.inspectionInstanceId]: z.string(),
});

type FormSchema = z.infer<typeof schema>;

function PhasePage() {
	const router = useRouter();
	const dialogs = useDialogs();

	const { identity } = useLoggedInUser();

	const { task, hooks, dispatch } = useTaskContext();

	useEffect(() => {
		dispatch({ type: "update", options: { saveBtn: true } });
	}, [dispatch]);

	const { control, setValue, watch } = useFormContext<FormSchema>();

	const { isNegative } = useTaskStatus(ids.processExecutionStartStatus);

	useEffect(() => {
		hooks.registerHook(
			"pre-submit",
			async ({ task, data }: { task: Task; data: FormSchema }) => {
				// set previous task
				data[ids.previousTask] = {
					taskKey: task.key,
					assigneeKey: AssigneeType.Manager,
					assigneeTitle: assigneesTemplate[AssigneeType.Manager],
					noteContent: data[ids.processExecutionStartNote],
					noteType:
						data[ids.processExecutionStartStatus] === ReviewStatus.Forward
							? "info"
							: "danger",
				};

				if (data[ids.processExecutionStartStatus] === ReviewStatus.Forward) {
					const contractNumber = await dialogs.open(
						ContractNumberSelectDialog,
						{ buyer: task.data[ids.buyer], customer: task.data[ids.customer] },
					);

					if (!contractNumber) {
						throw new Error("انتخاب قرارداد الزامی است.");
					}

					data[ids.contractNumber] = pickContractNumberInfo(contractNumber);

					const processDefinition = await getProcessByKey(
						task.data[ids.inspectionProcessDefinition].key,
					);

					if (!processDefinition) {
						throw new Error();
					}

					let parameters: Record<string, any> = {};

					if (task.data[ids.inspectionMethod]) {
						parameters["InspectionMethod"] = task.data[ids.inspectionMethod];
					}

					parameters["Buyer"] = parseBuyer(
						asNavigationProp(contractNumber.buyerId),
					);

					if (contractNumber.customerId) {
						parameters["Assignees"] = {
							customer: parseUserLookup(
								asNavigationProp(contractNumber.customerId),
							),
						};
					}

					if (task.data[ids.proformaNo] || contractNumber.proforma) {
						parameters["ProformaNo"] =
							task.data[ids.proformaNo] || contractNumber.proforma;
					}

					parameters["CustomName"] = task.data[ids.customName];

					if (
						processDefinition.key === "Inspection_Case_IC" ||
						processDefinition.key === "Inspection_Case_Bank_COI" ||
						processDefinition.key === "Inspection_Case_Source"
					) {
						parameters["GoodsCustomTariffNos"] =
							task.data[ids.customsTariffNos].join(",");
					} else if (processDefinition.key === "Inspection_Case_COI") {
						parameters["Goods"] = task.data[ids.customsTariffNos].map(
							(code: string) => newGoodsItem({ customsTariffNo: code }),
						);
					}

					parameters["MinInspectionFeeInRial"] =
						task.data[ids.inspectionFeeInRial];

					parameters["RiskLevel"] = task.data[ids.riskLevel];

					// TODO: prefill GoodsField in all inspection types

					const createdInstance = await createInstance({
						processId: processDefinition.id,
						parameters,
						cnId: contractNumber.id,
						feasibilityProcessInstanceId: task.instanceId,
					});

					data[ids.inspectionInstanceId] = createdInstance.id;

					try {
						const documentsDefinition = await getInstanceFileDefinitions(
							task.instanceId,
						);

						const docsFolderDocumentTypes =
							documentsDefinition.folders["docs"].types;
						if (docsFolderDocumentTypes.length) {
							await transferInstanceFiles({
								sourceInstanceId: task.instanceId,
								destinationInstanceId: createdInstance.id,
								files: docsFolderDocumentTypes.map((documentType) => ({
									sourceFieldName: documentType,
									destinationFieldName: documentType,
									destinationFolder: "docs",
								})),
							});
						}
					} catch {}
				} else if (
					data[ids.processExecutionStartStatus] === ReviewStatus.Return
				) {
				}
			},
		);

		hooks.registerHook(
			"submit",
			async ({ task, data }: { task: Task; data: FormSchema }) => {
				// update watchers
				await addWatcherToInstance(task.instanceId, identity.id);

				// set stage
				if (data[ids.processExecutionStartStatus] === ReviewStatus.Forward) {
					await setStageOfInstance(task.instanceId, "completed");
				} else if (
					data[ids.processExecutionStartStatus] === ReviewStatus.Return
				) {
					await setStageOfInstance(task.instanceId, "information-review");
				}

				// redirect to created instance task
				if (data[ids.processExecutionStartStatus] === ReviewStatus.Forward) {
					const createdInstanceNextTask = await getMyNextTask(
						data[ids.inspectionInstanceId],
					);

					if (createdInstanceNextTask) {
						router.push(
							getDynamicUrl(
								`/dashboard/tasks/${createdInstanceNextTask.taskId}`,
							),
						);
					}
				}
			},
		);

		return () => hooks.removeAll();
	}, [hooks, router, dialogs, identity]);

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

			<FormItem className="col-span-full !col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
				<FormLabel>کارمزد پایه بازرسی</FormLabel>
				<FormControl>
					<MaskInput
						className="tracking-wider rtl:text-right"
						dir="ltr"
						disabled
						mapToRadix={["."]}
						mask={Number}
						radix="."
						scale={2}
						thousandsSeparator=","
						unmask
						value={task.data[ids.inspectionFeeInRial]}
					/>
				</FormControl>
			</FormItem>

			<FormItem className="col-span-full !col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
				<FormLabel>نوع ارز</FormLabel>
				<FormControl>
					<Input
						disabled
						value={
							currencies[task.data[ids.inspectionFeeCurrency] as Currency].title
						}
					/>
				</FormControl>
			</FormItem>

			<FormItem className="col-span-full !col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
				<FormLabel>نرخ ارز</FormLabel>
				<FormControl>
					<MaskInput
						className="tracking-wider rtl:text-right"
						dir="ltr"
						disabled
						mask={Number}
						scale={0}
						thousandsSeparator=","
						unmask
						value={task.data[ids.inspectionFeeCurrencyRate]}
					/>
				</FormControl>
			</FormItem>

			<Separator className="col-span-full my-4 h-1" />

			<FormField
				control={control}
				name={ids.processExecutionStartStatus}
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
				name={ids.processExecutionStartNote}
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
