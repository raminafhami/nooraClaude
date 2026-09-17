"use client";

import { useCallback, useEffect, useState } from "react";
import { FaAngleLeft, FaRotate, FaX } from "react-icons/fa6";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Numeric } from "@/components/ui/numeric";
import { Spinner } from "@/components/ui/spinner";
import { dispatcherCategoryTypes } from "@/inspection/dispatcher-category/enums/DispatcherCategoryType";
import {
	getDispatcherCategoryByCode,
	GetDispatcherCategoryByCodeReturn,
} from "@/inspection/dispatcher-category/services/getDispatcherCategoryByCode";
import { cn } from "@/lib/utils";
import { getObjectEntries } from "@/utils/object/getObjectEntries";
import { getObjectKeys } from "@/utils/object/getObjectKeys";

function CustomsTariffNosItemList({
	codes,
	onItemRemove,
}: {
	codes: string[];
	onItemRemove?: (code: string) => void;
}) {
	const [customsTariffNos, setCustomsTariffNos] = useState<
		Record<string, GetDispatcherCategoryByCodeReturn | true | undefined>
	>({});

	const customTariffNoQueryFn = useCallback(async (code: string) => {
		try {
			setCustomsTariffNos((previous) => ({ ...previous, [code]: true }));

			const result = await getDispatcherCategoryByCode(code);

			setCustomsTariffNos((previous) => ({ ...previous, [code]: result }));
		} catch {
			setCustomsTariffNos((previous) => ({ ...previous, [code]: undefined }));
		}
	}, []);

	useEffect(() => {
		const queryFn = async () => {
			if (codes.length !== getObjectKeys(customsTariffNos).length) {
				let nextValues: Record<
					string,
					GetDispatcherCategoryByCodeReturn | true | undefined
				> = { ...customsTariffNos };

				getObjectKeys(customsTariffNos).forEach((code) => {
					if (!codes.includes(code)) {
						delete nextValues[code];
					}
				});

				codes.forEach((code) => {
					if (!(code in nextValues)) {
						nextValues[code] = undefined;
					}
				});

				setCustomsTariffNos(nextValues);

				await Promise.all(
					getObjectEntries(nextValues)
						.filter(([, value]) => typeof value === "undefined")
						.map(([code]) => customTariffNoQueryFn(code)),
				);
			}
		};

		queryFn();
	}, [codes, customsTariffNos, customTariffNoQueryFn]);

	return (
		<div className="space-y-2">
			{getObjectEntries(customsTariffNos).map(([code, data], index) => {
				const isLoading = typeof data === "boolean";

				const {
					categories,
					existInYourDomainCode,
				}: Partial<GetDispatcherCategoryByCodeReturn> =
					typeof data === "object" ? data : {};

				return (
					<div key={code} className="space-y-2">
						<div className="flex items-center gap-3">
							<div className="text-xs/5">
								<span>{index + 1}.</span>
							</div>

							<Numeric className="underline" value={code} />

							<div className="flex items-center gap-1">
								{isLoading && <Spinner size="xs" />}

								{!isLoading && (
									<>
										{typeof existInYourDomainCode === "undefined" && (
											<Button
												className="size-5 rounded-sm bg-gray-100"
												size="icon"
												variant="link"
												type="button"
												onClick={() => customTariffNoQueryFn(code)}
											>
												<FaRotate />
											</Button>
										)}

										{typeof existInYourDomainCode !== "undefined" && (
											<Badge
												className={cn(
													"rounded-sm",
													existInYourDomainCode &&
														"bg-green-100 text-green-900",
													!existInYourDomainCode && "bg-red-100 text-red-900",
												)}
											>
												{existInYourDomainCode ? "فعال" : "غیرفعال"}
											</Badge>
										)}

										{onItemRemove && (
											<Button
												className="size-5 rounded-sm bg-gray-100 hover:bg-red-100 hover:text-red-700"
												size="icon"
												variant="link"
												type="button"
												onClick={() => onItemRemove(code)}
											>
												<FaX size={10} />
											</Button>
										)}
									</>
								)}
							</div>
						</div>

						{!!categories?.length && (
							<div className="space-y-2 ps-8">
								{categories?.map((category, index) => (
									<div key={index} className="flex items-center gap-2">
										<FaAngleLeft size={10} />
										<div className="flex items-center gap-2">
											<span>
												{dispatcherCategoryTypes[category.type].title}
											</span>
											<span>-</span>
											<Numeric value={category.domainCode} />
											<span>-</span>
											<span>{category.inspectionDomain}</span>
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				);
			})}
		</div>
	);
}

export { CustomsTariffNosItemList };
