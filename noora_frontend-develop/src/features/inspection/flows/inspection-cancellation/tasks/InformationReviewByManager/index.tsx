"use client";

import { useEffect, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  InstanceCancelReason,
  instanceCancelReason,
} from "@/felo/instances/enums/InstanceCancelReason";
import { Instance } from "@/felo/instances/models/Instance";
import { addWatcherToInstance } from "@/felo/instances/services/addWatcherToInstance";
import { getInstanceById } from "@/felo/instances/services/getInstanceById";
import { setStageOfInstance } from "@/felo/instances/services/setStageOfInstance";
import { isInstanceOtherReason } from "@/felo/instances/utils/isInstanceOtherReason";
import { useTaskContext } from "@/felo/tasks/hooks/useTaskContext";
import { Task } from "@/felo/tasks/models/Task";
import { isFieldInTaskData } from "@/felo/tasks/utils/isFieldInTaskData";
import { getCosts } from "@/financial/costs/services/getCosts";
import { InvoiceStatus } from "@/financial/invoices/enums/InvoiceStatus";
import { getInstanceInvoices } from "@/financial/invoices/services/getInstanceInvoices";
import PreviousTaskReferrer from "@/inspection/flows/_module/referrer/PreviousTaskReferrer";
import { InvoicePaymentStatus } from "@/inspection/models/InvoicePaymentStatus";
import { PreviousTask } from "@/inspection/models/PreviousTask";
import { messages } from "@/messages";

import { InspectionCancellationNote } from "../../components/InspectionCancellationNote";
import { InspectionInfoTable } from "../../components/InspectionInfoTable";
import {
  Assignees,
  assigneesTemplate,
  AssigneeType,
} from "../../models/Assignee";
import { ids } from "../../models/Ids";
import { ReviewStatus, reviewStatusOptions } from "./ReviewStatus";

const schema = z.object({
	[ids.previousTask]: z.custom<PreviousTask>(),
	[ids.assignees]: z.custom<Partial<Assignees>>(),
	[ids.informationReviewByManagerStatus]: z.string(),
	[ids.informationReviewByManagerNote]: z.string(),
	[ids.hasAccountingElements]: z.boolean(),
});

type FormData = z.infer<typeof schema>;

function PhasePage() {
	const { identity } = useLoggedInUser();
	const { task, hooks } = useTaskContext();

	const { control, register, setValue, watch } = useFormContext<FormData>();

	const { [ids.inspectionInstanceId]: inspectionInstanceId } = task.data;

	const { [ids.informationReviewByManagerStatus]: reviewStatus } = watch();

	const isNegativeStatus = reviewStatus === ReviewStatus.Return;

	const [instance, setInstance] = useState<Instance>();
	const [numOfInvoices, setNumOfInvoices] = useState<number>(-1);
	const [numOfCosts, setNumOfCosts] = useState<number>(-1);

	useEffect(() => {
		register(ids.hasAccountingElements, {
			validate: (value) => typeof value !== "undefined",
		});
	}, [register]);

	useEffect(() => {
		(async () => {
			if (!inspectionInstanceId) {
				setInstance(undefined);
				setNumOfInvoices(-1);
				setNumOfCosts(-1);
				return;
			}

			try {
				const instance = await getInstanceById(inspectionInstanceId, [
					"InspectionMethod",
					"Assignees",
					"Buyer",
					"InvoicePaymentStatus",
				]);

				const problemInvoices = await getInstanceInvoices(instance.id, {
					filters: {
						$and: [
							{ status: { $ne: InvoiceStatus.Active } },
							{ status: { $ne: InvoiceStatus.Cancelled } },
						],
					},
				});

				const problemCosts = await getCosts({
					filters: { caseId: instance.id, status: { $ne: "unpaid" } },
				});

				const hasAccountingElements = Boolean(
					(instance.parameters?.["InvoicePaymentStatus"] &&
						instance.parameters?.["InvoicePaymentStatus"] !==
							InvoicePaymentStatus.Unpaid) ||
						problemInvoices.length !== 0 ||
						problemCosts.length !== 0,
				);
				setValue(ids.hasAccountingElements, hasAccountingElements);

				setInstance(instance);
				setNumOfInvoices(problemInvoices.length);
				setNumOfCosts(problemCosts.length);
			} catch (err) {
				console.error(err);
			}
		})();
	}, [inspectionInstanceId, setValue]);

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
						data[ids.informationReviewByManagerStatus] === ReviewStatus.Forward
							? ""
							: data[ids.informationReviewByManagerNote],
					noteType:
						data[ids.informationReviewByManagerStatus] === ReviewStatus.Forward
							? "info"
							: "danger",
				};
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
					data[ids.informationReviewByManagerStatus] === ReviewStatus.Forward
						? "information-review-by-ceo"
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

			<InspectionInfoTable
				instance={instance}
				numOfInvoices={numOfInvoices}
				numOfCosts={numOfCosts}
			/>

			{isFieldInTaskData(task, ids.reason) && (
				<>
					<FormItem className="col-span-full !col-start-1 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
						<FormLabel>علت لغو:</FormLabel>
						<FormControl>
							<Input
								disabled
								value={
									instanceCancelReason[
										task.data[ids.reason] as InstanceCancelReason
									]?.title
								}
							/>
						</FormControl>
						<FormMessage />
					</FormItem>

					{isInstanceOtherReason(task.data[ids.reason]) && (
						<FormItem className="col-span-full !col-start-1 space-y-2 md:col-span-10 lg:col-span-8 xl:col-span-6">
							<FormLabel>توضیحات لغو:</FormLabel>
							<FormControl>
								<Input disabled value={task.data[ids.description]} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}

					<Separator className="col-span-full h-1" />
				</>
			)}

			<InspectionCancellationNote creator />

			<Separator className="col-span-full h-1" />

			<FormField
				control={control}
				name={ids.informationReviewByManagerStatus}
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
				name={ids.informationReviewByManagerNote}
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
