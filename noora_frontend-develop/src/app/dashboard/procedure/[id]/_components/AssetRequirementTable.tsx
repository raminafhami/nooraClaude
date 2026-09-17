"use client";

import moment from "jalali-moment";
import React, { useEffect, useState } from "react";
import { BsArrowDownShort, BsArrowUpShort, BsThreeDots } from "react-icons/bs";
import { FaPlus } from "react-icons/fa";
import { MdDeleteForever, MdInfoOutline } from "react-icons/md";
import { TbSquareRoundedCheck } from "react-icons/tb";
import { Tooltip } from "react-tooltip";
import { toast } from "sonner";

import DeleteAssetRequirement from "@/api/assetRequirement/deleteAssetRequirement";
import postAssetRequirement from "@/api/assetRequirement/postAssetRequirement";
import PutAssetRequirement from "@/api/assetRequirement/putAssetRequirement";
import { Loading } from "@/ui/Loader";
import { Table } from "@/ui/Table";
import { toFarsiNum } from "@/utils/string/toFarsiNum";
import { Switch, Transition } from "@headlessui/react";

import ConflictModal from "./modal/ConflictModal";
import { AssesstType, ConflictModalType, FileObject } from "./types/auditType";

interface AssetRequirementTableProps {
	assesst: AssesstType[];
	loading: boolean;
	setSearch: (s: any) => void;
	getData: () => void;
	setLoading: (s: boolean) => void;
	auditId: string;
	category?: string;
	readonly?: boolean;
}

interface SearchAttributeProps {
	searchInstructor?: string;
	searchName?: string;
}

