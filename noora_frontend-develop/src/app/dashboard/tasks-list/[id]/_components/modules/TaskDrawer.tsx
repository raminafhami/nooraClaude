import moment from "jalali-moment";
import { useEffect, useState } from "react";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { FaDownload, FaEdit, FaTrash } from "react-icons/fa";
import { HiDotsHorizontal } from "react-icons/hi";
import { MdCancel } from "react-icons/md";
import DatePicker from "react-multi-date-picker";
import { toast } from "sonner";

import DeleteNewTaskComment from "@/api/tasks-manager/comments/deleteNewTaskComment";
import EditNewTaskComment from "@/api/tasks-manager/comments/editNewTaskComment";
import GetTaskCommentsById from "@/api/tasks-manager/comments/getTaskCommentsById";
import PostNewTaskComment from "@/api/tasks-manager/comments/postNewTaskComment";
import { downloadProjectTaskFile } from "@/api/tasks-manager/downloadProjectTaskFile";
import PatchProjectTask, {
	PatchProjectTaskProps,
} from "@/api/tasks-manager/patchProjectTask";
import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
} from "@/components/ui/drawer";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import {
	ProjectTaskReminderMethod,
	projectTaskReminderMethod,
} from "@/projects/enums/ProjectTaskReminderMethod";
import { getProjectTaskNo } from "@/projects/utils/getProjectTaskNo";
import { Loading } from "@/ui/Loader";
import downloadBlob from "@/utils/downloadBlob";

import AddProjectLabel from "./AddProjectLabel";
import FindUser from "./FindUser";

interface Props {
	isModal: boolean;
	setIsModal: any;
	data: any;
	allData: any;
	getTasks: any;
}

