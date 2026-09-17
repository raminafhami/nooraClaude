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
	[ids.informationReviewByAccountantStatus]: z.string(),
	[ids.informationReviewByAccountantNote]: z.string(),
});

type FormData = z.infer<typeof schema>;

function PhasePage() {
	const { identity } = useLoggedInUser();
	const { task, hooks } = useTaskContext();

	const { control, watch } = useFormContext<FormData>();

	const { [ids.inspectionInstanceId]: inspectionInstanceId } = task.data;

	const { [ids.informationReviewByAccountantStatus]: reviewStatus } = watch();

	const isNegativeStatus =
		reviewStatus && reviewStatus !== ReviewStatus.Forward;

	const [instance, setInstance] = useState<Instance>();
	const [numOfInvoices, setNumOfInvoices] = useState<number>(-1);
	const [numOfCosts, setNumOfCosts] = useState<number>(-1);

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

				setInstance(instance);
				setNumOfInvoices(problemInvoices.length);
				setNumOfCosts(problemCosts.length);
			} catch (err) {
				console.error(err);
			}
		})();
	}, [inspectionInstanceId]);

	useEffect(() => {
		hooks.registerHook(
			"pre-submit",
			async ({ task, data }: { task: Task; data: FormData }) => {
				// set assignee:accountant
				data[ids.assignees][AssigneeType.Accountant] = {
					id: identity.id,
					name: identity.fullname,
				};

				// set previous task
				data[ids.previousTask] = {
					taskKey: task.key,
					assigneeKey: AssigneeType.Accountant,
					assigneeTitle: assigneesTemplate[AssigneeType.Accountant],
					noteContent:
						data[ids.informationReviewByAccountantStatus] ===
						ReviewStatus.Forward
							? ""
							: data[ids.informationReviewByAccountantNote],
					noteType:
						data[ids.informationReviewByAccountantStatus] ===
						ReviewStatus.Forward
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
					data[ids.informationReviewByAccountantStatus] === ReviewStatus.Forward
						? "cancellation-apply"
						: data[ids.informationReviewByAccountantStatus] ===
							  ReviewStatus.ReturnCeo
							? "information-review-by-ceo"
							: data[ids.informationReviewByAccountantStatus] ===
								  ReviewStatus.ReturnManager
								? "information-review-by-manager"
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

			<InspectionCancellationNote creator manager ceo />

			<Separator className="col-span-full h-1" />

			<FormField
				control={control}
				name={ids.informationReviewByAccountantStatus}
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
				name={ids.informationReviewByAccountantNote}
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
