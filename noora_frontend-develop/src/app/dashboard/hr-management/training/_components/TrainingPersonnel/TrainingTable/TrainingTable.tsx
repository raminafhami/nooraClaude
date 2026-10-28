"use client";

import { useEffect, useMemo, useState } from "react";

import SearchInput from "@/hrm/expertises/models/searchInput/searchInput";
import { Personnel } from "@/hrm/personnel/models/Personnel";
import { PersonnelAcademicDegree } from "@/hrm/personnel/models/PersonnelAcademicDegree";
import { PersonnelJob } from "@/hrm/personnel/models/PersonnelJob";
import { cn } from "@/lib/utils";
import { Loading } from "@/ui/Loader";
import { Panel } from "@/ui/Panel";
import { Table } from "@/ui/Table";

import { TrainingCertificates } from "../TrainingCertificates/TrainingCertificates";
import { ChecklistItem, PersonnelExpertises } from "./PersonnelExpertises";

interface Props {
	personnelInfo: Personnel[];
	loading: boolean;
	setSearch: (s: any) => any;
	showCheckBox: boolean;
}

interface SearchAttributeProps {
	searchName?: string;
	searchJob?: string;
}

// Arabic/Persian letter variants, ZWNJ and extra spaces must not decide a match.
function normalize(value: string | undefined): string {
	return (value ?? "")
		.replace(/ي/g, "ی")
		.replace(/ك/g, "ک")
		.replace(/‌/g, " ")
		.replace(/\s+/g, " ")
		.trim()
		.toLowerCase();
}

export function TrainingTable({ personnelInfo, loading, setSearch }: Props) {
	const [showAllExpertises, setShowAllExpertises] = useState<boolean>(true);

	const [showDialog, setShowDialog] = useState<boolean>(false);
	// the training item whose certificate dialog is open, and its person
	const [selectedPersonnel, setSelectedPersonnel] = useState<Personnel | null>(
		null,
	);
	const [selectedItem, setSelectedItem] = useState<ChecklistItem | null>(null);

	const [searchAttribute, setSearchAttribute] =
		useState<SearchAttributeProps>();

	useEffect(() => {
		const delayDebounceFn = setTimeout(() => {
			if (searchAttribute) {
				setSearch(searchAttribute);
			}
		}, 300);

		return () => clearTimeout(delayDebounceFn);
	}, [searchAttribute, setSearch]);

	// The whole personnel list is already loaded, so both searches filter it
	// in place.
	const visiblePersonnel = useMemo(() => {
		const name = normalize(searchAttribute?.searchName);
		const job = normalize(searchAttribute?.searchJob);
		if (!name && !job) return personnelInfo;

		return personnelInfo.filter((person) => {
			if (name && !normalize(person.fullname).includes(name)) return false;
			if (
				job &&
				!person.jobs.some((item) => {
					const j = item as PersonnelJob;
					return (
						normalize(j.name).includes(job) ||
						normalize(j.metadata?.goodsInspectionField).includes(job)
					);
				})
			)
				return false;
			return true;
		});
	}, [personnelInfo, searchAttribute?.searchName, searchAttribute?.searchJob]);
	const isFiltered = !!(
		normalize(searchAttribute?.searchName) || normalize(searchAttribute?.searchJob)
	);

	return (
		<>
			<TrainingCertificates
				personnel={selectedPersonnel}
				item={selectedItem}
				show={showDialog}
				onClose={() => {
					setShowDialog(false);
				}}
			/>

			<Panel.Root>
				<Table.Root>
					<Table.Head>
						<Table.Row className="bg-gray-100 text-right">
							<Table.Cell as="th" className="w-14">
								ردیف
							</Table.Cell>
							<Table.Cell as="th" className="w-36">
								<SearchInput
									placeholder="نام پرسنل"
									onChange={(value) => {
										setSearchAttribute((prev) => ({
											...prev,
											searchName: value,
										}));
									}}
									value={searchAttribute?.searchName}
								/>
							</Table.Cell>
							<Table.Cell as="th" className="w-36">
								تحصیلات
							</Table.Cell>
							<Table.Cell as="th">
								<SearchInput
									placeholder="سمت شغلی"
									onChange={(value) => {
										setSearchAttribute((prev) => ({
											...prev,
											searchJob: value,
										}));
									}}
									value={searchAttribute?.searchJob}
								/>
							</Table.Cell>
							<Table.Cell as="th">
								<div className="flex items-center gap-x-2">
									<span>آموزش ها / مهارت ها / دانش فنی</span>
									<span
										className={cn(
											"cursor-pointer rounded-xl px-2 py-0.5 text-xs transition",
											showAllExpertises
												? "bg-gray-400 text-white"
												: "bg-gray-300",
										)}
										onClick={() =>
											setShowAllExpertises((previous) => !previous)
										}
									>
										نمایش همه
									</span>
								</div>
							</Table.Cell>
						</Table.Row>
					</Table.Head>
					<Table.Body>
						{visiblePersonnel.length ? (
							visiblePersonnel.map((user: Personnel, index: number) => {
								const expertises = user.expertises!;

								return (
									<Table.Row className="align-baseline" key={user.id}>
										<Table.Cell className="text-center">{index + 1}</Table.Cell>
										<Table.Cell className="overflow-hidden text-ellipsis whitespace-nowrap">
											{user.fullname}
										</Table.Cell>
										<Table.Cell>
											{user.academics.length ? (
												<ul className="space-y-3">
													{user.academics.map(
														(item: PersonnelAcademicDegree, index: number) => {
															return (
																<li
																	className="flex flex-col gap-y-1"
																	key={index}
																>
																	<span>{item.name}</span>
																	{item.level && (
																		<span className="text-xs text-gray-600">
																			{item.level}
																		</span>
																	)}
																	{item.field && (
																		<span className="text-xs text-gray-600">{`گرایش ${item.field}`}</span>
																	)}
																</li>
															);
														},
													)}
												</ul>
											) : (
												"-"
											)}
										</Table.Cell>
										<Table.Cell>
											{user.jobs.length ? (
												<ul className="space-y-3">
													{user.jobs.map((item) => {
														const job = item as PersonnelJob;
														return (
															<li data-tooltip-id="job-des-title" key={job.id}>
																<span>{job.name}</span>
																{job.metadata?.goodsInspectionField && (
																	<span className="ms-1 text-xs text-gray-600">{`(حوزه ${job.metadata.goodsInspectionField})`}</span>
																)}
															</li>
														);
													})}
												</ul>
											) : (
												"-"
											)}
										</Table.Cell>

										<Table.Cell>
											<PersonnelExpertises
												items={expertises}
												personnel={user}
												showAll={showAllExpertises}
												onUploadCertificate={(item) => {
													setSelectedPersonnel(user);
													setSelectedItem(item);
													setShowDialog(true);
												}}
											/>
										</Table.Cell>
									</Table.Row>
								);
							})
						) : loading ? (
							<Table.Row key="loading">
								<Table.Cell></Table.Cell>

								<Table.Cell colSpan={100}>
									<Loading size="sm">در حال بارگذاری اطلاعات...</Loading>
								</Table.Cell>
							</Table.Row>
						) : (
							<Table.Row key="empty">
								<Table.Cell colSpan={100}>
									{isFiltered
										? "پرسنلی با این مشخصات یافت نشد."
										: "تخصصی یافت نشد."}
								</Table.Cell>
							</Table.Row>
						)}
					</Table.Body>
				</Table.Root>
			</Panel.Root>
		</>
	);
}
