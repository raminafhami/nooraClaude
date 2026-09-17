"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaExclamationCircle } from "react-icons/fa";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { toast } from "sonner";

import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Instance } from "@/felo/instances/models/Instance";
import { InstanceQueryFilter } from "@/felo/instances/models/InstanceQuery";
import { copyInstance } from "@/felo/instances/services/copyInstance";
import { getInstances } from "@/felo/instances/services/getInstances";
import { getMyNextTask } from "@/felo/tasks/services/getMyNextTask";
import { Loading } from "@/ui/Loader";
import { ObjectType } from "@/utils/object/ObjectType";
import { getDynamicUrl } from "@/utils/url/getDynamicUrl";

import { ConfirmCopyInstance } from "./_components/ConfirmCopyInstance";

function InstanceCopy() {
	const router = useRouter();

	const { identity } = useLoggedInUser();

	const [modal, setModal] = useState<boolean>(false);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [caseNo, setCaseNo] = useState<string>();
	const [instanceData, setInstanceData] = useState<Instance[]>();

	async function checkDuplicateInstance() {
		try {
			setIsLoading(true);
			setErrorMessage(null);

			const filters: InstanceQueryFilter[] = [
				{
					name: "caseNo",
					value: caseNo,
				},
			];

			const inspectionFilter: ObjectType = {
				processDefinitionKey: {
					$in: [
						"Inspection_Case_IC",
						"Inspection_Case_COI",
						"Inspection_Case_Bank_COI",
						"Inspection_Case_LC",
						"Inspection_Case_SC",
						"Inspection_Case_Source",
					],
				},
			};

			if (identity.branchId) {
				inspectionFilter.$or = [
					{ "parameters.Branch.id": identity.branchId },
					{ "parameters.BranchId": identity.branchId },
				];
			}

			const secretariatFilter: Record<string, any> = {
				processDefinitionKey: {
					$in: ["Secretariat_Letter_Outgoing", "SecretariatOutgoingLetter"],
				},
			};

			filters.push({
				name: "$or",
				value: [inspectionFilter, secretariatFilter],
			});

			const instances = await getInstances({ filters, props: ["Assignees"] });

			if (instances.length === 0) {
				throw new Error("درخواستی با این شماره یافت نشد.");
			}

			setInstanceData(instances);
			setModal(true);
		} catch (err: any) {
			console.error(err);
			setErrorMessage(err?.message ?? "خطای نامشخصی رخ داد.");
		} finally {
			setIsLoading(false);
		}
	}

	async function createDuplicateInstance(instance: Instance) {
		// TODO: owner must be returned from the api
		if (
			instance.processKey === "Secretariat_Letter_Outgoing" &&
			// instance.owner !== identity.id
			instance.parameters["Assignees"]?.creator?.id !== identity.id
		) {
			toast.error(
				"ایجاد اتوماتیک درخواست برای نامه دبیرخانه تنها برای نامه هایی که خودتان ایجاد کرده اید امکان پذیر است.",
			);
			return;
		}

		try {
			setIsLoading(true);

			const createdInstance = await copyInstance(instance.id);

			setModal(false);

			const nextTask = await getMyNextTask(createdInstance.id);

			toast.success(
				<div>
					<span>
						فرایند {createdInstance.processName} با شماره{" "}
						{createdInstance.caseNo} با موفقیت ایجاد شد.
					</span>{" "}
					{nextTask && <span>در حال انتقال...</span>}
				</div>,
			);

			if (nextTask) {
				router.push(getDynamicUrl(`/dashboard/tasks/${nextTask.taskId}`));
			}
		} catch (err: any) {
			console.error(err);
			toast.error(err?.message ?? "ایجاد درخواست با خطای نامشخصی روبرو شد.");
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<>
			{modal && (
				<ConfirmCopyInstance
					setOpen={setModal}
					data={instanceData!}
					open={modal}
					submit={createDuplicateInstance}
					loading={isLoading}
				/>
			)}

			<div className="space-y-3">
				<p>درخواست اتوماتیک:</p>

				<div className="space-y-4 rounded-2xl border border-gray-100 p-4">
					<Alert variant="info">
						<FaExclamationCircle />
						<AlertDescription>
							این بخش تنها برای ایجاد اتوماتیک درخواست های بازرسی و نامه های
							دبیرخانه قابل استفاده است.
						</AlertDescription>
					</Alert>

					<div>
						<div className="max-w-80 space-y-2">
							<Label>شماره درخواست:</Label>
							<Input
								value={caseNo}
								onChange={(e) => {
									setCaseNo(e.target.value);
								}}
								onKeyDown={(e) =>
									caseNo && e.key === "Enter" && checkDuplicateInstance()
								}
							/>
						</div>
					</div>

					{errorMessage && <div className="text-red-700">{errorMessage}</div>}

					<div className="flex gap-3">
						<Button
							disabled={isLoading || !caseNo}
							variant="secondary"
							onClick={checkDuplicateInstance}
						>
							<FaMagnifyingGlass />
							<span>بررسی درخواست</span>
							{isLoading && <Loading size="xs" />}
						</Button>
					</div>
				</div>
			</div>
		</>
	);
}
export default InstanceCopy;
