"use client";

import { useEffect, useState } from "react";

import { AlertDescription } from "@/components/ui/alert";
import { DestructiveAlert } from "@/components/ui/alert/destructive-alert";
import { getInstanceById } from "@/felo/instances/services/getInstanceById";
import { useInspectionContext } from "@/inspection/context/InspectionContext";
import { Loading } from "@/ui/Loader";

import { FinancialsWidget } from "./FinancialsWidget";

const financialsKeys: { id: string; required?: boolean }[] = [
	{ id: "InvoicePaymentStatus" },
	{ id: "CaseType" },
];

const financialsKeyIds = financialsKeys.map((x) => x.id);

function FinancialsPage() {
	const { instance, onInstanceUpdate } = useInspectionContext();

	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [errorMessage, setErrorMessage] = useState<string>();

	useEffect(() => {
		async function init() {
			try {
				let data: any = instance.parameters || {};

				const incompleteData: string[] = [];
				const updateData: any = {};

				if (
					financialsKeyIds.filter((x) => typeof data[x] === "undefined")
						.length !== 0
				) {
					setIsLoading(true);
					setErrorMessage(undefined);

					data = await getInstanceById(instance.id, financialsKeyIds).then(
						(instance) => instance.parameters || {},
					);

					financialsKeys
						.filter((x) => !(x.id in instance.parameters))
						.forEach((key) => {
							if (
								typeof data[key.id] === "undefined" &&
								typeof key.required !== "undefined" &&
								key.required
							) {
								incompleteData.push(key.id);
							} else if (typeof data[key.id] !== "undefined") {
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
				setErrorMessage(err.message ?? "خطای نامشخصی رخ داد.");
			} finally {
				setIsLoading(false);
			}
		}

		init();
	}, [instance.id, instance.parameters, onInstanceUpdate]);

	if (isLoading) {
		return <Loading size="sm">در حال دریافت اطلاعات...</Loading>;
	}

	if (errorMessage) {
		return (
			<DestructiveAlert>
				<AlertDescription>
					{errorMessage || "خطای نامشخصی رخ داده است"}
				</AlertDescription>
			</DestructiveAlert>
		);
	}

	return <FinancialsWidget />;
}

export { FinancialsPage };
