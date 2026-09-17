import { useRef, useState } from "react";
import { FaEye, FaPlus } from "react-icons/fa";
import { toast } from "sonner";

import GetAssetRequirementFile from "@/api/assetRequirement/getAssetRequirementFile";
import PostAssetRequirementFile from "@/api/assetRequirement/postAssetRequirementFile";
import { Layout } from "@/ui/Layout";
import { Loading } from "@/ui/Loader";
import MyModal from "@/ui/Modal/contextlessModal/Modal";
import { Panel } from "@/ui/Panel";
import { Table } from "@/ui/Table";

import { FileObject } from "../types/auditType";

interface AddFileProps {
	isShow: boolean;
	setShow: (isShow?: any) => void;
	data: FileObject[];
	id: string;
	getData: () => void;
}

export default function AddFile({
	isShow,
	setShow,
	data,
	id,
	getData,
}: AddFileProps) {
	const [loading, setLoading] = useState<boolean>(false);
	const [fileName, setFileName] = useState<string>();
	const [file, setFile] = useState<any>([]);
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
				toast.loading("در حال بارگزاری...");
				let res = PostAssetRequirementFile({ title: fileName, file, id });
				res.then((res) => {
					if (res) {
						toast.success("پیوست با موفقیت اضافه شد!");
						setTimeout(() => {
							setLoading(false);
							getData();
							setShow(false);
						}, 300);
					}
				});
			}
		} catch (e) {
			setLoading(false);
			toast.error("خطایی رخ داد!");
		}
		setLoading(false);
	}

	async function getFile(fileId: string) {
		setLoading(true);
		try {
			toast.loading("در حال بارگزاری...");
			let res = GetAssetRequirementFile({ fileId });
			res.then((res) => {
				if (res) {
					setTimeout(() => {
						const blob = new Blob([res], { type: "application/pdf" });
						const url = URL.createObjectURL(blob);
						window.open(url, "_blank");
						setLoading(false);
					}, 300);
				}
			});
		} catch (e) {
			toast.error("خطایی در دریافت دسته بندی ها رخ داد!");
			setLoading(false);
		}
		setLoading(false);
	}

	return (
		<>
			{
				<MyModal
					loading={loading}
					size="2xl"
					title="پیوست"
					content={
						<div className="mt-6 flex flex-col">
							<Layout.Content className="mb-10 w-full select-none p-0">
								<Panel.Root>
									<Panel.Container className="max-h-[16rem] overflow-y-scroll">
										<Table.Root>
											<Table.Head>
												{!data ? null : (
													<Table.Row className="select-none bg-gray-100 text-right">
														<Table.Cell as="th">ردیف</Table.Cell>
														<Table.Cell as="th">نام</Table.Cell>
														<Table.Cell as="th"></Table.Cell>
													</Table.Row>
												)}
											</Table.Head>
											<Table.Body>
												{!data?.length ? (
													<Table.Row>
														<Table.Cell>پیوستی یافت نشد...</Table.Cell>
													</Table.Row>
												) : (
													data.map((files: any, index: any) => (
														<Table.Row key={files.id}>
															{loading ? (
																<Loading />
															) : (
																<>
																	<Table.Cell as="td">{++index}</Table.Cell>
																	<Table.Cell as="td">{files.title}</Table.Cell>
																	<Table.Cell as="td">
																		<FaEye
																			className="cursor-pointer text-blue-500 hover:text-blue-700"
																			onClick={() =>
																				!loading && getFile(files.id)
																			}
																		/>
																	</Table.Cell>
																	{/* <Table.Cell>
                                        <BsFillTrashFill
                                          size={17}
                                          className={`text-red-500 inline cursor-pointer mr-2 focus:outline-0`}
                                          onClick={() =>
                                            removeCategory(group.id)
                                          }
                                        />
                                      </Table.Cell> */}
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
							<div className="col-span-9 col-start-1 flex flex-col items-center rounded-xl border-x-4 border-gray-200 bg-gray-100 p-1 py-[2rem]">
								<input
									onChange={(event) => setFileName(event.target.value)}
									className={`group relative mx-[1rem] mb-[1rem] mt-[1rem] w-[300px] text-ellipsis rounded border-2 border-white bg-white px-2 py-2 pl-[2.8rem] pr-[.5rem] text-[.9rem] placeholder-gray-400 focus:border-blue-500 focus:text-black focus:outline-0`}
									placeholder={"نام"}
								/>
								<input
									readOnly
									onClick={handleClick}
									value={file ? file?.name : undefined}
									className={`group relative mx-[1rem] mb-[1rem] mt-[1rem] w-[300px] text-ellipsis rounded border-2 border-white bg-white px-2 py-2 pl-[2.8rem] pr-[.5rem] text-[.9rem] placeholder-gray-400 focus:border-blue-500 focus:text-black focus:outline-0`}
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
									className={`btn flex items-center ${
										loading ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-700"
									} mr-5 max-h-[40px] cursor-pointer select-none rounded-md px-4 py-2 text-white`}
								>
									{loading ? (
										<Loading className="item-center flex" size={"sm"} />
									) : (
										<>
											<FaPlus size={10} className="ml-1" /> ارسال
										</>
									)}
								</button>
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
