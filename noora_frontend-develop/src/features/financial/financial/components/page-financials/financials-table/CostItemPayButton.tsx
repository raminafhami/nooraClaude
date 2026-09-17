"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaAnglesLeft } from "react-icons/fa6";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { createInstance } from "@/felo/instances/services/createInstance";
import getProcessByKey from "@/felo/processes/services/getProcessByKey";
import { getMyNextTask } from "@/felo/tasks/services/getMyNextTask";
import { CostType } from "@/financial/costs/enums/CostType";
import { Cost } from "@/financial/costs/models/Cost";
import { updateCostsPayment } from "@/financial/costs/services/updateCostsPayment";
import { UserApi } from "@/identity/users/models/User";
import getUserById from "@/identity/users/services/getUserById";
import { Loading } from "@/ui/Loader";
import { getDynamicUrl } from "@/utils/url/getDynamicUrl";

function CostItemPayButton({
	cost,
	onChange,
}: {
	cost: Cost;
	onChange: () => void;
}) {
	const router = useRouter();

	const [isSending, setIsSending] = useState<boolean>(false);

	async function handleClick() {
		if (isSending) {
			return;
		}

		try {
			setIsSending(true);

			const processDefinition = await getProcessByKey("paymentOrder");

			if (!processDefinition) {
				throw new Error(); // todo:
			}

			let user: UserApi | undefined;
			if (cost.personId) {
				user = await getUserById(cost.personId, true);
			}

			const values =
				cost.type === CostType.Fixed
					? {
							Amount: cost.amount,
							AmountInRial: cost.total,
							Currency: cost.currency,
							// CurrencyRate: cost.currencyRate,
							RemainingAmount: cost.amount,
							RemainingAmountInRial: cost.total,
						}
					: {
							Amount: cost.total,
							AmountInRial: cost.total,
							Currency: cost.currency,
							// CurrencyRate: cost.currencyRate,
							RemainingAmount: cost.total,
							RemainingAmountInRial: cost.total,
						};

			const createdInstance = await createInstance({
				processId: processDefinition.id,
				parameters: {
					Assignees: user?.id,
					Title: cost.personName
						? `پرداخت ذی نفع - ${cost.personName}`
						: "پرداخت ذی نفع",
					Description: `درخواست ${cost.caseNo}`,
					Priority: "normal",
					ProcessType: "beneficiary",
					CostsIds: [cost.id],
					UserInformation: user,
					InputType: "official",
					...values,
				},
			});

			await updateCostsPayment({
				costIds: [cost.id],
				payment: {
					instanceId: createdInstance.id,
					caseNo: createdInstance.caseNo,
				},
			});

			onChange();

			const nextTask = await getMyNextTask(createdInstance.id);

			toast.success(
				<div
					className="flex w-full flex-col gap-1"
					onClick={(e) => {
						e.preventDefault();
						e.stopPropagation();
					}}
				>
					<span>
						دستور پرداخت شماره {createdInstance.caseNo} برای هزینه{" "}
						<span className="text-xs font-semibold">
							«
							{cost.personName
								? `${cost.title}: ${cost.personName}`
								: cost.title}
							»
						</span>{" "}
						با موفقیت ایجاد شد.
					</span>

					{nextTask && (
						<div className="flex">
							<Button
								className="ms-auto flex items-center gap-1 font-semibold text-green-700 underline underline-offset-[6px]"
								size="sm"
								variant="link"
								onClick={() => {
									router.push(
										getDynamicUrl(`/dashboard/tasks/${nextTask.taskId}`),
									);
								}}
							>
								<FaAnglesLeft size={8} />
								<span>انتقال به دستور پرداخت</span>
							</Button>
						</div>
					)}
				</div>,
			);
		} catch (err) {
			console.error(err);
		} finally {
			setIsSending(false);
		}
	}

	return (
		<Button
			className="flex items-center gap-1"
			disabled={isSending}
			size="sm"
			onClick={handleClick}
		>
			{isSending && <Loading size="xs" />}
			<span>پرداخت</span>
		</Button>
	);
}

export { CostItemPayButton };
