"use client";

import { useEffect, useState } from "react";
import { z } from "zod";

import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  instanceCancelReason,
  InstanceCancelReason,
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
import { cancelInspectionByInstance } from "@/inspection/services/cancelInspectionByInstance";

import { InspectionCancellationNote } from "../../components/InspectionCancellationNote";
import { InspectionInfoTable } from "../../components/InspectionInfoTable";
import {
  Assignees,
  assigneesTemplate,
  AssigneeType,
} from "../../models/Assignee";
import { ids } from "../../models/Ids";

const schema = z.object({
	[ids.previousTask]: z.custom<PreviousTask>(),
	[ids.assignees]: z.custom<Partial<Assignees>>(),
});

type FormData = z.infer<typeof schema>;

function PhasePage() {
	const { identity } = useLoggedInUser();

	const { task, hooks } = useTaskContext();

	const { [ids.inspectionInstanceId]: inspectionInstanceId } = task.data;

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
				// set previous task
				data[ids.previousTask] = {
					taskKey: task.key,
					assigneeKey: AssigneeType.Creator,
					assigneeTitle: assigneesTemplate[AssigneeType.Creator],
					noteContent: "",
				};

				let reason: InstanceCancelReason;
				let description: string;

				if (isFieldInTaskData(task, ids.reason)) {
					reason = task.data[ids.reason];
					description =
						task.data[ids.description] ||
						instanceCancelReason[task.data[ids.reason] as InstanceCancelReason]
							?.title;
				} else {
					reason = "1";
					description = task.data[ids.informationFormNote];
				}

				await cancelInspectionByInstance(task.data[ids.inspectionInstanceId], {
					reason,
					description,
				});
			},
		);

		hooks.registerHook(
			"submit",
			async ({ task, data }: { task: Task; data: FormData }) => {
				// update watchers
				await addWatcherToInstance(task.instanceId, identity.id);

				// set stage
				await setStageOfInstance(task.instanceId, "cancellation-applied");
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

			<InspectionCancellationNote creator manager ceo accountant />
		</div>
	);
}

const PhaseEntry = { schema, render: <PhasePage /> };

export default PhaseEntry;
