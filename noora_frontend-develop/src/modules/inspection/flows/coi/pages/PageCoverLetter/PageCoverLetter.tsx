"use client";

import { memo, useEffect, useState } from "react";

import { AlertDescription } from "@/components/ui/alert";
import { DestructiveAlert } from "@/components/ui/alert/destructive-alert";
import { getInstanceById } from "@/felo/instances/services/getInstanceById";
import { useInspectionContext } from "@/inspection/context/InspectionContext";
import { Head } from "@/ui/Head";
import { Loading } from "@/ui/Loader";

import { ids } from "../../models/Ids";
import { CoverLetterList } from "./CoverLetterList";

const keysAndLabels: { key: string; label?: string }[] = [
	{ key: ids.buyer },
	{ key: ids.certificateIssueDate },
	{ key: ids.certificateIssueNo },
	{ key: ids.customName },
	{ key: ids.labName },
	{ key: ids.manufacturer },
	{ key: ids.proformaDate },
	{ key: ids.proformaNo },
];

function PageCoverLetter() {
	const { instance, onInstanceUpdate } = useInspectionContext();

	const [isLoading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<React.ReactNode | null>(null);

	useEffect(() => {
		(async () => {
			let data: any = instance.parameters || {};

			const incompleteData: string[] = [];
			const updateData: any = {};

			try {
				if (keysAndLabels.some((x) => data[x.key] === undefined)) {
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

				if (Object.keys(updateData).length) {
					onInstanceUpdate(updateData);
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
				<div className="space-y-10">
					<Head.Root>
						<Head.Title text="نامه های کاور" />
					</Head.Root>

					<CoverLetterList />
				</div>
			)}
		</>
	);
}

export default memo(PageCoverLetter);
