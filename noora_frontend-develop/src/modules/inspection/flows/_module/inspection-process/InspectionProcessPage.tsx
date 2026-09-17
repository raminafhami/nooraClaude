"use client";

import { memo, ReactNode, useEffect, useState } from "react";

import { AlertDescription } from "@/components/ui/alert";
import { DestructiveAlert } from "@/components/ui/alert/destructive-alert";
import { getInstanceById } from "@/felo/instances/services/getInstanceById";
import { useInspectionContext } from "@/inspection/context/InspectionContext";
import { InspectionType } from "@/inspection/models/InspectionType";
import { Loading } from "@/ui/Loader";

import { ids } from "./InspectionProcessIds";
import { InspectionProcessWidget } from "./InspectionProcessWidget";

const inspectionProcessKeys: { id: string; required?: boolean }[] = [
	{ id: ids.assignees },
	{ id: ids.buyer },
	{ id: ids.inspectionInstanceId, required: false },
	{ id: ids.inspectionCaseNo, required: false },
	{ id: ids.inspectionMethod, required: false },
	{ id: ids.customName, required: false },
	{ id: ids.goodsDescriptions },
	{ id: ids.goodsField },
	{ id: ids.proformaNo, required: false },
	{ id: ids.proformaDate, required: false },
	{ id: ids.dischargerName, required: false },
	{ id: ids.dischargerPhoneNo, required: false },
];

export const inpsectionProcessKeyIds = inspectionProcessKeys.map((x) => x.id);

interface Props {
	inspectionType: InspectionType;
}

export const InspectionProcessPage = memo(function InspectionProcessPage({
	inspectionType,
}: Props) {
	const { instance, onInstanceUpdate } = useInspectionContext();

	const [isLoading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<ReactNode | null>(null);

	useEffect(() => {
		(async () => {
			let data: any = instance.parameters || {};

			const incompleteData: string[] = [];
			const updateData: any = {};

			try {
				if (
					inpsectionProcessKeyIds.filter((x) => data[x] === undefined)
						.length !== 0
				) {
					setLoading(true);
					setError(null);

					data = await getInstanceById(
						instance.id,
						inpsectionProcessKeyIds,
					).then((instance) => instance.parameters || {});

					inspectionProcessKeys
						.filter((x) => !(x.id in instance.parameters))
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
				<InspectionProcessWidget inspectionType={inspectionType} />
			)}
		</>
	);
});
