import { useEffect, useRef, useState } from "react";

import { asNavigationProp } from "@/utils/asNavigationProp";
import { getObjectEntries } from "@/utils/object/getObjectEntries";

import { FinancialCategoryType } from "../../financial-category/enums/FinancialCategoryType";
import { FinancialCategory } from "../../financial-category/models/FinancialCategory";
import { getFinancialCategories } from "../../financial-category/services/getFinancialCategories";

type PettyCategoryGroup = {
	budgetCategory: FinancialCategory;
	costCategories: FinancialCategory[];
};

type UsePettyCategoryGroupsOptions = Partial<{
	onError: (err: any) => void;
}>;

function usePettyCategoryGroups(options: UsePettyCategoryGroupsOptions = {}): {
	isLoadingCategories: boolean;
	pettyCategoryGroups: PettyCategoryGroup[] | undefined;
} {
	const optionsRef = useRef<UsePettyCategoryGroupsOptions>(options);

	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [groups, setGroups] = useState<PettyCategoryGroup[]>();

	useEffect(() => {
		const queryFn = async () => {
			try {
				setIsLoading(true);

				const categories = await getFinancialCategories({
					filters: {
						type: FinancialCategoryType.Petty,
						parentId: { $ne: null },
					},
					populate: ["parentId"],
				});

				const groupsObj = categories.reduce<{
					[key: string]: PettyCategoryGroup;
				}>((obj, category) => {
					const budgetCategory = asNavigationProp(category.parentId)!;

					if (!obj[budgetCategory.id]) {
						obj[budgetCategory.id] = { budgetCategory, costCategories: [] };
					}

					obj[budgetCategory.id].costCategories.push(category);

					return obj;
				}, {});

				const groups = getObjectEntries(groupsObj).map(([, group]) => group);

				setGroups(groups);
			} catch (err) {
				console.error(err);
				optionsRef.current.onError?.(err);
			} finally {
				setIsLoading(false);
			}
		};

		queryFn();
	}, []);

	return { isLoadingCategories: isLoading, pettyCategoryGroups: groups };
}

export { usePettyCategoryGroups };
