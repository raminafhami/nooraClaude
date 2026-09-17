"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { IndustryType } from "../enums/IndustryType";
import { Industry } from "../models/Industry";
import { getIndustries } from "../services/getIndustries";

function useIndustryData(
	industryId?: string,
	options: { onError?: (err: unknown) => void } = {},
): {
	isLoading: boolean;
	industries: Industry[];
	subIndustries: Industry[];
} {
	const { onError } = options;

	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [industries, setIndustries] = useState<Industry[]>([]);
	const [subIndustries, setSubIndustries] = useState<Industry[]>([]);

	const filteredSubIndustries = useMemo(() => {
		if (!industryId) {
			return [];
		}

		return subIndustries.filter((x) => x.parentId === industryId);
	}, [subIndustries, industryId]);

	const queryFn = useCallback(async () => {
		try {
			setIsLoading(true);

			const industries = await getIndustries();

			setIndustries(industries.filter((x) => x.type === IndustryType.Main));
			setSubIndustries(industries.filter((x) => x.type === IndustryType.Sub));
		} catch (err) {
			onError?.(err);
		} finally {
			setIsLoading(false);
		}
	}, [onError]);

	useEffect(() => {
		queryFn();
	}, [queryFn]);

	return { isLoading, industries, subIndustries: filteredSubIndustries };
}

export { useIndustryData };
