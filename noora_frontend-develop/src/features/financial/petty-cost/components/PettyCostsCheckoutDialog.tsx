"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import { Button } from "@/components/ui/button";
import { Conditional } from "@/components/ui/conditional";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { DialogProps } from "@/components/ui/dialog/use-dialogs";
import { createInstance } from "@/felo/instances/services/createInstance";
import getProcessByKey from "@/felo/processes/services/getProcessByKey";
import { PettyCostStatus } from "@/financial/petty-cost/enums/PettyCostStatus";
import { PettyCostType } from "@/financial/petty-cost/enums/PettyCostType";
import { getPettyCost } from "@/financial/petty-cost/services/getPettyCosts";
import { updatePettyCostStatus } from "@/financial/petty-cost/services/updatePettyCostStatus";
import getUserById from "@/identity/users/services/getUserById";
import { toCurrency } from "@/utils/String";

function PettyCostsCheckoutDialog({
	open,
	onClose,
}: DialogProps<undefined, boolean | undefined>) {
	const [payIds, setPayIds] = useState<string[]>([]);
	const [totalPay, setTotalPay] = useState<number>(0);

	const { identity } = useLoggedInUser();

	useEffect(() => {
		const getCosts = async () => {
			try {
				const costs = await getPettyCost({
					filters: {
						status: PettyCostStatus.Unpaid,
						userId: identity.id,
						type: PettyCostType.Official,
					},
				});
				setPayIds(costs.map((item) => item.id));
				const totalAmount = costs.reduce((sum, item) => sum + item.amount, 0);
				setTotalPay(totalAmount);
			} catch (e) {
				console.log(e);
				toast.error("خطایی در هنگام دریافت هزینه ها رخ داد");
			}
		};
		getCosts();
	}, [identity.id]);

	const handleRequestPayment = async () => {
		try {
			let process = await getProcessByKey("paymentOrder");
			if (!process) {
				toast.error("فرآیند پرداخت یافت نشد.");
				return;
			}

			const user = await getUserById(identity.id);

			await createInstance({
				processId: process.id,
				parameters: {
					ProcessType: "petty-cash",
					Assigness: identity.id,
					Title: `${user.fullname} - پرداخت تنخواه `,
					Priority: "normal",
					Description: `درخواست پرداخت هزینه ${payIds.length} هزینه`,
					Amount: String(totalPay),
					Currency: "rial",
					PettyCostIds: payIds,
					RemainingAmount: String(totalPay),
					InputType: "official",
					UserInformation: user,
				},
			});

			await updatePettyCostStatus("pending", payIds);

			toast.success("درخواست پرداخت با موفقیت ثبت شد.");

			onClose(true);
		} catch (error) {
			console.error("خطا در ایجاد فرآیند پرداخت:", error);
			toast.error("خطایی در ایجاد درخواست پرداخت رخ داد.");
		} finally {
			setPayIds([]);
		}
	};

	return (
		<Dialog open={open} onOpenChange={() => onClose()}>
			<Conditional mount={open} delay>
				<DialogContent className="max-w-screen-xs">
					<DialogHeader>
						<DialogTitle>تسویه پرداختی ها</DialogTitle>
					</DialogHeader>
					{payIds.length > 0 && (
						<div className="grid grid-cols-12 gap-4">
							<div className="col-span-full">
								تعداد درخواست پرداخت: {payIds.length}
							</div>
							<div className="col-span-full">
								مبلغ مجموع: {toCurrency(String(totalPay))} ریال
							</div>
						</div>
					)}
					<DialogFooter>
						<Button onClick={handleRequestPayment} variant="primary">
							ثبت درخواست پرداخت
						</Button>
						<Button onClick={onClose.bind(null, undefined)} variant="ghost">
							بازگشت
						</Button>
					</DialogFooter>
				</DialogContent>
			</Conditional>
		</Dialog>
	);
}

export default PettyCostsCheckoutDialog;