export function AssetRequirementTable({
	assesst,
	loading,
	setSearch,
	getData,
	setLoading,
	auditId,
	category,
	readonly,
}: AssetRequirementTableProps) {
	const [searchAttribute, setSearchAttribute] =
		useState<SearchAttributeProps>();
	const [formAttribuite, setFormAttribuite] = useState<any>();
	const [rootId, setRoot] = useState<any>();
	const [files, setFiles] = useState<FileObject[]>();
	const [dataId, setId] = useState<string>();
	const [ids, setIds] = useState<any>([]);
	const [conflictModal, setConflictModal] = useState<boolean>(false);
	const [showActions, setShowActions] = useState<boolean>(false);
	const [conflict, setConflict] = useState<ConflictModalType>();

	let firstRender = true;

	useEffect(() => {
		if (assesst) {
			assesst.filter((item: any) => {
				if (item.questionDescription.includes("ROOT")) {
					setRoot(item.id);
				}
			});
			firstRender = false;
		}
	}, [assesst]);

	async function sendNewAsset(parent: string) {
		setLoading(true);

		try {
			if (!formAttribuite.questionDescription) {
				toast.warning("عنوان مورد نظر را وارد کنید! ");
				setLoading(false);
			} else {
				let res = await postAssetRequirement({
					questionDescription: formAttribuite.questionDescription,
					state: false,
					parent: parent,
					auditId: auditId,
				});
				if (res) {
					setTimeout(() => {
						getData();
						setFormAttribuite(undefined);
						toast.success("زیربند جدید با موفقیت اضافه شد!");
						setLoading(false);
					}, 300);
				}
			}
		} catch (e) {
			setFormAttribuite(undefined);
			setLoading(false);
			!formAttribuite;
			toast.error("خطایی رخ داد!");
			setLoading(false);
		}
	}

	async function sendNewQuestion(rootId: string) {
		setLoading(true);

		try {
			if (!formAttribuite.questionDescription) {
				toast.warning("عنوان مورد نظر را وارد کنید! ");
				setLoading(false);
			}
			if (!formAttribuite.paraNumber) {
				toast.warning("شماره الزام بند را وارد کنید! ");
				setLoading(false);
			} else {
				let res = await postAssetRequirement({
					questionDescription: formAttribuite.questionDescription,
					paraNumber: formAttribuite.paraNumber,
					state: false,
					parent: rootId,
					auditId: auditId,
				});
				if (res) {
					setTimeout(() => {
						getData();
						setFormAttribuite(undefined);
						toast.success("بند جدید با موفقیت حذف شد!");
						setLoading(false);
					}, 1000);
				}
			}
		} catch (e) {
			setFormAttribuite(undefined);
			setLoading(false);
			!formAttribuite;
			toast.error("خطایی رخ داد!");
			setLoading(false);
		}
	}

	async function deleteAsset(id: string) {
		setLoading(true);
		try {
			let response = await DeleteAssetRequirement({ id });
			if (response) {
				toast.success("با موفقیت حذف شد!");
				setTimeout(() => {
					getData();
					setLoading(false);
				}, 500);
			}
		} catch (e) {
			toast.error("خطایی رخ داد!");
			setLoading(false);
		}
	}

	async function updateState(id: string, state?: boolean) {
		setLoading(true);
		try {
			let response = await PutAssetRequirement({
				id,
				state: state,
			});
			if (response) {
				toast.success("با موفقیت ویرایش شد!");
				setTimeout(() => {
					setLoading(false);
					getData();
				}, 500);
			}
		} catch (e) {
			setLoading(false);
			toast.error("خطایی رخ داد!");
		}
	}

	async function updateTitle(id: string, title?: string) {
		setLoading(true);
		try {
			let response = await PutAssetRequirement({
				id,
				questionDescription: title,
			});
			if (response) {
				toast.success("با موفقیت ویرایش شد!");
				setTimeout(() => {
					getData();
					setFormAttribuite(undefined);
					setLoading(false);
				}, 500);
			}
		} catch (e) {
			toast.error("خطایی رخ داد!");
			setFormAttribuite(undefined);
			setLoading(false);
		}
	}

	function getPosition(string: any, subString: any, index: any) {
		return string.split(subString, index).join(subString).length;
	}

	useEffect(() => {
		const delayDebounceFn = setTimeout(() => {
			if (searchAttribute) {
				setSearch(searchAttribute);
			}
		}, 300);

		return () => clearTimeout(delayDebounceFn);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchAttribute]);

	return (
		<>
			{conflictModal && dataId && conflict && files && (
				<ConflictModal
					getData={getData}
					id={dataId}
					setShow={setConflictModal}
					isShow={conflictModal}
					key={"conflictModal"}
					data={conflict}
					fileData={files}
					category={category}
					readonly={readonly}
				/>
			)}
			<Table.Root>
				<Table.Head>
					<Table.Row className="select-none bg-gray-100 text-right">
						<Table.Cell as="th">
							شماره بند
							{!readonly && (
								<FaPlus
									data-tooltip-id={"addNewQuestion"}
									size={12}
									className="mr-2 inline cursor-pointer text-blue-500 hover:text-blue-700"
								/>
							)}
						</Table.Cell>

						<Table.Cell as="th">عنوان</Table.Cell>

						<Table.Cell as="th">آخرین بروزرسانی</Table.Cell>

						<Table.Cell as="th">وضعیت</Table.Cell>
						<Table.Cell as="th"></Table.Cell>
					</Table.Row>
				</Table.Head>

				<Table.Body>
					{assesst?.length
						? assesst.map((asset: any, index: number) =>
								!asset.questionDescription.includes("ROOT") ? (
									<Table.Row key={asset.id}>
										<Table.Cell>
											<li
												className={`mb-4 inline max-w-fit list-none rounded-lg px-[.5rem] py-[.2rem] ${
													asset.paraNumber.length === 1 ||
													(!asset.paraNumber.includes("-") &&
														asset.paraNumber.length === 2)
														? "bg-pink-50 text-pink-900"
														: asset.paraNumber.length === 3 ||
															  (getPosition(asset.paraNumber, "-", 1) === 1 &&
																	asset.paraNumber.length === 4) ||
															  (getPosition(asset.paraNumber, "-", 1) === 2 &&
																	asset.paraNumber.length === 4)
															? "bg-blue-50 text-blue-900"
															: "bg-green-50 text-green-800"
												}`}
											>
												{asset.paraNumber.length === 1 ||
												(!asset.paraNumber.includes("-") &&
													asset.paraNumber.length === 2) ? (
													<>
														<BsArrowUpShort
															size={15}
															className="ml-2 inline cursor-pointer text-pink-500 hover:text-pink-900"
														/>
														<span>{toFarsiNum(asset.paraNumber)}</span>
													</>
												) : (
													<>
														<BsArrowDownShort
															size={15}
															className="ml-2 inline cursor-pointer text-blue-500 hover:text-blue-800"
														/>
														<span>{toFarsiNum(asset.paraNumber)}</span>
													</>
												)}
											</li>{" "}
											{!readonly && (
												<FaPlus
													data-tooltip-id={asset.paraNumber}
													size={12}
													className="mr-2 inline cursor-pointer text-blue-500 hover:text-blue-700"
												/>
											)}
										</Table.Cell>

										<Table.Cell
											data-tooltip-id={`${index}+${asset.title}`}
											className={`overflow-hidden text-ellipsis whitespace-nowrap ${
												asset.paraNumber.length === 1
													? ""
													: asset.paraNumber.length === 3 ||
														  (getPosition(asset.paraNumber, "-", 1) === 1 &&
																asset.paraNumber.length === 4) ||
														  (getPosition(asset.paraNumber, "-", 1) === 2 &&
																asset.paraNumber.length === 4)
														? "pr-10"
														: asset.paraNumber.length === 5 ||
															  (getPosition(asset.paraNumber, "-", 2) === 4 &&
																	asset.paraNumber.length === 6)
															? "pr-20"
															: asset.paraNumber.length === 7 ||
																  (getPosition(asset.paraNumber, "-", 2) ===
																		4 &&
																		asset.paraNumber.length === 8)
																? "pr-32"
																: asset.paraNumber.length === 9
																	? "pr-44"
																	: ""
											}`}
										>
											<textarea
												name={`${asset.questionDescription}`}
												key={asset?.id}
												onChange={(event) =>
													setFormAttribuite((prev: any) => ({
														...prev,
														newTitle: event.target.value,
														id: asset.id,
													}))
												}
												disabled={readonly}
												onKeyDown={() => null}
												value={
													formAttribuite?.id === asset?.id
														? toFarsiNum(formAttribuite?.newTitle)
														: toFarsiNum(asset.questionDescription)
															? toFarsiNum(asset.questionDescription)
															: ""
												}
												className={`group relative max-h-[15rem] min-h-[5rem] w-full text-ellipsis rounded border-r-2 border-none bg-transparent px-2 py-2 text-[13px] focus:bg-blue-300 focus:text-white focus:placeholder-white focus:outline-0`}
												placeholder={"بدون عنوان"}
											/>
											{!readonly && (
												<TbSquareRoundedCheck
													onClick={() =>
														formAttribuite &&
														formAttribuite?.newTitle !==
															asset.questionDescription &&
														formAttribuite?.id === asset?.id
															? updateTitle(asset.id, formAttribuite.newTitle)
															: toast.warning("لطفا عنوان جدیدی وارد کنید!")
													}
													className="absolute top-5 mr-2 hidden cursor-pointer text-green-500 group-hover:inline"
													size={20}
												/>
											)}
										</Table.Cell>

										<Table.Cell>
											<span>
												{toFarsiNum(
													moment(asset.updatedAt)
														.locale("fa")
														.format("YYYY/MM/DD"),
												)}
											</span>
										</Table.Cell>

										<Table.Cell className="py-6">
											<li
												className={`list-none ${
													asset.state ? "text-green-600" : "text-red-600"
												}`}
											>
												{asset.state ? "انجام شده" : "انجام نشده"}
											</li>
										</Table.Cell>

										<Table.Cell className="w-[300px] overflow-hidden text-ellipsis whitespace-nowrap text-center">
											{!readonly && (
												<Transition
													key={asset.id}
													className={"inline-block w-[77px]"}
													show={showActions && ids.includes(asset.id)}
													enter="transition-opacity duration-75"
													enterFrom="opacity-0"
													enterTo="opacity-100"
													leave="transition-opacity duration-150"
													leaveFrom="opacity-100"
													leaveTo="opacity-0"
												>
													<Switch
														disabled={loading}
														checked={asset.state}
														onChange={() => updateState(asset.id, !asset.state)}
														className={`${
															asset.state ? "bg-blue-400" : "bg-red-400"
														} relative inline-flex h-[20px] w-[48px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75`}
													>
														<span
															aria-hidden="true"
															className={`${
																asset.state ? "translate-x-0" : "-translate-x-7"
															} pointer-events-none inline-block h-[16px] w-[16px] transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out`}
														/>
													</Switch>
													{/* <MdAttachFile
                          data-tooltip-id={`file-${asset.id}`}
                          className={`mb-[.6rem] mx-2 inline-flex ${
                            loading
                              ? "text-gray-400"
                              : "text-blue-500 hover:text-blue-600"
                          } cursor-pointer focus:outline-0`}
                          onClick={() => {
                            !loading && setFileModal(true);
                            setFiles(asset.files);
                            setId(asset.id);
                          }}
                        /> */}
												</Transition>
											)}

											<BsThreeDots
												className={`mb-[.6rem] inline-flex ${
													loading
														? "text-gray-400"
														: "text-blue-500 hover:text-blue-600"
												} cursor-pointer focus:outline-0`}
												size={18}
												onClick={(event) => {
													setShowActions(true);
													setIds((prev: any) => {
														// Create a new Set with the previous unique values

														if (ids.includes(asset.id)) {
															const updatedIds = ids.filter(
																(id: any) => id !== asset.id,
															);
															return updatedIds;
														} else {
															const uniqueSet = new Set(prev);

															// Add the new asset.id to the set
															uniqueSet.add(asset.id);

															// Convert the set back to an array
															const uniqueIds = Array.from(uniqueSet);
															return uniqueIds;
														}
													});
												}}
											/>
											<Transition
												className={"inline-flex w-[77px]"}
												show={showActions && ids.includes(asset.id)}
												enter="transition-opacity duration-75"
												enterFrom="opacity-0"
												enterTo="opacity-100"
												leave="transition-opacity duration-150"
												leaveFrom="opacity-100"
												leaveTo="opacity-0"
											>
												<MdInfoOutline
													data-tooltip-id={`conflict-${asset.id}`}
													size={18}
													className={`mr-2 inline-flex ${
														loading
															? "text-gray-400"
															: "text-blue-500 hover:text-blue-600"
													} cursor-pointer focus:outline-0`}
													onClick={() => {
														!loading && setConflictModal(true);
														setConflict({
															conflict: asset.conflict,
															description: asset.description,
														});
														setId(asset.id);
														setFiles(asset.files);
													}}
												/>

												{!readonly && (
													<MdDeleteForever
														data-tooltip-id={`asset-${asset.id}`}
														size={18}
														className={`mr-2 inline-flex ${
															loading
																? "text-gray-400"
																: "text-red-400 hover:text-red-700"
														} cursor-pointer focus:outline-0`}
														onClick={() => !loading && deleteAsset(asset.id)}
													/>
												)}
											</Transition>
										</Table.Cell>
										<Tooltip id={`asset-${asset.id}`}>حذف</Tooltip>
										<Tooltip id={`file-${asset.id}`}>پیوست</Tooltip>
										<Tooltip id={`conflict-${asset.id}`}>توضیحات</Tooltip>
										<Tooltip
											closeOnScroll
											id={asset.paraNumber}
											closeOnEsc
											opacity={1}
											clickable
											border={"2px rgb(96 165 250) solid"}
											openOnClick
											style={{
												backgroundColor:
													"rgb(229 231 235 / var(--tw-bg-opacity))",
												borderColor: "black",
												borderWidth: "1px",
												color: "black",
												width: "350px",
												borderRadius: "1rem",
												padding: "1rem",
												zIndex: "9",
											}}
										>
											<textarea
												style={{
													resize: "none",
												}}
												className="mb-4 h-[100px] w-[318px] rounded-2xl border-white px-[10px] py-[5px] placeholder:text-gray-400"
												placeholder="عنوان"
												onChange={(event) =>
													setFormAttribuite((prev: any) => ({
														...prev,
														questionDescription: toFarsiNum(
															event.target.value
																.replace(/^\s+/, "")
																.replace(/\s\s+/g, " "),
														),
													}))
												}
												value={
													formAttribuite?.questionDescription
														? formAttribuite?.questionDescription
														: ""
												}
											/>

											<button
												style={{
													height: "30px",
													borderRadius: "5px",
												}}
												className={`w-full text-white ${
													loading
														? "bg-gray-400"
														: "bg-blue-500 hover:bg-blue-700"
												} text-center`}
												onClick={() => !loading && sendNewAsset(asset.id)}
											>
												{loading ? (
													<Loading size={"sm"} className="justify-center" />
												) : (
													"ثبت"
												)}
											</button>
										</Tooltip>
									</Table.Row>
								) : (
									""
								),
							)
						: ""}
					{!loading && (!assesst || assesst?.length === 0) && ""}
					<Tooltip
						closeOnScroll
						id={"addNewQuestion"}
						place="bottom"
						opacity={1}
						border={"2px rgb(96 165 250) solid"}
						closeOnEsc
						clickable
						openOnClick
						style={{
							backgroundColor: "rgb(229 231 235 / var(--tw-bg-opacity))",
							borderColor: "black",
							borderWidth: "1px",
							color: "black",
							width: "350px",
							borderRadius: "1rem",
							padding: "1rem",
						}}
					>
						<>
							<textarea
								style={{
									resize: "none",
								}}
								className="mb-4 h-[120px] w-[318px] rounded-2xl border-white px-[10px] py-[5px] placeholder:text-gray-400"
								placeholder="عنوان"
								onChange={(event) =>
									setFormAttribuite((prev: any) => ({
										...prev,
										questionDescription: toFarsiNum(
											event.target.value
												.replace(/^\s+/, "")
												.replace(/\s\s+/g, " "),
										),
									}))
								}
								value={
									formAttribuite?.questionDescription
										? formAttribuite?.questionDescription
										: ""
								}
							/>
							<input
								style={{
									height: "30px",
									padding: "0 10px 0 33px",
								}}
								className="rounded-2xl border-white placeholder:text-gray-400"
								type="text"
								placeholder="شماره بند"
								onChange={(event) =>
									setFormAttribuite((prev: any) => ({
										...prev,
										paraNumber: event.target.value.replace(/[^\d.-]+/g, ""),
									}))
								}
								value={
									formAttribuite?.paraNumber ? formAttribuite?.paraNumber : ""
								}
							/>
							<button
								style={{
									height: "30px",
									padding: "0 21px",
									borderRadius: "5px",
								}}
								className={`text-white ${
									loading ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-700"
								} mr-2 text-center`}
								onClick={() => !loading && sendNewQuestion(rootId)}
							>
								{loading ? (
									<Loading size={"sm"} className="justify-center" />
								) : (
									"ثبت"
								)}
							</button>
						</>
					</Tooltip>
				</Table.Body>
			</Table.Root>
		</>
	);
}
