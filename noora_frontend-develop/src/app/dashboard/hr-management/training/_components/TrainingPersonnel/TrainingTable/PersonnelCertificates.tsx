"use client";

import { memo } from "react";
import { FaFolderOpen } from "react-icons/fa";

import { ChecklistStatusIcon } from "./ChecklistStatusIcon";
import {
	ChecklistItem,
	PersonnelExpertiseGroupByStatus,
} from "./PersonnelExpertises";

interface Props {
	items: PersonnelExpertiseGroupByStatus;
	showAll: boolean;
	// opens the certificate dialog of this training item
	onUpload: (item: ChecklistItem) => void;
}

export const PersonnelCertificates = memo(function PersonnelCertificates({
	items,
	showAll,
	onUpload,
}: Props): React.ReactNode {
	return (
		<>
			<div className="space-y-2">
				<div>
					<span className="rounded-xl bg-slate-600 px-2 text-xs text-white">
						آموزش ها
					</span>
				</div>
				{((items: ChecklistItem[]) =>
					items.length ? (
						<ul className="space-y-1">
							{items.map(
								(item) =>
									(item.status !== "qualified" || showAll) && (
										<li className="flex items-center gap-x-1" key={item.id}>
											<ChecklistStatusIcon status={item.status} />
											<span className="text-xsm">{item.title}</span>
											<FaFolderOpen
												className="h-4 w-4 shrink-0 cursor-pointer text-gray-500 transition-colors hover:text-gray-800"
												title="گواهینامه آموزشی"
												onClick={() => onUpload(item)}
											/>
										</li>
									),
							)}
						</ul>
					) : (
						<div className="text-xs text-gray-600">آموزشی یافت نشد.</div>
					))(Object.values(items).flatMap((x) => x))}
			</div>
		</>
	);
});
