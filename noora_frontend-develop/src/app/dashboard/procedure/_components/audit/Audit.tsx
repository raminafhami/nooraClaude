"use client";

import moment from "jalali-moment";
import { useEffect, useState } from "react";
import { AiFillDelete } from "react-icons/ai";
import { FiEdit } from "react-icons/fi";
import { RxCross2 } from "react-icons/rx";
import { Tooltip } from "react-tooltip";
import { toast } from "sonner";

import DeleteAudit from "@/api/assetRequirement/deleteAudit";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DynamicLink } from "@/components/ui/dynamic-link";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Loading } from "@/ui/Loader";

import { AuditType } from "../../[id]/_components/types/auditType";
import AddAudit from "../modal/AddAudit";
import CategoryTypes from "../modules/AuditTypes";

interface AuditProps {
	auditData: AuditType[];
	loading: boolean;
	setSearch: (s: any) => void;
	search: SearchAttributeProps | undefined;
	setPage: (p: number) => void;
	getData: () => void;
	setLoading: (s: boolean) => void;
	isRisk?: boolean;
	readonly?: boolean;
	selectedAudit?: AuditType;
	setSelectedAudit?: (s: AuditType) => void;
	indexMin: number;
}
interface SearchAttributeProps {
	category?: string;
	title?: string;
	auditNo?: string;
	state?: string;
}
export function Audit({
	auditData,
	loading,
	getData,
	setLoading,
	setSearch,
	search,
	isRisk,
	readonly,
	setPage,
	setSelectedAudit,
	indexMin,
}: AuditProps) {
	const [searchAttribute, setSearchAttribute] = useState<
		SearchAttributeProps | undefined
	>(search);
	const [addAuditModal, setAddAuditModal] = useState<boolean>(false);
	const [data, setData] = useState<AuditType>();

	async function deleteAsset(id: string) {
		setLoading(true);
		try {
			let response = await DeleteAudit({ id });
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

	useEffect(() => {
		const delayDebounceFn = setTimeout(() => {
			if (searchAttribute) {
				setSearch((prev: any) => ({ ...prev, ...searchAttribute }));
			}
		}, 300);

		return () => clearTimeout(delayDebounceFn);
	}, [searchAttribute, setSearch]);

	return (
		<>
			{addAuditModal && data && (
				<AddAudit
					isEdit
					data={data}
					getData={getData}
					isShow={addAuditModal}
					setShow={setAddAuditModal}
					isRisk={isRisk}
					key={"addAudit"}
				/>
			)}
			<Table className="block overflow-x-auto lg:table">
				<TableHeader>
					<TableRow className="select-none bg-gray-100 text-right">
						<TableHead className="text-right text-black">ردیف</TableHead>
						<TableHead className="text-right text-black">
							<input
								key={`input[name]`}
								className="max-w-[10rem] bg-transparent placeholder-black outline-0 focus:text-blue-500 focus:placeholder-blue-500"
								placeholder={"🔎︎ " + "نام"}
								onChange={(event) => {
									setSearchAttribute((prev) => ({
										...prev,
										title: event.target.value,
									}));
									setPage(0);
								}}
								value={searchAttribute?.title}
							/>
						</TableHead>
						<TableHead className="max-w-[6rem] text-right text-black">
							<input
								key={`input[auditNo]`}
								className="max-w-[72%] bg-transparent placeholder-black outline-0 focus:text-blue-500 focus:placeholder-blue-500"
								placeholder={"🔎︎ " + "کد"}
								onChange={(event) => {
									setSearchAttribute((prev) => ({
										...prev,
										auditNo: event.target.value,
									}));
									setPage(0);
								}}
								value={searchAttribute?.auditNo}
							/>
						</TableHead>
						<TableHead className="text-right text-black">
							شماره بازنگری
						</TableHead>
						<TableHead className="text-right text-black">تاریخ صدور</TableHead>
						<TableHead className="text-right text-black">
							{!isRisk && searchAttribute?.category && (
								<RxCross2
									size={17}
									onClick={() => {
										setSearchAttribute((prev) => ({
											...prev,
											category: undefined,
										}));
										setPage(0);
									}}
									className="ml-1 inline cursor-pointer text-red-500"
								/>
							)}
							{isRisk ? (
								"دسته بندی"
							) : (
								<DropdownMenu>
									<DropdownMenuTrigger className="outline-none">
										{searchAttribute?.category ? (
											searchAttribute?.category
										) : (
											<>🔎︎ دسته بندی</>
										)}
									</DropdownMenuTrigger>
									<DropdownMenuContent>
										{CategoryTypes.map(
											(types, index) =>
												types.value !== "ممیزی داخلی" && (
													<DropdownMenuItem
														className="cursor-pointer justify-end"
														key={types.code}
														onClick={() => {
															setSearchAttribute((prev) => ({
																...prev,
																category: types.value,
															}));
															setPage(0);
														}}
													>
														{types.value}
													</DropdownMenuItem>
												),
										)}
									</DropdownMenuContent>
								</DropdownMenu>
							)}
						</TableHead>
						<TableHead className="text-right text-black">تهیه کننده</TableHead>
						<TableHead className="text-right text-black">تایید کننده</TableHead>
						<TableHead className="text-right text-black">تصویب کننده</TableHead>
						<TableHead className="text-right text-black">
							{searchAttribute?.state && (
								<RxCross2
									size={17}
									onClick={() => {
										setSearchAttribute((prev) => ({
											...prev,
											state: undefined,
										}));
										setPage(0);
									}}
									className="ml-1 inline cursor-pointer text-red-500"
								/>
							)}
							<DropdownMenu>
								<DropdownMenuTrigger className="outline-none">
									{searchAttribute?.state ? (
										searchAttribute?.state === "true" ? (
											"تحت کنترل"
										) : (
											"منسوخ شده"
										)
									) : (
										<>🔎︎ وضعیت</>
									)}
								</DropdownMenuTrigger>
								<DropdownMenuContent>
									<DropdownMenuItem
										className="cursor-pointer justify-end"
										key={"true"}
										onClick={() => {
											setSearchAttribute((prev) => ({
												...prev,
												state: "true",
											}));
											setPage(0);
										}}
									>
										تحت کنترل
									</DropdownMenuItem>
									<DropdownMenuItem
										className="cursor-pointer justify-end"
										key={"false"}
										onClick={() => {
											setSearchAttribute((prev) => ({
												...prev,
												state: "false",
											}));
											setPage(0);
										}}
									>
										منسوخ شده
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</TableHead>
						<TableHead className="text-right text-black">شرح تغییرات</TableHead>
						<TableHead className="text-right text-black"></TableHead>
					</TableRow>
				</TableHeader>

				<TableBody className="text-[13px]">
					{loading ? (
						<TableRow>
							<TableCell>
								<Loading size={"sm"}>در حال بارگزاری...</Loading>
							</TableCell>
						</TableRow>
					) : auditData?.length ? (
						auditData.map((asset: any, index: number) => (
							<TableRow
								className={`align-baseline ${readonly && "cursor-pointer"}`}
								key={asset.id}
								onClick={() => {
									if (readonly) {
										setSelectedAudit && setSelectedAudit(asset);
									}
								}}
							>
								<TableCell>{indexMin + (index + 1)}</TableCell>

								<TableCell
									data-tooltip-id={`${index}+${asset.title}`}
									className={`max-w-[10rem] overflow-hidden`}
								>
									{readonly ? (
										asset?.title ? (
											asset.title
										) : (
											"-"
										)
									) : (
										<DynamicLink
											href={`procedure/${asset.id}`}
											className="w-full"
										>
											{asset?.title ? asset.title : "-"}
										</DynamicLink>
									)}
								</TableCell>
								<TableCell>{asset?.auditNo ? asset.auditNo : "-"}</TableCell>

								<TableCell>
									{asset?.reviewNumber
										? asset.reviewNumber?.toString()?.padStart(2, "0")
										: "-"}
								</TableCell>

								<TableCell>
									{asset?.date
										? moment(asset.date).locale("fa").format("YYYY/MM/DD")
										: "-"}
								</TableCell>

								<TableCell className="max-w-7 overflow-hidden text-ellipsis whitespace-nowrap">
									{asset?.category ? asset.category : ""}
								</TableCell>
								<TableCell className="max-w-7 overflow-hidden text-ellipsis whitespace-nowrap">
									{asset?.producer?.name ? asset.producer.name : "-"}{" "}
									{asset?.producer?.lastname ? asset.producer.lastname : ""}
								</TableCell>

								<TableCell className="max-w-7 overflow-hidden text-ellipsis whitespace-nowrap">
									{asset?.seconder?.name ? asset.seconder.name : "-"}{" "}
									{asset?.seconder?.lastname ? asset.seconder.lastname : ""}
								</TableCell>

								<TableCell className="max-w-7 overflow-hidden text-ellipsis whitespace-nowrap">
									{asset?.approver?.name ? asset.approver.name : "-"}{" "}
									{asset?.approver?.lastname ? asset.approver.lastname : ""}
								</TableCell>

								<TableCell
									className={`max-w-7 overflow-hidden text-ellipsis whitespace-nowrap`}
								>
									<span
										className={`rounded-lg p-2 ${
											asset?.state
												? "bg-green-50 text-green-500"
												: "bg-red-50 text-red-500"
										}`}
									>
										{asset?.state ? "تحت کنترل" : "منسوخ شده"}
									</span>
								</TableCell>
								<TableCell className="w-fit">
									<Accordion type="single" collapsible className="w-fit">
										<AccordionItem value="item-1" className="border-none">
											<AccordionTrigger className="hiddenIcon rightIcon w-fit justify-start">
												مشاهده
											</AccordionTrigger>
											<AccordionContent className="max-w-[17rem]">
												{asset?.changeDescription ?? "-"}
											</AccordionContent>
										</AccordionItem>
									</Accordion>
								</TableCell>

								<TableCell>
									{!readonly && (
										<>
											<FiEdit
												size={13}
												onClick={() => {
													setAddAuditModal(true);
													setData(asset);
												}}
												className="ml-2 inline-flex cursor-pointer text-blue-500 hover:text-blue-700 focus:outline-0"
											/>
											<AiFillDelete
												data-tooltip-id={`asset-${asset.id}`}
												size={15}
												className="inline-flex cursor-pointer text-red-400 hover:text-red-700 focus:outline-0"
												onClick={() => deleteAsset(asset.id)}
											/>
										</>
									)}
								</TableCell>
								<Tooltip id={`asset-${asset.id}`}>حذف</Tooltip>
							</TableRow>
						))
					) : (
						""
					)}
					{!loading && (!auditData || auditData?.length === 0) && (
						<TableRow>
							<TableCell colSpan={100}>موردی یافت نشد...</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</>
	);
}
