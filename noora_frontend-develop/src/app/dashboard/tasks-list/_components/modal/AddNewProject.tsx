import { useEffect, useState } from "react";
import { toast } from "sonner";

import PatchProject from "@/api/tasks-manager/patchProject";
import PatchProjectStatuses from "@/api/tasks-manager/patchProjectStatuses";
import PostNewProject from "@/api/tasks-manager/postNewProject";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SelectSeparator } from "@/components/ui/select";
import PostNotifications from "@/notifications/services/postNotification";
import { ProjectTaskLabel } from "@/projects/models/ProjectTaskLabel";
import { Loading } from "@/ui/Loader";
import MyModal from "@/ui/Modal/contextlessModal/Modal";
import { Separator } from "@radix-ui/react-select";

import { AddProjectLabel } from "../modules/AddProjectLabel";
import AddProjectUser from "../modules/AddProjectUser";
import ColumnsManager from "../modules/ColumnsManager";

interface AddNewProjectProps {
	isShow: boolean;
	setShow: (isShow?: any) => void;
	getData: () => void;
	isEdit?: any;
	data?: any;
}

interface FormAttribuiteProps {
	name?: string;
	categoryId?: string;
	endIndex?: number;
	startIndex?: number;
	firstCount?: string;
	SecondCount?: string;
	quCount?: number | undefined;
}

