"use client";

import { memo } from "react";
import { FaTimes } from "react-icons/fa";
import { FaCheck } from "react-icons/fa6";

import { PersonnelExpertise } from "@/hrm/personnel/models/PersonnelExpertise";
import { cn } from "@/lib/utils";

import { PersonnelExpertiseGroupByStatus } from "./PersonnelExpertises";

interface Props {
	items: PersonnelExpertiseGroupByStatus;
	showAll: boolean;
}

export const PersonnelCertificates = memo(function PersonnelCertificates({
	items,
	showAll,
}: Props): React.ReactNode {
	return (
		<>
			<div className="space-y-2">
				<div>
					<span className="rounded-xl bg-slate-600 px-2 text-xs text-white">
						آموزش ها
					</span>
				</div>
				{((items: PersonnelExpertise[]) =>
					items.length ? (
						<ul className="space-y-1">
							{items.map(
								(item) =>
									(item.status === "unqualified" ||
										(item.status === "qualified" && showAll)) && (
										<li className="flex items-center gap-x-1" key={item.id}>
											<span
												className={cn(
													"h-4 w-4 rounded-full p-[2px]",
													item.status === "qualified"
														? "bg-green-200"
														: "bg-red-200",
												)}
											>
												{item.status === "qualified" ? (
													<FaCheck className="text-xs text-green-600" />
												) : (
													<FaTimes className="text-xs text-red-600" />
												)}
											</span>
											<span className="text-xsm">{item.title}</span>
										</li>
									),
							)}
						</ul>
					) : (
						<div className="text-xs text-gray-600">مهارتی یافت نشد.</div>
					))(Object.values(items).flatMap((x) => x))}
			</div>
		</>
	);
});
