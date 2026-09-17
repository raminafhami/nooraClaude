"use client";

import { useMemo } from "react";
import { FaX } from "react-icons/fa6";

import { Badge } from "@/components/ui/badge";
import { CardContent } from "@/components/ui/card";
import { Numeric } from "@/components/ui/numeric";

import { dispatcherCategoryTypes } from "../../enums/DispatcherCategoryType";
import { DispatcherCategoryFilterArgs } from "./DispatcherCategoryList.types";

function DispatcherCategoryFilterBar({
	disabled,
	filterArgs,
	onFilterArgsUpdate,
}: {
	disabled?: boolean;
	filterArgs: DispatcherCategoryFilterArgs;
	onFilterArgsUpdate: (filterArgs: DispatcherCategoryFilterArgs) => void;
}) {
	const count = useMemo(() => {
		let c = 0;

		for (let key in filterArgs) {
			if (filterArgs[key as keyof DispatcherCategoryFilterArgs]) {
				c++;
			}
		}

		return c;
	}, [filterArgs]);

	if (!count) {
		return null;
	}

	function handleFilterRemove(
		filterKey:
			| keyof DispatcherCategoryFilterArgs
			| (keyof DispatcherCategoryFilterArgs)[],
	) {
		return () => {
			if (disabled) return;

			const nextFilters: DispatcherCategoryFilterArgs = { ...filterArgs };

			(Array.isArray(filterKey) ? filterKey : [filterKey]).forEach((key) => {
				nextFilters[key as keyof DispatcherCategoryFilterArgs] = undefined;
			});

			onFilterArgsUpdate(nextFilters);
		};
	}

	return (
		<CardContent className="border-t bg-gray-50 pt-6">
			<div className="flex flex-col gap-6 xs:flex-row">
				<div className="leading-7">فیلترهای اعمال شده:</div>
				<div className="flex flex-wrap gap-3 pt-0.5">
					{filterArgs.company && (
						<FilterItem onRemove={handleFilterRemove("company")}>
							فقط گروه های کالایی سازمان
						</FilterItem>
					)}

					{filterArgs.type && (
						<FilterItem onRemove={handleFilterRemove("type")}>
							دسته بندی: {dispatcherCategoryTypes[filterArgs.type]?.title}
						</FilterItem>
					)}

					{filterArgs.domainCode && (
						<FilterItem onRemove={handleFilterRemove("domainCode")}>
							کد دامنه: <Numeric value={filterArgs.domainCode} />
						</FilterItem>
					)}

					{filterArgs.inspectionDomain && (
						<FilterItem onRemove={handleFilterRemove("inspectionDomain")}>
							دامنه بازرسی: {filterArgs.inspectionDomain}
						</FilterItem>
					)}

					{count > 1 && (
						<Badge
							className="cursor-pointer bg-red-100 py-1 text-red-900"
							onClick={() => {
								if (disabled) return;

								onFilterArgsUpdate({});
							}}
						>
							حذف همه فیلترها
						</Badge>
					)}
				</div>
			</div>
		</CardContent>
	);
}

function FilterItem({
	children,
	onRemove,
}: React.PropsWithChildren<{
	onRemove: () => void;
}>) {
	return (
		<Badge className="bg-gray-200 py-1 text-gray-900">
			<span>{children}</span>
			<FaX className="cursor-pointer" size={10} onClick={onRemove} />
		</Badge>
	);
}

export { DispatcherCategoryFilterBar };
