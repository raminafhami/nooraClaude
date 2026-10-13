"use client";

import { ChevronDown, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Permission } from "@/identity/permissions/models/Permission";
import { cn } from "@/lib/utils";

import { ACTION_LABELS } from "./permissionActions";

export interface SubjectGroup {
	subject: string;
	label: string;
	permissions: Permission[];
}

export interface PageGroup {
	label: string;
	subjectGroups: SubjectGroup[];
}

interface PermissionTreeProps {
	pageGroups: PageGroup[];
	value: string[];
	onChange: (permissions: string[]) => void;
}

type TriState = boolean | "indeterminate";

function triState(ids: string[], value: string[]): TriState {
	if (ids.length === 0) return false;
	const selected = ids.filter((id) => value.includes(id)).length;
	if (selected === 0) return false;
	if (selected === ids.length) return true;
	return "indeterminate";
}

export function PermissionTree({ pageGroups, value, onChange }: PermissionTreeProps) {
	const [searchTerm, setSearchTerm] = useState("");
	const [expandedPages, setExpandedPages] = useState<Set<string>>(new Set());
	const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set());

	const term = searchTerm.trim().toLowerCase();
	const searching = term.length > 0;

	const filteredPageGroups = useMemo(() => {
		if (!searching) return pageGroups;

		const result: PageGroup[] = [];
		for (const page of pageGroups) {
			const pageMatches = page.label.toLowerCase().includes(term);
			const subjectGroups: SubjectGroup[] = [];

			for (const group of page.subjectGroups) {
				const groupMatches = group.label.toLowerCase().includes(term);
				if (pageMatches || groupMatches) {
					subjectGroups.push(group);
					continue;
				}
				const matchingPermissions = group.permissions.filter((p) =>
					(ACTION_LABELS[p.actions[0]] ?? p.actions[0]).toLowerCase().includes(term),
				);
				if (matchingPermissions.length) {
					subjectGroups.push({ ...group, permissions: matchingPermissions });
				}
			}

			if (subjectGroups.length) {
				result.push({ label: page.label, subjectGroups });
			}
		}
		return result;
	}, [pageGroups, searching, term]);

	function togglePage(label: string) {
		setExpandedPages((prev) => {
			const next = new Set(prev);
			if (next.has(label)) next.delete(label);
			else next.add(label);
			return next;
		});
	}

	function toggleSubject(key: string) {
		setExpandedSubjects((prev) => {
			const next = new Set(prev);
			if (next.has(key)) next.delete(key);
			else next.add(key);
			return next;
		});
	}

	function setMany(ids: string[], checked: boolean) {
		if (checked) {
			onChange([...new Set([...value, ...ids])]);
		} else {
			onChange(value.filter((id) => !ids.includes(id)));
		}
	}

	return (
		<div className="rounded-lg border">
			<div className="relative border-b p-2">
				<Search className="pointer-events-none absolute start-5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
				<Input
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					placeholder="جستجو در صفحات و دسترسی‌ها..."
					className="ps-9"
				/>
			</div>

			{filteredPageGroups.length === 0 ? (
				<p className="px-4 py-6 text-center text-sm text-muted-foreground">
					موردی یافت نشد.
				</p>
			) : (
				<div className="divide-y">
					{filteredPageGroups.map((page) => {
						const pageIds = page.subjectGroups.flatMap((g) =>
							g.permissions.map((p) => p.id),
						);
						const pageState = triState(pageIds, value);
						const pageOpen = searching || expandedPages.has(page.label);
						const selectedCount = pageIds.filter((id) => value.includes(id)).length;

						return (
							<div key={page.label} className="px-3 py-2">
								<button
									type="button"
									onClick={() => togglePage(page.label)}
									className="flex w-full items-center gap-2 rounded-md py-1 text-start hover:bg-gray-50"
								>
									<ChevronDown
										className={cn(
											"size-4 shrink-0 text-muted-foreground transition-transform duration-200",
											pageOpen && "rotate-180",
										)}
									/>
									<Checkbox
										checked={pageState}
										onClick={(e) => e.stopPropagation()}
										onCheckedChange={(checked) => setMany(pageIds, checked === true)}
									/>
									<span className="font-medium">{page.label}</span>
									{selectedCount > 0 && (
										<span className="text-xs text-muted-foreground">
											({selectedCount} از {pageIds.length})
										</span>
									)}
								</button>

								{pageOpen && (
									<div className="relative ms-5 me-1 mt-1 space-y-1 border-s border-gray-200 ps-4">
										{page.subjectGroups.map((group) => {
											const subjectKey = `${page.label}::${group.subject}`;
											const groupIds = group.permissions.map((p) => p.id);
											const groupState = triState(groupIds, value);
											const groupOpen = searching || expandedSubjects.has(subjectKey);
											const groupSelectedCount = groupIds.filter((id) =>
												value.includes(id),
											).length;

											return (
												<div key={group.subject} className="relative">
													<span className="absolute -start-4 top-4 h-px w-4 bg-gray-200" />
													<button
														type="button"
														onClick={() => toggleSubject(subjectKey)}
														className="flex w-full items-center gap-2 rounded-md py-1 text-start hover:bg-gray-50"
													>
														<ChevronDown
															className={cn(
																"size-3.5 shrink-0 text-muted-foreground transition-transform duration-200",
																groupOpen && "rotate-180",
															)}
														/>
														<Checkbox
															checked={groupState}
															onClick={(e) => e.stopPropagation()}
															onCheckedChange={(checked) =>
																setMany(groupIds, checked === true)
															}
														/>
														<span className="text-sm text-gray-700">
															{group.label}
														</span>
														{groupSelectedCount > 0 && (
															<span className="text-xs text-muted-foreground">
																({groupSelectedCount} از {groupIds.length})
															</span>
														)}
													</button>

													{groupOpen && (
														<div className="relative ms-5 me-1 mt-1 flex flex-wrap gap-x-5 gap-y-1.5 border-s border-gray-200 py-1 ps-4">
															{group.permissions.map((permission) => (
																<label
																	key={permission.id}
																	className="relative flex cursor-pointer items-center gap-2 text-sm"
																>
																	<span className="absolute -start-4 top-1/2 h-px w-4 -translate-y-1/2 bg-gray-200" />
																	<Checkbox
																		checked={value.includes(permission.id)}
																		onCheckedChange={(checked) =>
																			setMany([permission.id], checked === true)
																		}
																	/>
																	<span>
																		{ACTION_LABELS[permission.actions[0]] ??
																			permission.actions[0]}
																	</span>
																</label>
															))}
														</div>
													)}
												</div>
											);
										})}
									</div>
								)}
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}
