"use client";

import { memo, useEffect, useState } from "react";

import { AlertDescription } from "@/components/ui/alert";
import { DestructiveAlert } from "@/components/ui/alert/destructive-alert";
import { getInstanceById } from "@/felo/instances/services/getInstanceById";
import { useInspectionContext } from "@/inspection/context/InspectionContext";
import { Loading } from "@/ui/Loader";

import { ids } from "../../models/Ids";
import MdLetterDisplay from "./MdLetterDisplay";

const keysAndLabels: { key: string; label?: string }[] = [
	{ key: ids.brand, label: "Brand" },
	{ key: ids.countryOfOrigin, label: "Country of Origin" },
	{ key: ids.exporter, label: "Exporter" },
	{ key: ids.goods, label: "Goods" },
	{ key: ids.importer, label: "Importer" },
	{ key: ids.manufacturer, label: "Manufacturer" },
	{ key: ids.proformaDate, label: "P/I Date" },
	{ key: ids.proformaNo, label: "P/I No." },
	{ key: ids.seller, label: "Seller" },
	{ key: ids.testDateEnd, label: "Test End Date" },
];

const mdLetterKeys = keysAndLabels.map((x) => x.key);

function MdLetterWidget() {
	const { instance, onInstanceUpdate } = useInspectionContext();

	const [isLoading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<React.ReactNode | null>(null);

	useEffect(() => {
		(async () => {
			let data: any = instance.parameters || {};

			const incompleteData: string[] = [];
			const updateData: any = {};

			try {
				if (
					keysAndLabels.filter((x) => data[x.key] === undefined).length !== 0
				) {
					setLoading(true);
					setError(null);

					data = await getInstanceById(
						instance.id,
						keysAndLabels.map((x) => x.key),
					).then((instance) => instance.parameters || {});

					keysAndLabels.forEach((item) => {
						if (data[item.key] === undefined && item.label) {
							incompleteData.push(item.label);
						} else {
							updateData[item.key] = data[item.key];
						}
					});
				}

				if (Object.keys(updateData).length !== 0) {
					onInstanceUpdate(updateData);
				}

				if (incompleteData.length !== 0) {
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
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<>
			{isLoading ? (
				<Loading size="sm">در حال دریافت اطلاعات...</Loading>
			) : error ? (
				<DestructiveAlert>
					<AlertDescription>{error}</AlertDescription>
				</DestructiveAlert>
			) : (
				<div className="space-y-12">
					<MdLetterDisplay />
				</div>
			)}
		</>
	);
}

export { mdLetterKeys };
export default memo(MdLetterWidget);
