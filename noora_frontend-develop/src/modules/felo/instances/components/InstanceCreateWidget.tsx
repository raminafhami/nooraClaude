"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaCircleExclamation, FaUserGear } from "react-icons/fa6";

import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import { parseBuyer } from "@/buyers/utils/parseBuyer";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useDialogs } from "@/components/ui/dialog/use-dialogs";
import { Spinner } from "@/components/ui/spinner";
import { ContractNumberSelectDialog } from "@/contract-number/components/contract-number-select/ContractNumberSelectDialog";
import { ContractNumber } from "@/contract-number/models/ContractNumber";
import { Process } from "@/felo/processes/models";
import getStartableProcesses from "@/felo/processes/services/getStartableProcesses";
import sortProcessesByName from "@/felo/processes/utils/sortByName";
import { getMyNextTask } from "@/felo/tasks/services/getMyNextTask";
import { UserGroup } from "@/identity/groups/models/Group";
import { getGroups } from "@/identity/groups/services/getGroups";
import { parseUserLookup } from "@/identity/users/utils/parseUserLookup";
import { cn } from "@/lib/utils";
import { Loading } from "@/ui/Loader";
import { asNavigationProp } from "@/utils/asNavigationProp";
import { getDynamicUrl } from "@/utils/url/getDynamicUrl";

import { addWatcherToInstance } from "../services/addWatcherToInstance";
import { createInstance } from "../services/createInstance";
import { getInstanceById } from "../services/getInstanceById";
import { setStageOfInstance } from "../services/setStageOfInstance";

type ProcessTemplate = {
	process: Process;
	group?: Pick<UserGroup, "name" | "title">;
};

function InstanceCreateWidget() {
	const { identity } = useLoggedInUser();

	const [errorMessage, setErrorMessage] = useState<string>();
	const [isLoading, setLoading] = useState<boolean>(true);
	const [processTemplates, setProcessTemplates] = useState<ProcessTemplate[]>(
		[],
	);

	useEffect(() => {
		(async () => {
			try {
				setLoading(true);
				setErrorMessage(undefined);

				const processes = await getStartableProcesses();
				sortProcessesByName(processes);

				const groups = await fetchProcessAndUserCandidateGroups(
					processes,
					identity.groups,
				);

				const templates = prepareProcessTemplates(
					processes,
					identity.groups,
					groups,
				);

				setProcessTemplates(templates);
			} catch (err: any) {
				console.error(err);

				setErrorMessage(
					err.message || "خطای نامشخصی در هنگام دریافت اطلاعات رخ داد.",
				);
			} finally {
				setLoading(false);
			}
		})();
	}, [identity.groups]);

	return (
		<div className="space-y-3">
			<h6>درخواست دستی:</h6>

			<div>
				{isLoading ? (
					<Spinner loading size="sm" />
				) : errorMessage ? (
					<Alert variant="destructive">
						<FaCircleExclamation />
						<AlertDescription>{errorMessage}</AlertDescription>
					</Alert>
				) : (
					<InstanceCreateForm templates={processTemplates} />
				)}
			</div>
		</div>
	);
}

function InstanceCreateForm({ templates }: { templates: ProcessTemplate[] }) {
	const router = useRouter();
	const dialogs = useDialogs();

	const { identity } = useLoggedInUser();

	const [isPending, setIsPending] = useState<boolean>(false);
	const [selectedTemplate, setSelectedTemplate] =
		useState<ProcessTemplate | null>(null);

	async function handleSelectProcess() {
		if (!selectedTemplate) {
			return;
		}

		try {
			setIsPending(true);

			let contractNumber: ContractNumber | undefined;
			if (selectedTemplate.process.useCN) {
				const result = await dialogs.open(ContractNumberSelectDialog);

				if (!result) return;

				contractNumber = result;
			}

			let parameters: Record<string, any> = {};
			if (contractNumber) {
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

				if (contractNumber.proforma) {
					parameters["ProformaNo"] = contractNumber.proforma;
				}
			}

			const createdInstance = await createInstance({
				processId: selectedTemplate.process.id,
				parameters: {
					ownerGroup:
						(selectedTemplate.group?.name ||
							selectedTemplate.process.starters.groups.at(0)) ??
						null,
					...parameters,
				},
				cnId: contractNumber?.id,
			});

			const instance = await getInstanceById(createdInstance.id);
			await addWatcherToInstance(createdInstance.id, identity.id);

			if (instance.processPhases && instance.processPhases.length !== 0) {
				await setStageOfInstance(
					instance.id,
					instance.processPhases.at(0)?.name ?? "",
				);
			}

			let nextRoute = "/dashboard/tasks";

			const nextTask = await getMyNextTask(createdInstance.id);
			if (nextTask) {
				nextRoute = `/dashboard/tasks/${nextTask.taskId}`;
			}

			router.push(getDynamicUrl(nextRoute));
		} catch (err) {
			console.log(err);
		} finally {
			setIsPending(false);
		}
	}

	return (
		<div className="space-y-3">
			<div className="space-y-1 rounded-2xl border border-gray-100 p-2">
				{templates.length !== 0 ? (
					templates.map((template) => {
						let key = template.process.id;
						if (template.group) {
							key += `_${template.group.name}`;
						}

						return (
							<div
								key={key}
								className="cursor-pointer"
								onClick={() => {
									setSelectedTemplate(template);
								}}
							>
								<div
									className={cn(
										"flex select-none items-center rounded-xl px-2 py-1 transition-colors",
										template === selectedTemplate && "bg-gray-100",
									)}
								>
									<FaUserGear className="me-2 text-base" />

									<div>{template.process.name}</div>

									{template.group && (
										<span className="ms-2 rounded-md bg-gray-300 px-1 py-[1px] text-xs">
											{template.group.title}
										</span>
									)}
								</div>
							</div>
						);
					})
				) : (
					<div className="px-2 py-1">نوع درخواستی برای شما تعریف نشده است.</div>
				)}
			</div>

			<div>
				<Button
					disabled={!selectedTemplate || isPending}
					variant="primary"
					onClick={() => handleSelectProcess()}
				>
					<span>ایجاد درخواست</span>
					{isPending && <Loading size="xs" />}
				</Button>
			</div>
		</div>
	);
}

async function fetchProcessAndUserCandidateGroups(
	processes: Process[],
	userGroups: string[],
): Promise<UserGroup[]> {
	const processesGroups = [
		...new Set(processes.flatMap((process) => process.starters.groups)),
	];

	const commonGroups = processesGroups.filter((group) =>
		userGroups.includes(group),
	);

	const groups = await getGroups(null, {
		filters: [{ name: "name", value: commonGroups }],
	});

	return groups;
}

function prepareProcessTemplates(
	processes: Process[],
	userGroups: string[],
	groups: UserGroup[],
): ProcessTemplate[] {
	const templates: ProcessTemplate[] = [];

	processes.forEach((process) => {
		const candidateGroups = process.starters.groups.filter((x) =>
			userGroups.includes(x),
		);

		if (candidateGroups.length <= 1) {
			templates.push({ process });
		} else {
			candidateGroups.forEach((candidateGroup) => {
				const group = groups.find((x) => x.name === candidateGroup)!;

				templates.push({
					process,
					group: { name: group.name, title: group.title },
				});
			});
		}
	});

	return templates;
}

export { InstanceCreateWidget };
