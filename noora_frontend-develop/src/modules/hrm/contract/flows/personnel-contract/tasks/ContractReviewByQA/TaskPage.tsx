"use client";

import { useEffect, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import { addWatcherToInstance } from "@/felo/instances/services/addWatcherToInstance";
import { setStageOfInstance } from "@/felo/instances/services/setStageOfInstance";
import { useTaskContext } from "@/felo/tasks/hooks/useTaskContext";
import { Task } from "@/felo/tasks/models/Task";
import { FieldError } from "@/form/FieldError";
import { Input } from "@/form/Input";
import { Textarea } from "@/form/textarea";
import { ContractAddendums } from "@/hrm/contract/components/ContractAddendums";
import { ContractView } from "@/hrm/contract/components/ContractView";
import { Contract } from "@/hrm/contract/models/Contract";
import { getContractById } from "@/hrm/contract/services/getContractById";
import { JobService } from "@/hrm/jobs/JobService";
import { JobDescription } from "@/hrm/jobs/models/Job";
import { Personnel } from "@/hrm/personnel/models/Personnel";
import { getPersonnelById } from "@/hrm/personnel/services/getPersonnelById";
import PreviousTaskReferrer from "@/inspection/flows/_module/referrer/PreviousTaskReferrer";
import {
  ReviewStatus,
  reviewStatusOptions,
} from "@/inspection/models/ReviewStatus";
import { messages } from "@/messages";
import { Loading } from "@/ui/Loader";
import Select from "@/ui/Select/Select";
import { Seperator } from "@/ui/Seperator";

import { assigneesTemplate, AssigneeType } from "../../models/Assignees";
import { ids } from "../../models/Ids";
import { schema } from "./TaskSchema";

type FormData = z.infer<typeof schema>;

function TaskPage() {
	const { identity } = useLoggedInUser();

	const { task, hooks } = useTaskContext();

	const { [ids.contractId]: contractId } = task.data;

	const { control, watch } = useFormContext<FormData>();

	const { [ids.contractReviewStatusByQA]: reviewStatus } = watch();

	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [contract, setContract] = useState<Contract>();
	const [personnel, setPersonnel] = useState<Personnel>();
	const [jobs, setJobs] = useState<JobDescription[]>();

	useEffect(() => {
		(async () => {
			try {
				setIsLoading(true);

				// load contract
				const contract: Contract = await getContractById(contractId);
				setContract(contract);

				// load personnel
				const personnel = await getPersonnelById(contract.userId, ["user"]);
				setPersonnel(personnel);

				// load jobs
				const jobs = await JobService.get({
					filters: [
						{
							name: "_id",
							value: (contract?.jobs as any)?.map((x: any) => x.id),
						},
					],
				});
				setJobs(jobs as JobDescription[]);
			} catch (error) {
				console.error(error);
				toast.error("خطا در دریافت اطلاعات!");
			} finally {
				setIsLoading(false);
			}
		})();
	}, [contractId]);

	useEffect(() => {
		if (hooks.get().length === 0) {
			hooks.registerHook(
				"pre-submit",
				async ({ task, data }: { task: Task; data: FormData }) => {
					// set assignee
					data[ids.assignees][AssigneeType.QA] = {
						id: identity.id,
						name: identity.fullname,
					};

					// set previous task
					data[ids.previousTask] = {
						taskKey: task.key,
						assigneeKey: AssigneeType.QA,
						assigneeTitle: assigneesTemplate[AssigneeType.QA],
						noteContent: data[ids.contractReviewNoteByQA],
						noteType:
							data[ids.contractReviewStatusByQA] === "forward"
								? "info"
								: "danger",
					};
				},
			);

			hooks.registerHook(
				"submit",
				async ({ task, data }: { task: Task; data: FormData }) => {
					await addWatcherToInstance(task.instanceId, identity.id);

					if (data[ids.contractReviewStatusByQA] === ReviewStatus.Forward) {
						await setStageOfInstance(task.instanceId, "review-by-financial");
					} else {
						await setStageOfInstance(task.instanceId, "review-by-hr");
					}
				},
			);
		}
	}, [hooks, identity]);

	if (isLoading) {
		return <Loading size="sm">در حال دریافت اطلاعات...</Loading>;
	}

	if (!contract || !personnel || !jobs) {
		return <></>;
	}

	return (
		<div className="grid grid-cols-12 gap-x-10 gap-y-6">
			{task.data[ids.previousTask] && (
				<>
					<PreviousTaskReferrer />

					<Seperator className="mt-5" />
				</>
			)}

			<div className="col-span-3 col-start-1 space-y-2">
				<label>پرسنل:</label>
				<Input
					defaultValue={task.data[ids.assignees][AssigneeType.Personnel]?.name}
					disabled
				/>
			</div>

			<Seperator className="mt-5" />

			<div className="col-span-full col-start-1 space-y-2">
				<label>قرارداد:</label>
				<ContractView contract={contract} personnel={personnel} jobs={jobs} />
			</div>

			<ContractAddendums
				className="col-span-full col-start-1"
				contract={contract}
				personnel={personnel}
				jobs={jobs}
			/>

			<Seperator className="mt-5" />

			<div className="col-span-3 col-start-1 space-y-2">
				<label htmlFor={ids.contractReviewStatusByQA}>نتیجه بررسی:</label>
				<Controller
					control={control}
					name={ids.contractReviewStatusByQA}
					render={({ field, fieldState }) => (
						<>
							<Select id={field.name} items={reviewStatusOptions} {...field} />
							<FieldError error={fieldState.error} />
						</>
					)}
					rules={{
						required: messages.validation.required,
					}}
				/>
			</div>

			{reviewStatus === ReviewStatus.Return && (
				<div className="col-span-full space-y-2">
					<label htmlFor={ids.contractReviewNoteByQA}>توضیحات بررسی:</label>
					<Controller
						control={control}
						name={ids.contractReviewNoteByQA}
						render={({ field, fieldState }) => (
							<>
								<Textarea id={field.name} {...field} />
								<FieldError error={fieldState.error} />
							</>
						)}
						rules={{
							required:
								reviewStatus === ReviewStatus.Return &&
								messages.validation.required,
						}}
						shouldUnregister
					/>
				</div>
			)}
		</div>
	);
}

export { TaskPage };
