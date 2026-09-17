"use client";

import { memo } from "react";
import { FaSquare } from "react-icons/fa6";

import { useTaskContext } from "@/felo/tasks/hooks/useTaskContext";

import { ids } from "../../../models/Ids";

export const InspectorObligationsList = memo(
	function InspectorObligationsList(): JSX.Element {
		const {
			task: { data },
		} = useTaskContext();

		const obligations: string[] = data[ids.contractInspectorObligations];

		return (
			<div className="col-span-full col-start-1 space-y-2">
				<label>بندهای ماده:</label>

				<div className="rounded-xl border-s-4 border-gray-200 bg-gray-50 px-6 py-3">
					{obligations.length !== 0 ? (
						obligations.map((description, index) => (
							<div className="mt-1.5 first:mt-0" key={description}>
								<div className="flex items-center">
									{/* <div>
                    <FaSquare className="w-1.5 h-1.5 rounded text-gray-900" />
                  </div> */}

									<div>
										{index + 1}-5: {description}
									</div>
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
