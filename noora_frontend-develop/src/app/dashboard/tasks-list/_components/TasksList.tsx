"use client";

import { useState } from "react";
import { FaPenToSquare, FaTrash } from "react-icons/fa6";
import { toast } from "sonner";

import DeleteProject from "@/api/tasks-manager/deleteProject";
import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import { DynamicLink } from "@/components/ui/dynamic-link";
import { Progress } from "@/components/ui/progress";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { Project } from "@/projects/models/Project";
import { extractProjectMembers } from "@/projects/utils/extractProjectMembers";
import { extractProjectTaskLabels } from "@/projects/utils/extractProjectTaskLabels";

import AddNewProject from "./modal/AddNewProject";

interface TasksListProps {
	projects?: Project[];
	loading: boolean;
	getData: () => void;
	setLoading: (value: boolean) => void;
}

export function TasksList({
	projects,
	loading,
	getData,
	setLoading,
}: TasksListProps) {
	const { identity } = useLoggedInUser();

	const [isModal, setIsModal] = useState<boolean>(false);
	const [modalData, setModalData] = useState<any>();

	async function deleteProject(id: string) {
		try {
			setLoading(true);

			await DeleteProject({ id });

			toast.success("با موفقیت حذف شد!");

			getData();
		} catch (err) {
			console.error(err);
			toast.error("خطایی رخ داد!");
		} finally {
			setLoading(false);
		}
	}

	return (
		<>
			{isModal && modalData && (
				<AddNewProject
					key="addproject"
					isShow={isModal}
					setShow={setIsModal}
					getData={getData}
					data={modalData}
					isEdit
				/>
			)}

			<Table loading={loading}>
				<TableHeader>
					<TableRow>
						<TableHead className="w-[5%]">ردیف</TableHead>
						<TableHead className="w-[10%]">نام</TableHead>
						<TableHead className="w-1/6">درصد پیشرفت</TableHead>
						<TableHead className="w-1/6">اعضاء</TableHead>
						<TableHead className="w-1/6">برچسب ها</TableHead>
						{identity.groups.includes("system-admin") && (
							<TableHead className="w-1/6">عملیات</TableHead>
						)}
					</TableRow>
				</TableHeader>

				<TableBody>
					{projects?.length ? (
						projects.map((project, index) => {
							const members = extractProjectMembers(project);
							const labels = extractProjectTaskLabels(project);

							return (
								<TableRow key={project.id}>
									<TableCell>{index + 1}</TableCell>
									<TableCell className="overflow-hidden text-ellipsis whitespace-nowrap">
										<DynamicLink href={`/dashboard/tasks-list/${project?.id}`}>
											{project.name}
										</DynamicLink>
									</TableCell>
									<TableCell className="overflow-hidden text-ellipsis whitespace-nowrap p-4">
										{"% " + project.totalProgress.toFixed(2)}
										<Progress
											className="max-w-[15rem]"
											value={Number(project.totalProgress.toFixed(2))}
										/>
									</TableCell>
									<TableCell>
										<div className="relative h-max min-h-14 w-full">
											{members
												? members.map((member, i) => {
														if (i >= 4) return null;

														return (
															<TooltipProvider
																delayDuration={100}
																key={member?.id}
															>
																<Tooltip>
																	<TooltipTrigger
																		style={{ right: i * 28 }}
																		className={`absolute m-1 mx-[.1rem] flex h-11 w-11 scale-90 select-none items-center justify-center rounded-full bg-indigo-300 p-1 font-bold text-white ring-1 ring-white transition-all hover:z-50 hover:scale-110 hover:bg-indigo-400`}
																	>
																		{member.name.slice(0, 1)}{" "}
																		{member.lastname.slice(0, 1)}
																	</TooltipTrigger>
																	<TooltipContent>
																		{member.name} {member.lastname}
																	</TooltipContent>
																</Tooltip>
															</TooltipProvider>
														);
													})
												: "-"}

											{members && members.length > 4 && (
												<div
													style={{ right: 4 * 28 }}
													className="absolute m-1 mx-[.1rem] flex h-11 w-11 scale-90 select-none items-center justify-center rounded-full bg-blue-300 p-1 font-bold text-white ring-1 ring-white"
												>
													{members.length - 4}+
												</div>
											)}
										</div>
									</TableCell>

									<TableCell className="overflow-hidden text-ellipsis whitespace-nowrap align-middle">
										<div className="flex w-[250px] flex-row flex-nowrap gap-x-2 overflow-x-hidden">
											{labels?.map((label) => (
												<div
													key={label.id}
													className="flex h-full items-center justify-center gap-x-1 rounded-full bg-gray-100 px-2 py-1 text-black"
												>
													<span>{label.title}</span>
												</div>
											))}
										</div>
									</TableCell>

									{identity.groups.includes("system-admin") && (
										<TableCell>
											<button
												onClick={() => {
													setIsModal(true);
													setModalData(project);
												}}
												className="flex-inline btn mx-[.5rem] items-center rounded bg-gray-100 px-1 py-1 text-black hover:bg-blue-400 hover:text-white"
											>
												<FaPenToSquare />
											</button>
											<button
												onClick={() => deleteProject(project.id)}
												className="flex-inline btn mx-[.5rem] items-center rounded bg-gray-100 px-1 py-1 text-black hover:text-red-500"
											>
												<FaTrash />
											</button>
										</TableCell>
									)}
								</TableRow>
							);
						})
					) : (
						<TableRow>
							<TableCell colSpan={100}>موردی یافت نشد...</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</>
	);
}
