"use client";

import { memo, useEffect, useState } from "react";

import { AlertDescription } from "@/components/ui/alert";
import { DestructiveAlert } from "@/components/ui/alert/destructive-alert";
import { getInstanceById } from "@/felo/instances/services/getInstanceById";
import { useInspectionContext } from "@/inspection/context/InspectionContext";
import { Loading } from "@/ui/Loader";

import { InvoiceDisplay } from "./InvoiceDisplay";
import { ids } from "./InvoiceIds";

const invoiceKeys: { id: string; required?: boolean }[] = [
	{ id: ids.buyerData },
	{ id: ids.caseInvoiceDate, required: false },
	{ id: ids.caseInvoiceNo, required: false },
	{ id: ids.inspectionFee },
	{ id: ids.invoiceDuty },
	{ id: ids.invoiceTax },
	{ id: ids.invoiceTotal },
];

export const invoiceKeyIds = invoiceKeys.map((x) => x.id);

export const InvoicePage = memo(function InvoicePage() {
	const { instance, onInstanceUpdate } = useInspectionContext();

	const [isLoading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<React.ReactNode | null>(null);

	useEffect(() => {
		(async () => {
			let data: any = instance.parameters || {};

			const incompleteData: string[] = [];
			const updateData: any = {};

			try {
				if (invoiceKeyIds.filter((x) => data[x] === undefined).length !== 0) {
					setLoading(true);
					setError(null);

					data = await getInstanceById(instance.id, invoiceKeyIds).then(
						(instance) => instance.parameters || {},
					);

					console.log("Data: ", data);

					invoiceKeys
						.filter((x) => !(x.id in (instance.parameters ?? {})))
						.forEach((key) => {
							if (
								data[key.id] === undefined &&
								key.required !== undefined &&
								key.required
							) {
								incompleteData.push(key.id);
							} else if (data[key.id] !== undefined) {
								updateData[key.id] = data[key.id];
							}
						});
				}

				if (Object.keys(updateData).length) {
					onInstanceUpdate(updateData);
				}

				if (incompleteData.length) {
					throw new Error(
						`فیلدهای مقابل تکمیل نشده اند: ${incompleteData.join("، ")}`,
					);
				}
			} catch (err: any) {
				console.error(err);
				setError(err.message || "Something went wrong.");
			} finally {
				setLoading(false);
			}
		})();
	}, [instance.id, instance.parameters, onInstanceUpdate]);

	return (
		<>
			{isLoading ? (
				<Loading size="sm">در حال دریافت اطلاعات...</Loading>
			) : error ? (
				<DestructiveAlert>
					<AlertDescription>{error}</AlertDescription>
				</DestructiveAlert>
			) : (
				<InvoiceDisplay />
			)}
		</>
	);
});
