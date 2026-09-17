"use client";

import { memo, useContext } from "react";
import { FaEdit, FaTimes } from "react-icons/fa";
import { FaCheck } from "react-icons/fa6";

import { Personnel } from "@/hrm/personnel/models/Personnel";
import { PersonnelExpertise } from "@/hrm/personnel/models/PersonnelExpertise";
import { PersonnelExpertiseStatus } from "@/hrm/personnelExpertise/models/PersonnelExpertiseStatus";
import { updatePersonnelExpertise } from "@/hrm/personnelExpertise/services/updatePersonnelExpertise";
import { cn } from "@/lib/utils";

import { TrainingContext } from "../TrainingContext";
import { PersonnelExpertiseGroupByStatus } from "./PersonnelExpertises";

interface Props {
	items: PersonnelExpertiseGroupByStatus;
	personnel: Personnel;
	showAll: boolean;
}

export const PersonnelSkills = memo(function PersonnelSkills({
	items,
	personnel,
	showAll,
}: Props): React.ReactNode {
	const { updateExpertise } = useContext(TrainingContext);

	return (
		<>
			<div className="space-y-2">
				<div>
					<span className="rounded-xl bg-slate-600 px-2 text-xs text-white">
						مهارت ها
					</span>
				</div>
				{((items: PersonnelExpertise[]) =>
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
														const updatedExpertise =
															await updatePersonnelExpertise(item.id, {
																status:
																	item.status ===
																	PersonnelExpertiseStatus.Qualified
																		? PersonnelExpertiseStatus.Unqualified
																		: PersonnelExpertiseStatus.Qualified,
															});
														updateExpertise(personnel.id, updatedExpertise);
													}}
												/>
											</div>
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
