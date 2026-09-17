"use client";

import { memo, useMemo } from "react";
import { FaSquare } from "react-icons/fa6";

import { useTaskContext } from "@/felo/tasks/hooks/useTaskContext";

import { ids } from "../../../models/Ids";

export const GoodsDescriptionsList = memo(
	function GoodsDescriptionsList(): JSX.Element {
		const {
			task: { data },
		} = useTaskContext();

		const goodsDescriptionsString: string = data[ids.goodsDescriptions];
		const goodsDescriptions: string[] = useMemo(() => {
			return goodsDescriptionsString?.split(",").filter((x) => x) || [];
		}, [goodsDescriptionsString]);

		return (
			<div className="col-span-6 col-start-1 space-y-2">
				<label>شرح کالاها:</label>

				<div className="rounded-xl border-s-4 border-gray-200 bg-gray-50 px-6 py-3">
					{goodsDescriptions.length !== 0 ? (
						goodsDescriptions.map((description) => (
							<div className="mt-1.5 first:mt-0" key={description}>
								<div className="flex items-center">
									<div>
										<FaSquare className="h-1.5 w-1.5 rounded text-gray-900" />
									</div>

									<div className="ms-2">{description}</div>
								</div>
							</div>
						))
					) : (
						<div key="empty">-</div>
					)}
				</div>
			</div>
		);
	},
);
