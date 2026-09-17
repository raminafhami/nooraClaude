"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Spinner } from "@/components/ui/spinner";
import { InstanceStatus } from "@/felo/instances/enums/InstanceStatus";
import { getInstances } from "@/felo/instances/services/getInstances";
import { InvoicePaymentStatus } from "@/inspection/models/InvoicePaymentStatus";
import { toCurrency } from "@/utils/String";

import { useCustomerContext } from "../CustomerContext";

function CustomerRecordDebt() {
	const { customer } = useCustomerContext();

	const [isLoadingDebt, setIsLoadingDebt] = useState<boolean>(true);
	const [debt, setDebt] = useState<number>();
	const [count, setCount] = useState<number>();

	useEffect(() => {
		(async () => {
			try {
				setIsLoadingDebt(true);

				const [debt, count] = await getInstances({
					filters: [
						{ name: "status", value: InstanceStatus.Completed },
						{
							name: "processDefinitionKey",
							value: { $regex: `^Inspection_Case` },
						},
						{ name: `parameters.Assignees.customer.id`, value: customer.id },
						{
							name: "parameters.InvoicePaymentStatus",
							value: { $exists: true },
						},
						{
							name: "parameters.InvoicePaymentStatus",
							// value: {
							// 	$ne: InvoicePaymentStatus.Paid,
							// },
							value: InvoicePaymentStatus.Unpaid,
						},
					],
					props: ["InvoiceTotal"],
				}).then((instances) => {
					const debt = instances
						.map(
							(instance) => Number(instance.parameters?.["InvoiceTotal"]) || 0,
						)
						.reduce((acc, curr) => acc + curr, 0);

					const count = instances.length;

					return [debt, count] as const;
				});

				setDebt(debt);
				setCount(count);
			} catch (err) {
				console.error(err);
				toast.error(
					"خطای ناشناخته ای در هنگام دریافت اطلاعات بدهی مشتری رخ داد.",
				);
			} finally {
				setIsLoadingDebt(false);
			}
		})();
	}, [customer.id]);

	return (
		<div className="col-span-full space-y-2 xs:col-span-6">
			<div className="text-muted-foreground">میزان بدهی</div>
			<div>
				{isLoadingDebt ? (
					<Spinner loading size="sm" />
				) : typeof debt !== "undefined" ? (
					<>
						<span className="tracking-wide">{toCurrency(debt.toString())}</span>{" "}
						ریال {!!count && <span>({count} درخواست)</span>}
					</>
				) : (
					<span className="text-red-600">خطا در دریافت اطلاعات</span>
				)}
			</div>
		</div>
	);
}

export { CustomerRecordDebt };
