"use client";

import { useEffect, useMemo, useState } from "react";

import { getInstanceById } from "@/felo/instances/services/getInstanceById";
import { ObjectType } from "@/utils/object/ObjectType";

import { useInspectionContext } from "../context/InspectionContext";

type UseLoadInspectionDataReturn = {
	isLoading: boolean;
	errorMessage: React.ReactNode;
};

function useLoadInspectionData(
	enabled: boolean,
	keys: { id: string; label?: string; optional?: boolean }[],
): UseLoadInspectionDataReturn {
	const { instance, onInstanceUpdate } = useInspectionContext();

	const [isLoading, setIsLoading] = useState<boolean>(enabled);
	const [errorMessage, setErrorMessage] = useState<React.ReactNode>();

	const keyIds = useMemo(() => keys.map((x) => x.id), [keys]);

	useEffect(() => {
		if (enabled) {
			setIsLoading(true);
		}
	}, [enabled]);

	useEffect(() => {
		if (!enabled) return;

		(async () => {
			if (!isLoading) return;

			let data: ObjectType = instance.parameters || {};

			const incompleteData: string[] = [];
			const updateData: ObjectType = {};

			try {
				if (keyIds.filter((x) => data[x] === undefined).length !== 0) {
					setIsLoading(true);
					setErrorMessage(null);

					data = await getInstanceById(instance.id, keyIds).then(
						(instance) => instance.parameters || {},
					);

					keys
						.filter((x) => !(x.id in instance.parameters))
						.forEach((key) => {
							if (typeof data[key.id] === "undefined" && !key.optional) {
								incompleteData.push(key.label ?? key.id);
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
				setErrorMessage(
					err.message || "خطای نامشخصی در هنگام دریافت اطلاعات رخ داد.",
				);
			} finally {
				setIsLoading(false);
			}
		})();
	}, [
		enabled,
		isLoading,
		instance.id,
		instance.parameters,
		keyIds,
		keys,
		onInstanceUpdate,
	]);

	return { isLoading, errorMessage };
}

export { useLoadInspectionData };
