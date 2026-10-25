"use client";

import { memo, useContext } from "react";
import { FaEdit, FaTimes } from "react-icons/fa";
import { FaCheck } from "react-icons/fa6";

import { Personnel } from "@/hrm/personnel/models/Personnel";
import { PersonnelExpertiseStatus } from "@/hrm/personnelExpertise/models/PersonnelExpertiseStatus";
import { updatePersonnelExpertise } from "@/hrm/personnelExpertise/services/updatePersonnelExpertise";
import { cn } from "@/lib/utils";

import { TrainingContext } from "../TrainingContext";
import {
	ChecklistItem,
	PersonnelExpertiseGroupByStatus,
} from "./PersonnelExpertises";

interface Props {
	items: PersonnelExpertiseGroupByStatus;
	personnel: Personnel;
	showAll: boolean;
	// Also used for the "دانش فنی" group (same toggleable checklist).
	label?: string;
	emptyText?: string;
}

export const PersonnelSkills = memo(function PersonnelSkills({
	items,
	personnel,
	showAll,
	label = "مهارت ها",
	emptyText = "مهارتی یافت نشد.",
}: Props): React.ReactNode {
	const { updateExpertise } = useContext(TrainingContext);

	return (
		<>
			<div className="space-y-2">
				<div>
					<span className="rounded-xl bg-slate-600 px-2 text-xs text-white">
						{label}
					</span>
				</div>
				{((items: ChecklistItem[]) =>
					items.length ? (
						<ul className="space-y-1">
							{items.map(
								(item) =>
									(item.status === "unqualified" ||
										(item.status === "qualified" && showAll)) && (
										<li
											className="group/expertise flex items-center gap-x-1"
											key={item.id}
										>
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
											<div className="flex cursor-pointer opacity-0 transition group-hover/expertise:opacity-100">
												<FaEdit
													onClick={async () => {
														const status =
															item.status === PersonnelExpertiseStatus.Qualified
																? PersonnelExpertiseStatus.Unqualified
																: PersonnelExpertiseStatus.Qualified;
														// Every copy of a merged line, so they never disagree.
														for (const id of item.copyIds) {
															const updatedExpertise =
																await updatePersonnelExpertise(id, { status });
															updateExpertise(personnel.id, updatedExpertise);
														}
													}}
												/>
											</div>
										</li>
									),
							)}
						</ul>
					) : (
						<div className="text-xs text-gray-600">{emptyText}</div>
					))(Object.values(items).flatMap((x) => x))}
			</div>
		</>
	);
});
