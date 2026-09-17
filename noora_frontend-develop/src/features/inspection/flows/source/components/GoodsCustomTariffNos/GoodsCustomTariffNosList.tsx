"use client";

import { memo, useMemo } from "react";
import { FaSquare } from "react-icons/fa6";

import { useTaskContext } from "@/felo/tasks/hooks/useTaskContext";

import { ids } from "../../models/Ids";

function GoodsCustomTariffNosList() {
	const {
		task: { data },
	} = useTaskContext();

	const value: string = data[ids.goodsCustomTariffNos];
	const valueArray: string[] = useMemo(() => {
		return value?.split(",").filter((x) => x) || [];
	}, [value]);

	return (
		<div className="col-span-full !col-start-1 space-y-2 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
			<label>شماره تعرفه گمرکی کالاها:</label>
			<div className="rounded-xl border-s-4 border-gray-200 bg-gray-50 px-6 py-3">
				{valueArray.length !== 0 ? (
					valueArray.map((valueItem) => (
						<div className="mt-1.5 first:mt-0" key={valueItem}>
							<div className="flex items-center gap-x-2">
								<div>
									<FaSquare className="h-1.5 w-1.5 rounded text-gray-900" />
								</div>

								<div>{valueItem}</div>
							</div>
						</div>
					))
				) : (
					<div key="empty">-</div>
				)}
			</div>
		</div>
	);
}

const MemoizedGoodsCustomTariffNosList = memo(GoodsCustomTariffNosList);

export { MemoizedGoodsCustomTariffNosList as GoodsCustomTariffNosList };
