import { useEffect, useRef, useState } from "react";
import { BsFillTrashFill } from "react-icons/bs";
import { FaEye } from "react-icons/fa";
import { toast } from "sonner";

import DeleteAssetRequirementFile from "@/api/assetRequirement/deleteAssetRequirementFile";
import GetAssetRequirementFile from "@/api/assetRequirement/getAssetRequirementFile";
import PostAssetRequirementFile from "@/api/assetRequirement/postAssetRequirementFile";
import PutAssetRequirement from "@/api/assetRequirement/putAssetRequirement";
import { Layout } from "@/ui/Layout";
import { Loading } from "@/ui/Loader";
import MyModal from "@/ui/Modal/contextlessModal/Modal";
import { Panel } from "@/ui/Panel";
import { Table } from "@/ui/Table";

import { ConflictModalType, FileObject } from "../types/auditType";

interface ConflictModalProps {
	isShow: boolean;
	setShow: (isShow?: any) => void;
	data: ConflictModalType;
	fileData: FileObject[];
	id: string;
	getData: () => void;
	category?: string;
	readonly?: boolean;
}

export default function ConflictModal({
	isShow,
	setShow,
	data,
	id,
	getData,
	fileData,
	category,
	readonly,
}: ConflictModalProps) {
	const [loading, setLoading] = useState<boolean>(false);
	const [conflict, setConflict] = useState<string>();
	const [description, setDescription] = useState<string>();
	const [fileName, setFileName] = useState<string>();
	const [file, setFile] = useState<any>([]);

	async function updateConflict() {
		setLoading(true);
		try {
			let response = await PutAssetRequirement({
				id,
				conflict,
				description,
			});
			if (response) {
				toast.success("با موفقیت ثبت شد!");
				setTimeout(() => {
					getData();
					setShow(false);
					setLoading(false);
				}, 500);
			}
		} catch (e) {
			toast.error("خطایی رخ داد!");
			setLoading(false);
		}
	}

	const inputRef: any = useRef(null);

	const handleClick = () => {
		inputRef.current.click();
	};

	const handleFileChange = ({ target: { files } }: any) => {
		setFile(files[0]);
	};

	async function sendFile() {
		setLoading(true);
		try {
			if (!fileName) {
				toast.warning("نام پیوست را وارد کنید!");
				setLoading(false);
			} else if (!file) {
				toast.warning("پیوست را وارد کنید!");
				setLoading(false);
			} else {
				toast.loading("در حال بارگذاری...");
				let res = PostAssetRequirementFile({ title: fileName, file, id });
				res.then((res) => {
					if (res) {
						toast.success("پیوست با موفقیت اضافه شد!");
						setTimeout(() => {
							setLoading(false);
							getData();
							setShow(false);
						}, 300);
					} else {
						setLoading(false);
						setShow(false);
						toast.error("حجم فایل مورد نظر بیش از حد معمول است!");
					}
				});
			}
		} catch (e) {
			setLoading(false);
			toast.error("خطایی رخ داد!");
		}
	}

	async function getFile(fileId: string) {
		setLoading(true);
		try {
			toast.loading("در حال بارگزاری...");
			let res = GetAssetRequirementFile({ fileId });
			res.then((res) => {
				if (res) {
					setTimeout(() => {
						const url = URL.createObjectURL(res);
						window.open(url, "_blank");
						setShow(false);
						setLoading(false);
					}, 300);
				}
			});
		} catch (e) {
			toast.error("خطایی در دریافت فایل رخ داد!");
			setLoading(false);
		}
	}

	async function removeFile(fileId: string) {
		setLoading(true);
		try {
			toast.loading("در حال بارگزاری...");
			let res = DeleteAssetRequirementFile({ id: fileId });
			res.then((res) => {
				if (res) {
					setTimeout(() => {
						toast.success("با موفقیت حذف شد!");
						getData();
						setLoading(false);
						setShow(false);
					}, 300);
				}
			});
		} catch (e) {
			toast.error("خطایی رخ داد!");
			setLoading(false);
			setShow(false);
		}
	}

	return (
		<>
			{
				<MyModal
					loading={loading}
					size="7xl"
					title="اطلاعات"
					content={
						<div className="mt-6 flex bg-gray-100">
							{!readonly && (
								<>
									<div className="col-span-9 col-start-1 mx-2 flex flex-col items-center rounded-xl border-x-4 border-gray-100 bg-gray-100 p-1 py-[2rem]">
										<input
											value={conflict}
											onChange={(event) => setConflict(event.target.value)}
											className={`group relative mx-[1rem] mb-[1rem] mt-[1rem] w-[300px] text-ellipsis rounded rounded-2xl border-2 border-white bg-white px-2 py-2 pl-[2.8rem] pr-[.5rem] text-[.9rem] placeholder-gray-400 focus:border-blue-500 focus:text-black focus:outline-0`}
											placeholder={`${
												category === "ممیزی داخلی"
													? "شرح عدم انطباق"
													: "عنوان مغایرت"
											}`}
										/>
										<textarea
											value={description}
											onChange={(event) => setDescription(event.target.value)}
											className={`group relative mb-[1rem] max-h-[16rem] min-h-[4.5rem] w-[300px] text-ellipsis rounded-2xl border-r-2 border-none bg-white px-2 py-2 text-[13px] placeholder-gray-400 focus:bg-blue-300 focus:text-white focus:placeholder-white focus:outline-0`}
											placeholder={"توضیحات"}
										/>
										<button
											disabled={loading}
											type="button"
											onClick={() => !loading && updateConflict()}
											className={`btn flex w-[300px] items-center justify-center ${
												loading
													? "bg-gray-400"
													: "bg-blue-500 hover:bg-blue-700"
											} max-h-[40px] cursor-pointer select-none rounded-md px-4 py-2 text-white`}
										>
											{loading ? (
												<Loading className="item-center flex" size={"sm"} />
											) : (
												"ثبت"
											)}
										</button>
									</div>
									<div className="mx-2">
										<div className="col-span-9 col-start-1 flex flex-col items-center rounded-xl border-x-4 border-gray-100 bg-gray-100 p-1 py-[2rem]">
											<input
												onChange={(event) => setFileName(event.target.value)}
												className={`group relative mx-[1rem] mb-[1rem] mt-[1rem] w-[300px] text-ellipsis rounded rounded-2xl border-2 border-white bg-white px-2 py-2 pl-[2.8rem] pr-[.5rem] text-[.9rem] placeholder-gray-400 focus:border-blue-500 focus:text-black focus:outline-0`}
												placeholder={`نام ${
													category === "ممیزی داخلی" ? "/ شماره عدم انطباق" : ""
												}`}
											/>
											<input
												readOnly
												onClick={handleClick}
												value={file ? file?.name : undefined}
												className={`group relative mx-[1rem] mb-[1rem] mt-[1rem] w-[300px] text-ellipsis rounded rounded-2xl border-2 border-white bg-white px-2 py-2 pl-[2.8rem] pr-[.5rem] text-[.9rem] placeholder-gray-400 focus:border-blue-500 focus:text-black focus:outline-0`}
												placeholder={"پیوست"}
											/>
											<input
												style={{ display: "none" }}
												ref={inputRef}
												type="file"
												onChange={handleFileChange}
											/>
											<button
												disabled={loading}
												type="button"
												onClick={() => !loading && sendFile()}
												className={`btn flex items-center justify-center ${
													loading
														? "bg-gray-400"
														: "bg-blue-500 hover:bg-blue-700"
												} mt-[1rem] max-h-[40px] w-[300px] cursor-pointer select-none rounded-md px-4 py-2 text-white`}
											>
												{loading ? (
													<Loading className="item-center flex" size={"sm"} />
												) : (
													"ارسال"
												)}
											</button>
										</div>
									</div>
								</>
							)}
							<div className="mx-2 w-full">
								<Layout.Content className="my-9 w-full select-none rounded-lg p-0">
									<Panel.Root className="p-0">
										<Panel.Container className="max-h-[16rem] min-h-[200px] overflow-y-scroll rounded-lg py-0">
											<Table.Root className="p-0">
												<Table.Head className="w-full">
													{!fileData ? null : (
														<Table.Row className="select-none bg-gray-200 text-right">
															<Table.Cell as="th">ردیف</Table.Cell>
															<Table.Cell as="th">نام</Table.Cell>
															<Table.Cell as="th"></Table.Cell>
														</Table.Row>
													)}
												</Table.Head>
												<Table.Body>
													{!fileData?.length ? (
														<Table.Row>
															<Table.Cell>پیوستی یافت نشد...</Table.Cell>
														</Table.Row>
													) : (
														fileData.map((files: any, index: any) => (
															<Table.Row key={files.id}>
																{loading ? (
																	<Loading />
																) : (
																	<>
																		<Table.Cell as="td">{++index}</Table.Cell>
																		<Table.Cell as="td">
																			{files.title}
																		</Table.Cell>
																		<Table.Cell as="td">
																			<FaEye
																				className="inline cursor-pointer text-blue-500 hover:text-blue-700"
																				onClick={() =>
																					!loading && getFile(files.id)
																				}
																			/>
																			{!readonly && (
																				<BsFillTrashFill
																					className={`mr-6 inline cursor-pointer text-red-500 focus:outline-0`}
																					onClick={() => removeFile(files.id)}
																				/>
																			)}
																		</Table.Cell>
																	</>
																)}
															</Table.Row>
														))
													)}
												</Table.Body>
											</Table.Root>
										</Panel.Container>
									</Panel.Root>
								</Layout.Content>
							</div>
						</div>
					}
					name="addCategory"
					onClose={() => setShow(false)}
					show={isShow}
				/>
			}
		</>
	);
}