export default function TaskDrawer({
	isModal,
	setIsModal,
	data,
	allData,
	getTasks,
}: Props) {
	const [formAttribuite, setFormAttribuite] = useState<PatchProjectTaskProps>();
	const [ids, setIds] = useState<any>();
	const [labels, setLabels] = useState<any>();
	const [loading, setLoading] = useState<boolean>(true);
	const [comments, setComments] = useState<any>([]);
	const [newComment, setNewComment] = useState<string>("");
	const [editComment, setEditComment] = useState<string>("");
	const [commentid, setCommentid] = useState<string>("");
	const { identity } = useLoggedInUser();

	async function getComments() {
		setLoading(true);
		try {
			let res = await GetTaskCommentsById({ id: data.id, page: 0, size: 99 });
			if (res) {
				setComments(res?.result?.data);
				setLoading(false);
			}
		} catch {
			toast.error("خطایی در دریافت نظرات رخ داد!");
			setLoading(false);
		}
	}

	useEffect(() => {
		getComments();
	}, []);

	async function postComments() {
		setLoading(true);
		try {
			let res = await PostNewTaskComment({
				text: newComment,
				projectTaskId: data.id,
			});
			if (res) {
				setNewComment("");
				getComments();
				setLoading(false);
			}
		} catch {
			toast.error("خطایی در دریافت نظرات رخ داد!");
			setLoading(false);
		}
	}

	async function editComments(id: string) {
		setLoading(true);
		try {
			let res = await EditNewTaskComment({
				text: editComment,
				id,
			});
			if (res) {
				setNewComment("");
				setEditComment("");
				getComments();
				setLoading(false);
			}
		} catch {
			toast.error("خطایی در دریافت نظرات رخ داد!");
			setLoading(false);
		}
	}

	async function deleteComments(id: string) {
		setLoading(true);
		try {
			let res = await DeleteNewTaskComment({ id });
			if (res) {
				setTimeout(() => {
					getComments();
					setLoading(false);
				}, 300);
			}
		} catch {
			toast.error("خطایی در دریافت نظرات رخ داد!");
			setLoading(false);
		}
	}

	async function updateTask() {
		setLoading(true);
		try {
			const res = await PatchProjectTask({
				assignee: ids?.id,
				deadline: formAttribuite?.deadline
					? moment(formAttribuite?.deadline)?.locale("en").format("YYYY-MM-DD")
					: "",
				description: formAttribuite?.description,
				id: formAttribuite?.id,
				labels: labels,
				priority: formAttribuite?.priority,
				progress: 0,
				status: formAttribuite?.status,
				title: formAttribuite?.title,
				isConfidential: formAttribuite?.isConfidential,
			});
			if (res) {
				setLoading(false);
				setIsModal(false);
				getTasks();
			}
		} catch (e) {
			toast.error("خطایی رخ داد!");
			setLoading(false);
		}
	}
	useEffect(() => {
		if (data) {
			setIds(data?.assignee);
			setLabels(data?.labels);
			setFormAttribuite((prev) => ({
				...prev,
				title: data?.title,
				description: data?.description,
				assignee: data?.assignee,
				deadline: data?.deadline,
				labels: data?.labels,
				id: data?.id,
				isConfidential: data?.isConfidential,
				priority: data?.priority,
				progress: data?.progress,
				status: data?.status,
			}));
			setIds(data?.assignee);
		}
	}, [data]);

	return (
		<Drawer open={isModal} onClose={() => setIsModal(false)}>
			<DrawerContent className="transition-all">
				<div className="flex max-h-[50rem] w-full flex-wrap overflow-y-auto">
					<DrawerHeader>
						<DrawerTitle className="w-full text-right">
							<DropdownMenu>
								<DropdownMenuTrigger className="absolute left-6 top-4 w-fit">
									<HiDotsHorizontal size={25} className="hover:text-blue-500" />
								</DropdownMenuTrigger>
								<DropdownMenuContent>
									<DropdownMenuLabel className="text-right">
										تغییر وضعیت به
									</DropdownMenuLabel>
									<DropdownMenuSeparator />
									{allData?.statuses?.map(
										(column: any, index: number) =>
											column?.id !== data?.status && (
												<DropdownMenuItem
													className="justify-end"
													key={index}
													onSelect={() =>
														setFormAttribuite((prev) => ({
															...prev,
															status: column?.id,
														}))
													}
												>
													{column?.name}
												</DropdownMenuItem>
											),
									)}
								</DropdownMenuContent>
							</DropdownMenu>
							<div className="flex w-full">
								<div className="flex w-max items-center justify-center">
									<label className="mx-4 my-[.5rem] select-none text-right text-sm font-normal">
										تاریخ ایجاد:
									</label>
									{data?.createdAt ? (
										<Badge>
											{moment(data?.createdAt)?.format("jYYYY/jMM/jDD")}
										</Badge>
									) : (
										""
									)}
								</div>

								<div className="flex w-max items-center justify-center">
									<label className="mx-4 my-[.5rem] select-none text-right text-sm font-normal">
										ایجاد کننده:
									</label>
									{data?.createdBy ? (
										<Badge>{`${data?.createdBy?.name} ${data?.createdBy?.lastname}`}</Badge>
									) : (
										""
									)}
								</div>
							</div>
						</DrawerTitle>
					</DrawerHeader>
					{loading ? (
						<Loading
							horizontalPlacement={"center"}
							verticalPlacement={"center"}
						/>
					) : (
						<div className="w-full rounded-2xl bg-gray-100 p-4 px-4 pb-2">
							<div className="flex flex-wrap items-baseline justify-center space-x-2 sm:justify-start">
								<div>
									<div className="mb-4 flex w-max flex-col">
										<label className="mx-4 my-[.5rem] select-none text-right font-normal">
											شماره
										</label>
										<Input
											className="mx-[1rem] w-[300px]"
											disabled
											value={getProjectTaskNo(data.taskNo)}
										/>
									</div>

									<div className="flex w-max flex-col">
										<label className="mx-4 my-[.5rem] select-none text-right font-normal">
											عنوان
										</label>
										<textarea
											className={`group relative mx-[1rem] mb-[1rem] h-[5rem] w-[300px] resize-none text-ellipsis rounded-2xl border-r-2 border-none bg-white px-2 py-2 pl-[1rem] pr-[.5rem] text-[13px] font-normal leading-4 placeholder-gray-400 focus:bg-blue-300 focus:text-white focus:placeholder-white focus:outline-0`}
											value={formAttribuite?.title}
											onChange={(event) =>
												setFormAttribuite((prev) => ({
													...prev,
													title: event.target.value,
												}))
											}
										/>
									</div>

									<div className="flex w-max flex-col">
										<label className="mx-4 my-[.5rem] select-none text-right font-normal">
											توضیحات
										</label>
										<textarea
											value={formAttribuite?.description}
											onChange={(event) =>
												setFormAttribuite((prev) => ({
													...prev,
													description: event.target.value,
												}))
											}
											className={`group relative mx-[1rem] mb-[1rem] h-[15rem] w-[300px] resize-none text-ellipsis rounded-2xl border-r-2 border-none bg-white px-2 py-2 pl-[1rem] pr-[.5rem] text-[13px] placeholder-gray-400 focus:bg-blue-300 focus:text-white focus:placeholder-white focus:outline-0`}
											placeholder={"توضیحات"}
										/>
									</div>
								</div>
								<div>
									<div className="mb-4 flex flex-col">
										<label className="mx-4 my-[.5rem] select-none text-right font-normal">
											اختصاص به
										</label>
										<FindUser setUser={setIds} user={ids} data={allData} />
									</div>

									<div className="relative flex flex-col">
										<label className="mx-4 my-[.5rem] select-none text-right font-normal">
											وضعیت
										</label>

										<select
											onChange={(event) =>
												setFormAttribuite((prev) => ({
													...prev,
													status: event.target.value,
												}))
											}
											className={`group relative mx-[1rem] mb-[1rem] w-[300px] text-ellipsis rounded-2xl border-2 border-white bg-white px-2 py-2 text-[.9rem] placeholder-gray-400 focus:border-blue-500 focus:text-black focus:outline-0`}
											defaultValue={
												formAttribuite?.status
													? formAttribuite?.status
													: "undefined"
											}
										>
											<option
												value={"undefined"}
												disabled
												selected={formAttribuite?.status ? false : true}
											>
												انتخاب
											</option>
											{allData?.statuses?.map((cat: any) => (
												<option
													key={cat.id}
													value={cat.id}
													selected={
														formAttribuite?.status &&
														formAttribuite?.status === cat.id
															? true
															: false
													}
												>
													{cat.name}
												</option>
											))}
										</select>
									</div>

									<div className="relative flex flex-col">
										<label className="mx-4 my-[.5rem] select-none text-right font-normal">
											اولویت
										</label>
										<select
											onChange={(event) =>
												setFormAttribuite((prev) => ({
													...prev,
													priority: +event.target.value,
												}))
											}
											onKeyDown={() => null}
											className={`group relative mx-[1rem] mb-[1rem] w-[300px] text-ellipsis rounded-2xl border-2 border-white bg-white px-2 py-2 text-[.9rem] placeholder-gray-400 focus:border-blue-500 focus:text-black focus:outline-0`}
											defaultValue={
												formAttribuite?.priority
													? formAttribuite?.priority
													: "undefined"
											}
										>
											<option
												value={"undefined"}
												disabled
												selected={formAttribuite?.priority ? false : true}
											>
												Select / انتخاب
											</option>
											<option
												value={3}
												selected={formAttribuite?.priority ? false : true}
											>
												High / فوری
											</option>
											<option
												value={2}
												selected={formAttribuite?.priority ? false : true}
											>
												Normal / معمولی
											</option>
											<option
												value={1}
												selected={formAttribuite?.priority ? false : true}
											>
												Low / پایین
											</option>
										</select>
									</div>

									<div className="flex flex-col">
										<label className="mx-4 my-[.5rem] select-none text-right font-normal">
											تاریخ
										</label>
										<DatePicker
											calendar={persian}
											locale={persian_fa}
											containerClassName="max-w-[300px] mx-[1rem]"
											inputClass={` w-[300px] text-[.9rem] mb-[1rem]  pr-[.5rem] border-white border-2 bg-white rounded-2xl group relative text-ellipsis focus:border-blue-500 placeholder-gray-400 focus:text-black py-2 px-2 focus:outline-0`}
											placeholder="تاریخ"
											calendarPosition="bottom"
											minDate={new Date()}
											onFocusedDateChange={(dateFocused, dateClicked) =>
												setFormAttribuite((prev: any) => ({
													...prev,
													deadline: dateClicked?.toDate().toISOString(),
												}))
											}
											value={
												formAttribuite?.deadline ? formAttribuite?.deadline : ""
											}
										/>
									</div>

									<div className="mb-4 flex flex-col">
										<label className="mx-4 my-[.5rem] select-none text-right font-normal">
											یادآور
										</label>
										<Input
											disabled
											value={
												data.reminder
													? moment(data.reminder).format("jYYYY/jMM/jDD HH:mm")
													: "-"
											}
										/>
									</div>

									{data.reminder && data.reminderMethod && (
										<div className="mb-4 flex flex-col">
											<label className="mx-4 my-[.5rem] select-none text-right font-normal">
												نحوه یادآوری
											</label>
											<Input
												disabled
												value={
													projectTaskReminderMethod[
														data.reminderMethod as ProjectTaskReminderMethod
													]?.title
												}
											/>
										</div>
									)}

									<div className="flex flex-col">
										<label className="">برچسب</label>
										<AddProjectLabel
											setIds={setLabels}
											labels={labels}
											key={data?.id}
										/>
									</div>
									<div className="flex flex-col">
										<label className="mx-4 mt-3 select-none text-right font-normal">
											محرمانه؟
										</label>
										<Switch
											className="m-3"
											checked={formAttribuite?.isConfidential}
											onCheckedChange={(value: boolean) =>
												setFormAttribuite((prev) => ({
													...prev,
													isConfidential: value,
												}))
											}
										/>
									</div>
								</div>

								<div>
									<div className="mx-2 flex flex-col items-start justify-center px-2">
										<label className="mb-2 select-none text-right font-normal">
											فایل ها
										</label>
										<div>
											{data.files.length > 0 && (
												<div className="group relative mx-[1rem] mb-[1rem] flex w-[200px] flex-col gap-2 sm:w-[200px] lg:w-[400px]">
													{data.files.map((file: any, index: number) => (
														<div
															key={index}
															className="flex w-full flex-row items-center gap-x-2 text-ellipsis rounded-2xl border-2 border-white bg-white px-2 py-2 text-[.9rem] placeholder-gray-400 focus:border-blue-500 focus:text-black focus:outline-0"
														>
															<div className="w-80">
																{file.split("/").pop().split(".").shift()}
															</div>
															<Badge className="h-full px-2 py-1">
																{file.split(".").pop()}
															</Badge>
															<div>
																<button
																	onClick={async () => {
																		const blob = await downloadProjectTaskFile({
																			filePath: file,
																		});

																		downloadBlob({ blob, openInNewTab: true });
																	}}
																>
																	<FaDownload className="text-blue-800" />
																</button>
															</div>
														</div>
													))}
												</div>
											)}
										</div>
									</div>
									<div className="mb-2 flex max-h-[34rem] w-[20rem] flex-col sm:mb-0 lg:w-[30rem]">
										<label className="mx-4 my-[.5rem] select-none text-right font-normal">
											نظرات
										</label>
										<div className="mx-[1rem] max-h-[24rem] min-w-32 overflow-y-auto rounded-xl bg-white p-4">
											{comments?.length
												? comments?.map((comment: any) => (
														<div
															key={comment.id}
															className="group relative flex min-h-[6rem] items-center justify-between rounded-xl p-2 transition-all hover:bg-gray-50"
														>
															<div className="my-[1rem] flex items-center p-2">
																<TooltipProvider delayDuration={100}>
																	<Tooltip>
																		<TooltipTrigger>
																			<div className="ml-4 mt-2">
																				<div className="flex h-8 w-8 select-none items-center justify-center rounded-full bg-blue-400 p-1 font-bold text-white md:h-11 md:w-11">
																					{comment?.createdBy?.name?.slice(
																						0,
																						1,
																					)}{" "}
																					{comment?.createdBy?.lastname?.slice(
																						0,
																						1,
																					)}
																				</div>
																			</div>
																		</TooltipTrigger>
																		<TooltipContent className="">
																			<p>
																				{comment?.createdBy?.name}{" "}
																				{comment?.createdBy?.lastname}
																			</p>
																		</TooltipContent>
																	</Tooltip>
																</TooltipProvider>{" "}
																<p className="my-2 max-w-[19rem] overflow-x-hidden whitespace-break-spaces text-wrap break-words">
																	{comment?.text}
																</p>
															</div>
															<div className="opacity-0 group-hover:opacity-100">
																{identity?.id === comment?.createdBy?.id && (
																	<>
																		<FaTrash
																			size={13}
																			onClick={() =>
																				deleteComments(comment?.id)
																			}
																			className="my-1 cursor-pointer text-red-500 transition-all hover:text-red-700"
																		/>
																		<FaEdit
																			size={13}
																			onClick={() => {
																				setEditComment(comment?.text);
																				setCommentid(comment?.id);
																			}}
																			className="my-1 cursor-pointer text-blue-500 transition-all hover:text-blue-700"
																		/>
																	</>
																)}
															</div>
															<Badge
																variant={"secondary"}
																className="absolute bottom-0 left-2 font-normal"
															>
																{comment?.modifiedAt
																	? moment(comment?.modifiedAt)
																			.locale("fa")
																			.format("YYYY/MM/DD")
																	: comment?.createdAt
																		? moment(comment?.createdAt)
																				.locale("fa")
																				.format("HH:mm - YYYY/MM/DD")
																		: "-"}
															</Badge>
														</div>
													))
												: "موردی یافت نشد!"}
										</div>
										{editComment?.length ? (
											<div className="mt-4">
												<MdCancel
													size={17}
													onClick={() => setEditComment("")}
													className="mx-[1rem] w-fit cursor-pointer text-red-500 transition-all hover:text-red-700"
												/>
											</div>
										) : (
											""
										)}
										{!editComment?.length ? (
											<textarea
												className={`group relative mx-[1rem] mb-[1rem] mt-[1rem] h-[4rem] resize-none text-ellipsis rounded-2xl border-r-2 border-none bg-white px-2 py-2 pl-[1rem] pr-[.5rem] text-[13px] font-normal leading-4 placeholder-gray-400 focus:bg-blue-300 focus:text-white focus:placeholder-white focus:outline-0`}
												value={newComment}
												placeholder="متن نظر..."
												onChange={(event) => setNewComment(event.target.value)}
											/>
										) : (
											""
										)}
										{editComment?.length ? (
											<textarea
												className={`group relative mx-[1rem] mb-[1rem] mt-[1rem] h-[4rem] resize-none text-ellipsis rounded-2xl border-r-2 border-none bg-white px-2 py-2 pl-[1rem] pr-[.5rem] text-[13px] font-normal leading-4 placeholder-gray-400 focus:bg-blue-300 focus:text-white focus:placeholder-white focus:outline-0`}
												value={editComment}
												placeholder="متن نظر..."
												onChange={(event) => setEditComment(event.target.value)}
											/>
										) : (
											""
										)}

										<Button
											disabled={
												(!newComment?.length && !editComment?.length) || loading
											}
											onClick={() =>
												newComment?.length
													? postComments()
													: editComment?.length
														? editComments(commentid)
														: toast.error("متن نظر را وارد کنید")
											}
											className="mx-[1rem]"
										>
											{newComment?.length
												? "ارسال"
												: editComment?.length
													? "ویرایش"
													: "ارسال نظر"}
										</Button>
									</div>
								</div>
							</div>
						</div>
					)}
					<DrawerFooter className="mt-0 w-full justify-end">
						<Button
							variant="primary"
							onClick={() => {
								if (data?.progress === 0) {
									updateTask();
								} else {
									toast.error("تسک مورد نظر پایان یافته است");
								}
							}}
							className="float-left w-[300px] self-center sm:self-end"
						>
							بروزرسانی
						</Button>
						<DrawerClose asChild className="w-full">
							<Button
								className="max-w-[300px] self-center sm:self-end"
								onClick={() => setIsModal(false)}
								variant="default"
							>
								بستن
							</Button>
						</DrawerClose>
					</DrawerFooter>
				</div>
			</DrawerContent>
		</Drawer>
	);
}
