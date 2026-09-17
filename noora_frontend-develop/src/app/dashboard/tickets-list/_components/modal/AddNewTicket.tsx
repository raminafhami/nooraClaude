import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import PostNewTickets from "@/api/ticketsapi/postNewTickets";
import { UserGroupType } from "@/identity/groups/models/GroupType";
import { getGroups } from "@/identity/groups/services/getGroups";
import PostNotifications from "@/notifications/services/postNotification";
import { Loading } from "@/ui/Loader";
import MyModal from "@/ui/Modal/contextlessModal/Modal";

import FindUser from "../modules/FindUser";

interface AddNewTicketProps {
	isShow: boolean;
	setShow: (isShow?: any) => void;
	getData?: () => void;
	isEdit?: any;
	isExternal?: boolean;
	caseNumber?: string;
	userId?: string;
	refType?: string;
	isTab?: (tab: number) => void;
	tabType?: string | "inspection";
}

interface FormAttribuiteProps {
	subject?: string;
	content?: any;
	priority?: number;
	group?: any;
	reference?: string;
	referenceType?: string;
	deadlinedAt?: string;
	remindedAt?: string;
}

export default function AddNewTicket({
	isShow,
	setShow,
	getData,
	isEdit,
	isExternal,
	caseNumber,
	refType,
	userId,
	isTab,
	tabType,
}: AddNewTicketProps) {
	const [loading, setLoading] = useState<boolean>(false);
	const [isRefrence, setIsRefrence] = useState<string>();
	const [category, setGroups] = useState<any>();
	const [user, setUser] = useState<any>();
	const [formAttribuite, setFormAttribuite] = useState<FormAttribuiteProps>();
	const [assigneType, setAssigneType] = useState<string>();

	async function sendTickets() {
		setLoading(true);
		try {
			if (!formAttribuite?.subject) {
				return handleInvalidForm("نام را وارد کنید!");
			} else if (!formAttribuite?.content) {
				return handleInvalidForm("توضیحات را وارد کنید!");
			} else if (!formAttribuite?.priority) {
				return handleInvalidForm("اولویت را وارد کنید!");
			} else if (!isExternal && !assigneType) {
				return handleInvalidForm("مسئول مربوطه را وارد کنید!");
			} else if (
				!isExternal &&
				!formAttribuite?.group &&
				assigneType === "group"
			) {
				return handleInvalidForm("گروه را وارد کنید!");
			} else if (!isExternal && !user && assigneType === "user") {
				return handleInvalidForm("پرسنل را وارد کنید!");
			} else {
				let assignee = user && user.id ? user.id : userId;
				let reference = formAttribuite?.reference
					? formAttribuite.reference
					: caseNumber;
				let referenceType = formAttribuite?.reference
					? "instance-inspection"
					: refType;
				const res = await PostNewTickets({
					content: formAttribuite.content,
					subject: formAttribuite.subject,
					group: formAttribuite.group?.name,
					priority: formAttribuite.priority,
					indicatorKey: "tickets",
					reference,
					referenceType,
					assignee,
				}).then(async (res) => {
					const notificationRes = await PostNotifications({
						title: `تیکت با نام ${res.result.subject} برای شما ایجاد شد.`,
						description: formAttribuite.content,
						category: `tickets:${res.result.id}`,
						groups: formAttribuite.group ? [formAttribuite.group?.id] : [],
						users: assignee ? [assignee] : [],
						priority:
							formAttribuite.priority === 3
								? "high"
								: formAttribuite.priority === 2
									? "medium"
									: "low",
						sendNotification: true,
					});

					if (notificationRes) {
						toast.success("با موفقیت ثبت شد!");
					}
					setTimeout(() => {
						getData && getData();
						setLoading(false);
						setShow(false);
						if (tabType === "inspection") {
							isTab && isTab(3);
						}
					}, 300);
				});
			}
		} catch (e: any) {
			console.log(e);

			setLoading(false);
			toast.error(e?.response?.data?.message);
		}
	}

	function handleInvalidForm(message: string) {
		toast.warning(message);
		setLoading(false);
	}

	async function getCategory() {
		setLoading(true);
		try {
			let res = getGroups(UserGroupType.Group);
			res.then((res) => {
				if (res) {
					setTimeout(() => {
						setGroups(res);
						setLoading(false);
					}, 300);
				}
			});
		} catch (e) {
			toast.error("خطایی در دریافت گروه ها رخ داد!");
			setLoading(false);
		}
	}

	useEffect(() => {
		getCategory();
	}, []);

	return (
		<>
			{
				<MyModal
					loading={loading}
					size={"3xl"}
					title={`${isEdit ? "ویرایش" : "افزودن تیکت"}`}
					content={
						<>
							{loading ? (
								<Loading />
							) : (
								<div
									className={`col-span-9 col-start-1 mt-6 flex w-full flex-row flex-wrap rounded-xl border-x-4 border-gray-200 bg-gray-100`}
								>
									<div className={`mb-[1rem] flex flex-wrap p-1`}>
										<div className="flex flex-col">
											<label className="mx-[1.5rem] mt-[.5rem] select-none">
												عنوان
											</label>
											<input
												onChange={(event) =>
													setFormAttribuite((prev) => ({
														...prev,
														subject: event.target.value,
													}))
												}
												value={formAttribuite?.subject}
												className={` ${
													isExternal ? "mx-[.3rem]" : "sm:mx-[1rem]"
												} group relative mb-[1rem] mt-[1rem] w-[300px] text-ellipsis rounded-2xl border-2 border-white bg-white px-2 py-2 pl-[2.8rem] pr-[.5rem] text-[.9rem] placeholder-gray-400 focus:border-blue-500 focus:text-black focus:outline-0`}
												placeholder={"عنوان"}
											/>
										</div>

										<div className="flex flex-col">
											<label className="mx-[1.5rem] mt-[.5rem] select-none">
												توضیحات
											</label>
											<textarea
												value={formAttribuite?.content}
												onChange={(event) =>
													setFormAttribuite((prev) => ({
														...prev,
														content: event.target.value,
													}))
												}
												className={`${
													isExternal ? "mx-[.3rem]" : "sm:mx-[1rem]"
												} group relative mb-[1rem] mt-[1rem] max-h-[16rem] min-h-[4.5rem] w-[300px] text-ellipsis rounded-2xl border-r-2 border-none bg-white px-2 py-2 pl-[2.8rem] pr-[.5rem] text-[13px] placeholder-gray-400 focus:bg-blue-300 focus:text-white focus:placeholder-white focus:outline-0`}
												placeholder={"توضیحات"}
											/>
										</div>

										{!userId && (
											<div className="relative flex flex-col">
												<label className="mx-[1.5rem] my-[.5rem] select-none">
													اختصاص به
												</label>
												<select
													onChange={(event) => {
														setAssigneType(event.target.value);
														setUser(undefined);
														setFormAttribuite((prev) => ({
															...prev,
															group: undefined,
														}));
													}}
													className={` ${
														isExternal ? "mx-[.3rem]" : "sm:mx-[1rem]"
													} group relative mb-[1rem] w-[300px] text-ellipsis rounded-2xl border-2 border-white bg-white px-2 py-2 text-[.9rem] placeholder-gray-400 focus:border-blue-500 focus:text-black focus:outline-0`}
													defaultValue={assigneType ? assigneType : "undefined"}
												>
													<option
														value={"undefined"}
														disabled
														selected={assigneType ? false : true}
													>
														انتخاب
													</option>
													<option
														value={"user"}
														selected={assigneType === "user" ? true : false}
													>
														پرسنل
													</option>
													<option
														value={"group"}
														selected={assigneType === "group" ? true : false}
													>
														گروه
													</option>
												</select>
											</div>
										)}

										<div className="relative flex flex-col">
											<label className="mx-[1.5rem] my-[.5rem] select-none">
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
												className={` ${
													isExternal ? "mx-[.3rem]" : "sm:mx-[1rem]"
												} group relative mb-[1rem] w-[300px] text-ellipsis rounded-2xl border-2 border-white bg-white px-2 py-2 text-[.9rem] placeholder-gray-400 focus:border-blue-500 focus:text-black focus:outline-0`}
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
													انتخاب
												</option>
												<option
													value={3}
													selected={formAttribuite?.priority ? false : true}
												>
													فوری
												</option>
												<option
													value={2}
													selected={formAttribuite?.priority ? false : true}
												>
													معمولی
												</option>
												<option
													value={1}
													selected={formAttribuite?.priority ? false : true}
												>
													پایین
												</option>
											</select>
										</div>

										{assigneType === "group" && (
											<div className="relative flex flex-col">
												<label className="mx-[1.5rem] my-[.5rem] select-none">
													گروه مسئول
												</label>

												<select
													onChange={(event) =>
														setFormAttribuite((prev) => ({
															...prev,
															group: JSON.parse(event.target.value),
														}))
													}
													onKeyDown={() => null}
													className={` ${
														isExternal ? "mx-[.3rem]" : "sm:mx-[1rem]"
													} group relative mb-[1rem] w-[300px] text-ellipsis rounded-2xl border-2 border-white bg-white px-2 py-2 pl-[2.8rem] pr-[2rem] text-[.9rem] placeholder-gray-400 focus:border-blue-500 focus:text-black focus:outline-0`}
													defaultValue={
														formAttribuite?.group
															? formAttribuite?.group
															: "undefined"
													}
												>
													<option
														value={"undefined"}
														disabled
														selected={formAttribuite?.group ? false : true}
													>
														انتخاب
													</option>
													{category?.map((cat: any) => (
														<option
															key={cat.name}
															value={JSON.stringify(cat)}
															selected={
																formAttribuite?.group &&
																formAttribuite?.group === cat.name
																	? true
																	: false
															}
														>
															{cat.title}
														</option>
													))}
												</select>
											</div>
										)}

										{assigneType === "user" && (
											<div className="mr-[.5rem] mt-[1rem] w-[315px]">
												<FindUser
													setUser={setUser}
													user={user}
													type="personnel"
												/>
											</div>
										)}

										{!refType && (
											<div>
												<div className="relative flex flex-col">
													<label className="mx-[1.5rem] my-[.5rem] select-none">
														اتصال به درخواست بازرسی
													</label>
													<select
														onChange={(event) =>
															setIsRefrence(event.target.value)
														}
														className={` ${
															isExternal ? "mx-[.3rem]" : "sm:mx-[1rem]"
														} group relative mb-[1rem] w-[300px] text-ellipsis rounded-2xl border-2 border-white bg-white px-2 py-2 text-[.9rem] placeholder-gray-400 focus:border-blue-500 focus:text-black focus:outline-0`}
														defaultValue={isRefrence ? isRefrence : "undefined"}
													>
														<option
															value={"undefined"}
															selected={isRefrence ? false : true}
														>
															انتخاب
														</option>
														<option
															value={"1"}
															selected={isRefrence === "1" ? true : false}
														>
															گواهی
														</option>
													</select>
												</div>

												{isRefrence === "1" && (
													<div className="flex flex-col">
														<label className="mx-[1.5rem] mt-[.5rem] select-none">
															شماره فایل
														</label>
														<input
															onChange={(event) =>
																setFormAttribuite((prev) => ({
																	...prev,
																	reference: event.target.value?.replace(
																		/[^\d.-]+/g,
																		"",
																	),
																}))
															}
															value={formAttribuite?.reference}
															className={`${
																isExternal ? "mx-[.3rem]" : "sm:mx-[1rem]"
															} group relative mb-[1rem] mt-[1rem] w-[300px] text-ellipsis rounded-2xl border-2 border-white bg-white px-2 py-2 pl-[2.8rem] pr-[.5rem] text-[.9rem] placeholder-gray-400 focus:border-blue-500 focus:text-black focus:outline-0`}
															placeholder={"شماره"}
														/>
													</div>
												)}
											</div>
										)}
									</div>

									<div className="w-full">
										<button
											onClick={() => !loading && sendTickets()}
											className={`${
												isExternal ? "mx-[.3rem]" : "sm:mx-[1rem]"
											} group relative float-left mb-[1rem] mt-[1rem] w-[300px] text-ellipsis rounded-2xl border-2 bg-blue-500 py-2 text-[.9rem] text-white hover:bg-blue-700 focus:border-blue-500 focus:text-black focus:outline-0`}
										>
											{loading ? (
												<Loading className="flex justify-center" size={"sm"} />
											) : (
												"ثبت"
											)}
										</button>
									</div>
								</div>
							)}
						</>
					}
					name="addTicket"
					onClose={() => setShow(false)}
					show={isShow}
				/>
			}
		</>
	);
}
