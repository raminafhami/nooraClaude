"use client";

import { memo, useContext } from "react";
import { FaEdit } from "react-icons/fa";

import { Personnel } from "@/hrm/personnel/models/Personnel";
import { PersonnelExpertiseStatus } from "@/hrm/personnelExpertise/models/PersonnelExpertiseStatus";
import { updatePersonnelExpertise } from "@/hrm/personnelExpertise/services/updatePersonnelExpertise";

import { TrainingContext } from "../TrainingContext";
import { ChecklistStatusIcon } from "./ChecklistStatusIcon";
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
									(item.status !== "qualified" || showAll) && (
										<li
											className="group/expertise flex items-center gap-x-1"
											key={item.id}
										>
											<ChecklistStatusIcon status={item.status} />
											<span className="text-xsm">{item.title}</span>
											<div className="flex cursor-pointer opacity-0 transition group-hover/expertise:opacity-100">
												<FaEdit
													onClick={async () => {
														// ندارد / در حال آموزش -> دارد, دارد -> ندارد
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
