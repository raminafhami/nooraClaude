"use client";

import { useEffect, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addWatcherToInstance } from "@/felo/instances/services/addWatcherToInstance";
import { setStageOfInstance } from "@/felo/instances/services/setStageOfInstance";
import { useTaskContext } from "@/felo/tasks/hooks/useTaskContext";
import { Task } from "@/felo/tasks/models/Task";
import { FieldError } from "@/form/FieldError";
import { Input } from "@/form/Input";
import { Textarea } from "@/form/textarea";
import { ContractAddendums } from "@/hrm/contract/components/ContractAddendums";
import { ContractView } from "@/hrm/contract/components/ContractView";
import { ContractStatus } from "@/hrm/contract/enums/ContractStatus";
import { Contract } from "@/hrm/contract/models/Contract";
import { getContractById } from "@/hrm/contract/services/getContractById";
import { updateContract } from "@/hrm/contract/services/updateContract";
import { JobService } from "@/hrm/jobs/JobService";
import { JobDescription } from "@/hrm/jobs/models/Job";
import { Personnel } from "@/hrm/personnel/models/Personnel";
import { getPersonnelById } from "@/hrm/personnel/services/getPersonnelById";
import PreviousTaskReferrer from "@/inspection/flows/_module/referrer/PreviousTaskReferrer";
import { messages } from "@/messages";
import { Loading } from "@/ui/Loader";
import { Seperator } from "@/ui/Seperator";

import { assigneesTemplate, AssigneeType } from "../../models/Assignees";
import { ids } from "../../models/Ids";
import { getUserSignature } from "../../services/getUserSignature";
import { ReviewStatus, reviewStatusOptions } from "./ReviewStatus";
import { schema } from "./TaskSchema";

type FormData = z.infer<typeof schema>;

function TaskPage() {
	const { identity } = useLoggedInUser();

	const { task, hooks } = useTaskContext();

	const { [ids.contractId]: contractId, [ids.assignees]: assignees } =
		task.data;
	const { [AssigneeType.QA]: qaAssignee } = assignees;

	const { control, watch } = useFormContext<FormData>();

	const { [ids.contractReviewStatusByCEO]: reviewStatus } = watch();

	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [contract, setContract] = useState<Contract>();
	const [personnel, setPersonnel] = useState<Personnel>();
	const [jobs, setJobs] = useState<JobDescription[]>();
	const [qaSignature, setQaSignature] = useState<string | undefined>();
	const [personnelSignature, setPersonnelSignature] = useState<
		string | undefined
	>();

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

				// load qa signature
				const qaSignature = await getUserSignature(qaAssignee.id);
				setQaSignature(qaSignature);

				// load personnel signature
				const personnelSignature = await getUserSignature(personnel.userId);
				setPersonnelSignature(personnelSignature);
			} catch (error) {
				console.error(error);
				toast.error("خطا در دریافت اطلاعات!");
			} finally {
				setIsLoading(false);
			}
		})();
	}, [contractId, qaAssignee.id]);

	useEffect(() => {
		if (hooks.get().length === 0) {
			hooks.registerHook(
				"pre-submit",
				async ({ task, data }: { task: Task; data: FormData }) => {
					if (data[ids.contractReviewStatusByCEO] === ReviewStatus.Forward) {
						// update contract
						await updateContract(task.data[ids.contractId], {
							status: ContractStatus.Signed,
							approvers: [
								{
									key: "ceo",
									title: "مدیرعامل",
									userId: identity.id,
									isProxy: !identity.groups.includes("ceo"),
								},
								{
									key: "qa",
									title: "تضمین کیفیت",
									userId: data[ids.assignees][AssigneeType.QA]?.id!,
									isProxy: false, // todo: check qa user groups or another method when qa forwards the process
								},
							],
						});
					}

					// set assignee
					data[ids.assignees][AssigneeType.CEO] = {
						id: identity.id,
						name: identity.fullname,
					};

					// set previous task
					data[ids.previousTask] = {
						taskKey: task.key,
						assigneeKey: AssigneeType.CEO,
						assigneeTitle: assigneesTemplate[AssigneeType.CEO],
						noteContent: data[ids.contractReviewNoteByCEO],
						noteType:
							data[ids.contractReviewStatusByCEO] === "forward"
								? "info"
								: "danger",
					};
				},
			);

			hooks.registerHook(
				"submit",
				async ({ task, data }: { task: Task; data: FormData }) => {
					await addWatcherToInstance(task.instanceId, identity.id);

					const nextStage =
						data[ids.contractReviewStatusByCEO] === ReviewStatus.ReturnHR
							? "review-by-hr"
							: data[ids.contractReviewStatusByCEO] === ReviewStatus.ReturnQA
								? "review-by-qa"
								: data[ids.contractReviewStatusByCEO] ===
									  ReviewStatus.ReturnFinancial
									? "review-by-financial"
									: data[ids.contractReviewStatusByCEO] ===
										  ReviewStatus.ReturnPersonnel
										? "review-by-personnel"
										: "finalized";
					await setStageOfInstance(task.instanceId, nextStage);
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
				<ContractView
					contract={contract}
					personnel={personnel}
					jobs={jobs}
					personnelSignature={personnelSignature}
				/>
			</div>

			<ContractAddendums
				className="col-span-full col-start-1"
				contract={contract}
				personnel={personnel}
				jobs={jobs}
				signatures={{
					personnel: personnelSignature,
					qa: qaSignature,
				}}
			/>

			<Seperator className="mt-5" />

			<div className="col-span-3 col-start-1 space-y-2">
				<label htmlFor={ids.contractReviewStatusByCEO}>نتیجه بررسی:</label>
				<Controller
					control={control}
					name={ids.contractReviewStatusByCEO}
					render={({ field, fieldState }) => (
						<>
							<Select
								name={field.name}
								value={field.value}
								onValueChange={(value) => field.onChange(value)}
							>
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
							<FieldError error={fieldState.error} />
						</>
					)}
					rules={{
						required: messages.validation.required,
					}}
				/>
			</div>

			{reviewStatus && reviewStatus !== ReviewStatus.Forward && (
				<div className="col-span-full space-y-2">
					<label htmlFor={ids.contractReviewNoteByCEO}>توضیحات بررسی:</label>
					<Controller
						control={control}
						name={ids.contractReviewNoteByCEO}
						render={({ field, fieldState }) => (
							<>
								<Textarea id={field.name} {...field} />
								<FieldError error={fieldState.error} />
							</>
						)}
						rules={{
							required:
								reviewStatus &&
								reviewStatus !== ReviewStatus.Forward &&
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