export default function AddNewProject({
	isShow,
	setShow,
	getData,
	isEdit,
	data,
}: AddNewProjectProps) {
	const [loading, setLoading] = useState<boolean>(false);
	const [inputs, setInputs] = useState<any>([
		{ name: "To Do", order: 1 },
		{ name: "In Progress", order: 2 },
		{ name: "Done", order: 3 },
	]);
	const [labels, setLabels] = useState<ProjectTaskLabel[]>([]);
	const [users, setUsers] = useState<any>();
	const [formAttribuite, setFormAttribuite] = useState<FormAttribuiteProps>();
	const [ids, setIds] = useState<any>();
	const [mode, setMode] = useState<"kanban" | "custom" | undefined>(
		isEdit ? "custom" : undefined,
	);
	useEffect(() => {
		if (data) {
			setLabels(data.labels);
		} else {
			setLabels([]);
		}
	}, [data]);

	async function sendProject() {
		setLoading(true);
		try {
			if (!formAttribuite?.name) {
				return handleInvalidForm("نام را وارد کنید!");
			} else if (ids?.length <= 0) {
				return handleInvalidForm("اعضاء را وارد کنید!");
			} else {
				if (isEdit && data) {
					const res = await PatchProject({
						labels: labels.map((label: ProjectTaskLabel) => label.id),
						name: formAttribuite?.name,
						members: ids,
						id: data.id,
					});
					if (res) {
						toast.success("با موفقیت ویرایش شد!");
						setTimeout(() => {
							getData();
							setLoading(false);
						}, 300);
					}
				} else {
					const res = await PostNewProject({
						labels: labels.map((label: ProjectTaskLabel) => label.id),
						name: formAttribuite?.name,
						members: ids,
						statuses: inputs,
					});
					if (res) {
						setLabels([]);
						await PostNotifications({
							title: `شما به پروژه ${formAttribuite?.name} اضافه شدید.`,
							description: " ",
							category: `projects:${res.result.id}`,
							groups: [],
							users: ids,
							priority: "medium",
							sendNotification: true,
						});
						toast.success("با موفقیت ثبت شد!");
						setTimeout(() => {
							getData();
							setLoading(false);
							setShow(false);
						}, 300);
					}
				}
			}
		} catch (e) {
			setLoading(false);
			setLabels([]);
		}
	}
	async function updateStatuses() {
		setLoading(true);
		try {
			let res = await PatchProjectStatuses({
				statuses: inputs,
				projectId: data.id,
			});
			if (res) {
				toast.success("با موفقیت ذخیره شد!");
				setTimeout(() => {
					getData();
					setLoading(false);
				}, 300);
			}
		} catch {
			setLoading(false);
			toast.error("خطایی در بروزرسانی وضعیت ها رخ داده است!");
		}
	}

	function handleInvalidForm(message: string) {
		toast.warning(message);
		setLoading(false);
	}

	useEffect(() => {
		if (data) {
			setFormAttribuite((prev) => ({
				...prev,
				name: data.name,
			}));
			setInputs(data.statuses);
			setUsers(data.members);
		}
	}, [data]);

	return (
		<>
			{
				<MyModal
					size={"4xl"}
					title={`${isEdit ? `ویرایش ${data?.name}` : "افزودن پروژه"}`}
					content={
						<>
							{loading ? (
								<Loading />
							) : (
								<div
									className={`"justify-center" mt-6 flex max-h-[30rem] w-full overflow-y-auto`}
								>
									<div
										className={`col-span-9 col-start-1 mb-[1rem] flex h-fit min-h-[15rem] w-full flex-col rounded-xl border-x-4 border-gray-200 bg-gray-100 p-1`}
									>
										{!isEdit && (
											<>
												<div
													className={`flex items-center justify-center ${
														!mode ? "h-[15rem]" : "my-4"
													} w-full`}
												>
													<Button
														disabled={mode === "kanban"}
														onClick={() => setMode("kanban")}
														className={`mx-2 p-10 text-lg`}
													>
														Kanban
													</Button>

													<Button
														disabled={mode === "custom"}
														onClick={() => setMode("custom")}
														className={`mx-2 p-10 text-lg`}
													>
														دلخواه
													</Button>
												</div>
												<SelectSeparator className="bg-gray-300" />
											</>
										)}
										{mode && (
											<>
												<label className="mx-2 mt-[.5rem] select-none">
													نام
												</label>
												<input
													onChange={(event) =>
														setFormAttribuite((prev) => ({
															...prev,
															name: event.target.value,
														}))
													}
													value={formAttribuite?.name}
													className={`group relative mb-[1rem] mt-[1rem] w-[300px] text-ellipsis rounded-2xl border-2 border-white bg-white px-2 py-2 pl-[2.8rem] pr-[.5rem] text-[.9rem] placeholder-gray-400 focus:border-blue-500 focus:text-black focus:outline-0 md:mx-[1rem]`}
													placeholder={"نام"}
												/>
												{!isEdit && (
													<>
														<ColumnsManager
															mode={mode}
															inputs={inputs}
															setInputs={setInputs}
														/>
													</>
												)}
												<label className="mx-2 mt-[.5rem] w-full select-none">
													کاربران
												</label>
												<AddProjectUser
													setIds={setIds}
													ids={ids}
													users={users}
												/>
												<AddProjectLabel
													labels={labels}
													setLabels={setLabels}
												/>
												<div className="flex w-full p-4">
													<Button
														className="ms-auto md:w-32"
														onClick={() => sendProject()}
													>
														{loading ? (
															<Loading
																className="flex justify-center"
																size={"sm"}
															/>
														) : (
															"ذخیره"
														)}
													</Button>
												</div>
											</>
										)}

										{isEdit && (
											<>
												<Separator className="mx-1 my-4 h-1 rounded-2xl bg-gray-200" />

												<div>
													<ColumnsManager
														inputs={inputs}
														setInputs={setInputs}
													/>
												</div>

												<div className="w-full">
													<Button
														onClick={() => updateStatuses()}
														className={`text-ellipsispy-2 group relative float-left mx-[1rem] mb-[1rem] mt-[1rem] w-[300px] max-w-[10rem] text-[.9rem] focus:outline-0`}
													>
														{loading ? (
															<Loading
																className="flex justify-center"
																size={"sm"}
															/>
														) : (
															"برزورسانی وضعیت ها"
														)}
													</Button>
												</div>
											</>
										)}
									</div>
								</div>
							)}
						</>
					}
					name="addProducts"
					onClose={() => setShow(false)}
					show={isShow}
				/>
			}
		</>
	);
}
