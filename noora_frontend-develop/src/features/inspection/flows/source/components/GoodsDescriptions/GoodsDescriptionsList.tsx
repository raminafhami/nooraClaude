"use client";

import { memo, useMemo } from "react";
import { FaSquare } from "react-icons/fa6";

import { useTaskContext } from "@/felo/tasks/hooks/useTaskContext";

import { ids } from "../../models/Ids";

function GoodsDescriptionsList() {
	const {
		task: { data },
	} = useTaskContext();

	const goodsDescriptions: string = data[ids.goodsDescriptions];
	const goodsDescriptionsArr: string[] = useMemo(() => {
		return goodsDescriptions?.split(",").filter((x) => x) || [];
	}, [goodsDescriptions]);

	return (
		<div className="col-span-full !col-start-1 space-y-2 md:col-span-10 lg:col-span-8 xl:col-span-6">
			<label>شرح کالاها:</label>
			<div className="rounded-xl border-s-4 border-gray-200 bg-gray-50 px-6 py-3">
				{goodsDescriptionsArr.length !== 0 ? (
					goodsDescriptionsArr.map((description) => (
						<div className="mt-1.5 first:mt-0" key={description}>
							<div className="flex items-center gap-x-2">
								<div>
									<FaSquare className="h-1.5 w-1.5 rounded text-gray-900" />
								</div>

								<div dir="ltr">{description}</div>
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

const MemoizedGoodsDescriptionsList = memo(GoodsDescriptionsList);

export { MemoizedGoodsDescriptionsList as GoodsDescriptionsList };
