import { useEffect, useRef, useState } from "react";
import { FaPlus } from "react-icons/fa";
import { toast } from "sonner";

import PatchProject from "@/api/tasks-manager/patchProject";
import PatchProjectStatuses from "@/api/tasks-manager/patchProjectStatuses";
import PostNewProject from "@/api/tasks-manager/postNewProject";
import PostNotifications from "@/notifications/services/postNotification";
import { Loading } from "@/ui/Loader";
import MyModal from "@/ui/Modal/contextlessModal/Modal";
import { Separator } from "@radix-ui/react-select";

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
	const inputRef: any = useRef(null);

	const [loading, setLoading] = useState<boolean>(false);
	const [inputs, setInputs] = useState<any>([
		{ name: "To Do", order: 1 },
		{ name: "In Progress", order: 2 },
		{ name: "Done", order: 3 },
	]);
	const [users, setUsers] = useState<any>();
	const [formAttribuite, setFormAttribuite] = useState<FormAttribuiteProps>();
	const [ids, setIds] = useState<any>();
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
						name: formAttribuite?.name,
						members: ids,
						id: data.id,
					});
					if (res) {
						toast.success("با موفقیت ویرایش شد!");
						setTimeout(() => {
							getData();
							setLoading(false);
							// setShow(false);
						}, 300);
					}
				} else {
					const res = await PostNewProject({
						name: formAttribuite?.name,
						members: ids,
						statuses: inputs,
					});
					if (res) {
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
					// setShow(false);
				}, 300);
			}
		} catch {
			setLoading(false);
			toast.error("خطایی در بروزرسانی وضعیت ها رخ داده است!");
		}
	}
	// else if (inputs?.length <= 2) {
	//       return handleInvalidForm("حداقل 3 وضعیت مشخص کنید!");
	//     }
	const handleAddInput = () => {
		setInputs([...inputs, { name: "", order: "" }]);
	};

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
			const modifiedData = data.statuses.map((obj: any) => {
				const { id, ...rest } = obj;
				return rest;
			});
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
										className={`col-span-9 col-start-1 mb-[1rem] flex h-fit w-full flex-col rounded-xl border-x-4 border-gray-200 bg-gray-100 p-1`}
									>
										{/* <div className="relative flex flex-col">
                      <label className=" my-[.5rem] mx-[1.5rem] select-none">
                        دسته بندی
                      </label>

                      <select
                        onChange={(event) =>
                          setFormAttribuite((prev) => ({
                            ...prev,
                            categoryId: event.target.value,
                          }))
                        }
                        onKeyDown={() => null}
                        className={` mx-[1rem] w-[300px] text-[.9rem] mb-[1rem] pl-[2.8rem] pr-[2rem] border-white border-2 bg-white rounded-2xl group relative text-ellipsis focus:border-blue-500 placeholder-gray-400 focus:text-black py-2 px-2 rounded focus:outline-0`}
                        placeholder={""}
                        defaultValue={
                          formAttribuite?.categoryId
                            ? formAttribuite?.categoryId
                            : "undefined"
                        }>
                        <option
                          value={"undefined"}
                          disabled
                          selected={formAttribuite?.categoryId ? false : true}>
                          انتخاب
                        </option>
                        {category?.map((cat: any) => (
                          <option
                            key={cat.id}
                            value={cat.id}
                            selected={
                              formAttribuite?.categoryId &&
                              formAttribuite?.categoryId === cat.id
                                ? true
                                : false
                            }>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div> */}
										<label className="mx-[1.5rem] mt-[.5rem] select-none">
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
											className={`group relative mx-[1rem] mb-[1rem] mt-[1rem] w-[300px] text-ellipsis rounded-2xl border-2 border-white bg-white px-2 py-2 pl-[2.8rem] pr-[.5rem] text-[.9rem] placeholder-gray-400 focus:border-blue-500 focus:text-black focus:outline-0`}
											placeholder={"نام"}
										/>
										{!isEdit && (
											<>
												<label className="mx-[1.5rem] my-[.5rem] flex select-none items-center">
													وضعیت ها
													<button type="button" onClick={handleAddInput}>
														<FaPlus
															size={16}
															className="mr-2 text-blue-500 hover:text-blue-600"
														/>
													</button>
												</label>
												<ColumnsManager inputs={inputs} setInputs={setInputs} />
											</>
										)}
										<label className="mx-[1.5rem] mt-[.5rem] select-none">
											کاربران
										</label>
										<AddProjectUser setIds={setIds} ids={ids} users={users} />
										{/* {!isEdit && (
                      <>
                        <label className=" mt-[.5rem] mx-[1.5rem] select-none">
                          شروع از
                        </label>
                        <input
                          disabled={isEdit}
                          onChange={(event) =>
                            setFormAttribuite((prev) => ({
                              ...prev,
                              startIndex: +event.target.value?.replace(
                                /[^\d.-]+/g,
                                ""
                              ),
                            }))
                          }
                          value={formAttribuite?.startIndex}
                          className={`${
                            isEdit && "text-gray-400"
                          } mx-[1rem] w-[300px] text-[.9rem] mb-[1rem] mt-[1rem] pl-[2.8rem] pr-[.5rem] border-white border-2 bg-white rounded-2xl group relative text-ellipsis focus:border-blue-500 placeholder-gray-400 focus:text-black py-2 px-2 rounded focus:outline-0`}
                          placeholder={"شمارنده"}
                        />
                        <label className=" mt-[.5rem] mx-[1.5rem] select-none">
                          تا
                        </label>
                        <input
                          disabled={isEdit}
                          onChange={(event) =>
                            setFormAttribuite((prev) => ({
                              ...prev,
                              endIndex: +event.target.value?.replace(
                                /[^\d.-]+/g,
                                ""
                              ),
                            }))
                          }
                          value={formAttribuite?.endIndex}
                          className={`${
                            isEdit && "text-gray-400"
                          } mx-[1rem] w-[300px] text-[.9rem] mb-[1rem] mt-[1rem] pl-[2.8rem] pr-[.5rem] border-white border-2 bg-white rounded-2xl group relative text-ellipsis focus:border-blue-500 placeholder-gray-400 focus:text-black py-2 px-2 rounded focus:outline-0`}
                          placeholder={"شمارنده"}
                        />
                      </>
                    )} */}
										<div className="w-full">
											<button
												onClick={() => sendProject()}
												className={`group relative float-left mx-[1rem] mb-[1rem] mt-[1rem] w-[300px] max-w-[10rem] text-ellipsis rounded-2xl border-2 bg-blue-500 py-2 text-[.9rem] text-white hover:bg-blue-700 focus:border-blue-500 focus:text-black focus:outline-0`}
											>
												{loading ? (
													<Loading
														className="flex justify-center"
														size={"sm"}
													/>
												) : (
													"ذخیره"
												)}
											</button>
										</div>

										{isEdit && (
											<>
												<Separator className="mx-1 my-4 h-1 rounded-2xl bg-gray-200" />

												<div>
													<label className="mx-[1.5rem] my-[.5rem] flex select-none items-center">
														وضعیت ها
														<button type="button" onClick={handleAddInput}>
															<FaPlus
																size={16}
																className="mr-2 text-blue-500 hover:text-blue-600"
															/>
														</button>
													</label>
													<ColumnsManager
														inputs={inputs}
														setInputs={setInputs}
													/>
												</div>

												<div className="w-full">
													<button
														onClick={() => updateStatuses()}
														className={`group relative float-left mx-[1rem] mb-[1rem] mt-[1rem] w-[300px] max-w-[10rem] text-ellipsis rounded-2xl border-2 bg-blue-500 py-2 text-[.9rem] text-white hover:bg-blue-700 focus:border-blue-500 focus:text-black focus:outline-0`}
													>
														{loading ? (
															<Loading
																className="flex justify-center"
																size={"sm"}
															/>
														) : (
															"برزورسانی وضعیت ها"
														)}
													</button>
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
