"use client";

import { useCallback, useEffect, useState } from "react";

import { PettyCostType } from "@/financial/petty-cost/enums/PettyCostType";
import { PettyCostApi } from "@/financial/petty-cost/models/PettyCost";
import { getPettyCost } from "@/financial/petty-cost/services/getPettyCosts";

function usePettyCosts({
	pettyCostIds,
}: {
	pettyCostIds: string[] | undefined;
}): {
	pettyCosts: PettyCostApi[] | undefined;
	pettyCostType: PettyCostType | null | undefined;
	isLoadingPettyCosts: boolean;
	fetchPettyCosts: () => Promise<void>;
} {
	const [isLoading, setIsLoading] = useState<boolean>(
		() => !!pettyCostIds?.length,
	);
	const [pettyCostType, setPettyCostType] = useState<PettyCostType | null>();
	const [pettyCosts, setPettyCosts] = useState<PettyCostApi[]>();

	const fetchFn = useCallback(async () => {
		try {
			if (!pettyCostIds) {
				setPettyCostType(null);
				setPettyCosts(undefined);
				return;
			}

			if (!pettyCostIds.length) {
				setPettyCostType(PettyCostType.Unofficial);
				setPettyCosts([]);
				return;
			}

			setIsLoading(true);

			const costs = await getPettyCost({
				filters: {
					_id: pettyCostIds,
				},
				populate: ["categoryId"],
			});

			setPettyCostType(costs[0].type as PettyCostType);
			setPettyCosts(costs);
		} catch (err) {
			console.error(err);
		} finally {
			setIsLoading(false);
		}
	}, [pettyCostIds]);

	useEffect(() => {
		fetchFn();
	}, [fetchFn]);

	return {
		pettyCosts,
		pettyCostType,
		isLoadingPettyCosts: isLoading,
		fetchPettyCosts: fetchFn,
	};
}

export { usePettyCosts };
