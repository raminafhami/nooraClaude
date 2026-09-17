"use client";

import moment from "jalali-moment";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { FaCalendarAlt } from "react-icons/fa";
import { FaEye } from "react-icons/fa6";
import DatePicker from "react-multi-date-picker";
import { toast } from "sonner";

import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import { getBranches } from "@/branches/services/getBranches";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { DynamicLink } from "@/components/ui/dynamic-link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Pagination from "@/components/ui/pagination/Pagination";
import {
	Table,
	TableAction,
	TableActions,
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
import { banks } from "@/data";
import { customs } from "@/data/customs";
import { invoicePaymentStatusTypes } from "@/data/invoicePaymentStatusTypes";
import { InstanceStatusBadge } from "@/felo/instances/components/InstanceStatusBadge";
import { instanceStatusOptions } from "@/felo/instances/enums/InstanceStatus";
import { UserType } from "@/identity/users/models/UserType";
import { invoiceTypes } from "@/inspection/flows/coi/data/InvoiceTypes";
import { inspectionMethods } from "@/inspection/flows/coi/models/InspectionMethod";
import goodsInspectionFields from "@/inspection/goodsInspectionFields/data/goodsInspectionFields";
import {
	InspectionType,
	inspectionType as inspectionTypeType,
	inspectionTypes,
} from "@/inspection/models/InspectionType";
import detectInspectionType from "@/inspection/utils/detectInspectionType";
import { getInspectionCaseUrl } from "@/inspection/utils/getInspectionCaseUrl";
import { Loading } from "@/ui/Loader";
import { getDynamicUrl } from "@/utils/url/getDynamicUrl";

import {
	InpectionReports,
	InpectionReportsTypes,
} from "./models/inpectionReportsTypes";
import FindUser from "./modules/FindUser";
import SelectModule from "./modules/SelectModule";
import InspectionReportService from "./services/inspectionReportService";

const AUTHORIZED_USERS: string[] = [
	"09121030046", // Houman Alaei
	"09357220649", // Masoud Toghiani
	"09351619149", // Saeed Mansourian
	"09120359187", // Sharareh Ghanadian
	"09122839864", // Fatemeh Esfandiari
	"09128754685", // Kiarash Shabdiz
	"09127179827", // Fatemeh Riahi
	"09122451677", // Vahid Norouzi
	"09127011974", // Elahe Mohammadian
	"09120992509", // Samaneh Sarlak
	"09120865181", // Mahsa Esmailii
	"09121447707", // Mozhdeh Shojaii
	"09126795247", // Masoumeh Kargar
];

const goodsFieldsOptions = goodsInspectionFields.map((x) => ({
	value: x.id,
	label: x.isDeleted ? `${x.title} (دسته بندی قدیمی)` : x.title,
}));

export default function ReportGenerator() {
	const router = useRouter();
	const { identity } = useLoggedInUser();

	const canDownloadReport =
		identity.type === UserType.System ||
		identity.branchId ||
		AUTHORIZED_USERS.includes(identity.phoneNo);

	const [searchAttribute, setSearchAttribute] = useState<InpectionReportsTypes>(
		{ inspectionType: [] },
	);
	const [items, setItems] = useState<number>(0);
	const [currentPage, setCurrentPage] = useState<number>(0);
	const [isGetData, setIsGetData] = useState<number>(0);
	const [size, setSize] = useState<number>(10);
	const [loading, setLoading] = useState<boolean>(false);
	const [filteredData, setFilteredData] = useState<InpectionReports[]>([]);
	const [enternalDropDown, setEnternalDropDown] = useState<boolean>(true);
	const [branchsList, setBranchsList] = useState<
		Array<{ value: string; label: string }>
	>([]);

	async function getBranchs() {
		setLoading(true);
		try {
			let res = await getBranches();
			if (res) {
				const branchList = [
					{ value: "headquarters", label: "دفتر مرکزی" },
					...res.map((item: { id: string; title: string }) => ({
						value: item.id,
						label: item.title,
					})),
				];

				setBranchsList(branchList);
			}
		} catch (e) {
			console.error(e);
		} finally {
			setLoading(false);
		}
	}

	async function generateReport(download: number) {
		if (!searchAttribute) return;

		setLoading(true);
		try {
			const res: any = await InspectionReportService({
				branchId: identity.branchId,
				page: currentPage,
				size: size,
				searchAttribute,
				download,
			});

			if (res) {
				if (download === 0) {
					setFilteredData(res?.result?.data);
					setItems(res?.result?.count);
					setIsGetData(isGetData + 1);
				} else if (download === 1) {
					const blob = res;
					const url = window.URL.createObjectURL(new Blob([blob]));
					const link = document.createElement("a");
					link.href = url;
					link.setAttribute(
						"download",
						`report-${moment(new Date())
							.locale("fa")
							.format("YYYY/MM/DD")}.xlsx`,
					);
					document.body.appendChild(link);
					link.click();
					document.body.removeChild(link);
					window.URL.revokeObjectURL(url);
					setLoading(false);
				}
			}
		} catch (e) {
			console.error(e);
			toast.error("خطایی رخ داد!");
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		getBranchs();
		generateReport(0);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentPage, size]);

	useEffect(() => {
		setSearchAttribute({});
		setIsGetData(0);
		setCurrentPage(0);
		setSize(10);
		setItems(0);
		setEnternalDropDown(true);
		setFilteredData([]);
	}, []);

	function handleInspectionRedirect({
		id,
		processDefinitionKey: processKey,
	}: Pick<InpectionReports, "id" | "processDefinitionKey">) {
		const url = getInspectionCaseUrl({ id, processKey });
		router.push(getDynamicUrl(url));
	}

	return (
		<>
			<Accordion
				type="single"
				collapsible
				defaultValue="item-1"
				value={enternalDropDown ? "item-1" : ""}
			>
				<AccordionItem value="item-1" className="border-none">
					<AccordionTrigger
						className="mt-2 rounded-xl bg-gray-100 px-2"
						onClick={() => setEnternalDropDown(!enternalDropDown)}
					>
						<div>{searchAttribute ? "مشاهده فیلترها" : "ساخت گزارش جدید"}</div>
					</AccordionTrigger>
					<AccordionContent>
						<div className="my-2 flex select-none flex-wrap rounded-xl border-2 border-gray-100 bg-gray-50 p-4">
							<div className="m-2 my-3 flex w-[32%] flex-col">
								<Label className="mb-2 w-fit rounded-2xl border bg-gray-100 px-4 py-2">
									نوع بازرسی:
								</Label>
								<SelectModule
									data={inspectionTypes}
									setValue={(value) =>
										setSearchAttribute((prev) => ({
											...prev,
											inspectionType: value,
										}))
									}
									value={searchAttribute?.inspectionType ?? []}
								/>
							</div>

							<div className="m-2 my-3 flex w-[32%] flex-col">
								<Label className="mb-2 w-fit rounded-2xl border bg-gray-100 px-4 py-2">
									جزئیات بازرسی:
								</Label>
								<SelectModule
									data={inspectionMethods}
									setValue={(value) =>
										setSearchAttribute((prev) => ({
											...prev,
											inspectionMethod: value,
										}))
									}
									value={searchAttribute?.inspectionMethod ?? []}
								/>
							</div>
							<div className="m-2 my-3 flex w-[32%] flex-col">
								<Label className="mb-2 w-fit rounded-2xl border bg-gray-100 px-4 py-2">
									گروه:
								</Label>
								<SelectModule
									data={goodsFieldsOptions}
									setValue={(value) =>
										setSearchAttribute((prev) => ({
											...prev,
											group: value,
										}))
									}
									value={searchAttribute?.group ?? []}
								/>
							</div>
							<div className="m-2 my-3 flex w-[32%] flex-col">
								<Label className="mb-2 w-fit rounded-2xl border bg-gray-100 px-4 py-2">
									گمرک:
								</Label>
								<SelectModule
									data={customs}
									setValue={(value) =>
										setSearchAttribute((prev) => ({
											...prev,
											customName: value,
										}))
									}
									value={searchAttribute?.customName ?? []}
								/>
							</div>
							{searchAttribute?.inspectionType &&
							searchAttribute.inspectionType.length &&
							searchAttribute.inspectionType[0].value !== "coi" ? (
								<div className="m-2 my-3 flex w-[32%] flex-col">
									<Label className="mb-2 w-fit rounded-2xl border bg-gray-100 px-4 py-2">
										بانک :
									</Label>
									<SelectModule
										data={banks}
										setValue={(value) =>
											setSearchAttribute((prev) => ({
												...prev,
												bankName: value,
											}))
										}
										value={searchAttribute?.bankName ?? []}
									/>
								</div>
							) : (
								""
							)}

							<div className="m-2 my-3 flex w-[32%] flex-col">
								<Label className="mb-2 w-fit rounded-2xl border bg-gray-100 px-4 py-2">
									وضعیت پرداخت:
								</Label>
								<SelectModule
									data={invoicePaymentStatusTypes}
									setValue={(value) =>
										setSearchAttribute((prev) => ({
											...prev,
											invoicePaymentStatus: value,
										}))
									}
									value={searchAttribute?.invoicePaymentStatus ?? []}
								/>
							</div>
							<div className="m-2 my-3 flex w-[32%] flex-col">
								<Label className="mb-2 w-fit rounded-2xl border bg-gray-100 px-4 py-2">
									تعیین نحوه ثبت در دفاتر:
								</Label>
								<SelectModule
									data={invoiceTypes}
									setValue={(value) =>
										setSearchAttribute((prev) => ({
											...prev,
											caseType: value,
										}))
									}
									value={searchAttribute?.caseType ?? []}
								/>
							</div>

							<div className="m-2 my-3 flex w-[32%] flex-col">
								<Label className="mb-2 w-fit rounded-2xl border bg-gray-100 px-4 py-2">
									وضعیت فرآیند بازرسی:
								</Label>
								<SelectModule
									data={instanceStatusOptions}
									setValue={(value) =>
										setSearchAttribute((prev) => ({
											...prev,
											instanceStatus: value,
										}))
									}
									value={searchAttribute?.instanceStatus ?? []}
								/>
							</div>
							{!identity.branchId && (
								<div className="m-2 my-3 flex w-[32%] flex-col">
									<Label className="mb-2 w-fit rounded-2xl border bg-gray-100 px-4 py-2">
										شعبه:
									</Label>
									<SelectModule
										data={branchsList}
										setValue={(value) =>
											setSearchAttribute((prev) => ({
												...prev,
												branch: value,
											}))
										}
										value={searchAttribute?.branch ?? []}
									/>
								</div>
							)}

							<div className="m-2 my-3 flex w-[32%] flex-col">
								<Label className="mb-2 w-fit rounded-2xl border bg-gray-100 px-4 py-2">
									نام هماهنگ کننده:
								</Label>
								<FindUser
									setUser={(value) =>
										setSearchAttribute((prev) => ({
											...prev,
											coordinator: value,
										}))
									}
									user={searchAttribute?.coordinator}
									type={UserType.Personnel}
								/>
							</div>

							<div className="m-2 my-3 flex w-[32%] flex-col">
								<Label className="mb-2 w-fit rounded-2xl border bg-gray-100 px-4 py-2">
									نام کارشناس:
								</Label>
								<FindUser
									setUser={(value) =>
										setSearchAttribute((prev) => ({
											...prev,
											technicalExpert: value,
										}))
									}
									user={searchAttribute?.technicalExpert}
									type={UserType.Personnel}
								/>
							</div>

							{searchAttribute?.inspectionType &&
							searchAttribute.inspectionType.length &&
							searchAttribute.inspectionType[0].value.includes("coi") ? (
								<div className="m-2 my-3 flex w-[32%] flex-col">
									<Label className="mb-2 w-fit rounded-2xl border bg-gray-100 px-4 py-2">
										نام کارشناس ارشد:
									</Label>
									<FindUser
										setUser={(value) =>
											setSearchAttribute((prev) => ({
												...prev,
												seniorExpert: value,
											}))
										}
										user={searchAttribute?.seniorExpert}
										type={UserType.Personnel}
									/>
								</div>
							) : (
								""
							)}

							<div className="m-2 my-3 flex w-[32%] flex-col">
								<Label className="mb-2 w-fit rounded-2xl border bg-gray-100 px-4 py-2">
									نام بازاریاب:
								</Label>
								<FindUser
									setUser={(value) =>
										setSearchAttribute((prev) => ({
											...prev,
											marketer: value,
										}))
									}
									user={searchAttribute?.marketer}
									type={UserType.Personnel}
								/>
							</div>

							<div className="m-2 my-3 flex w-[32%] flex-col">
								<Label className="mb-2 w-fit rounded-2xl border bg-gray-100 px-4 py-2">
									نام مشتری:
								</Label>
								<FindUser
									setUser={(value) =>
										setSearchAttribute((prev) => ({
											...prev,
											customer: value,
										}))
									}
									user={searchAttribute?.customer}
								/>
							</div>

							<div className="m-2 my-3 flex w-[32%] flex-col">
								<Label className="mb-2 w-fit rounded-2xl border bg-gray-100 px-4 py-2">
									نام بازرس:
								</Label>
								<Input
									className="h-10 w-full max-w-[400px] rounded-2xl"
									value={searchAttribute?.inspectorName}
									onChange={(event) =>
										setSearchAttribute((prev) => ({
											...prev,
											inspectorName: event?.target?.value,
										}))
									}
								/>
							</div>

							{searchAttribute?.inspectionType &&
							searchAttribute.inspectionType.length &&
							searchAttribute.inspectionType[0].value.includes("coi") ? (
								<div className="m-2 my-3 flex w-[32%] flex-col">
									<Label className="mb-2 w-fit rounded-2xl border bg-gray-100 px-4 py-2">
										Description of Goods :
									</Label>
									<Input
										className="h-10 w-full max-w-[400px] rounded-2xl"
										value={searchAttribute?.customTariffNoOrHsCode}
										onChange={(event) =>
											setSearchAttribute((prev) => ({
												...prev,
												customTariffNoOrHsCode: event?.target?.value,
											}))
										}
									/>
								</div>
							) : (
								""
							)}

							{searchAttribute?.inspectionType &&
							searchAttribute.inspectionType.length &&
							searchAttribute.inspectionType[0].value.includes("coi") ? (
								<div className="m-2 my-3 flex w-[32%] flex-col">
									<Label className="mb-2 w-fit rounded-2xl border bg-gray-100 px-4 py-2">
										برند :
									</Label>
									<Input
										className="h-10 w-full max-w-[400px] rounded-2xl"
										value={searchAttribute?.brand}
										onChange={(event) =>
											setSearchAttribute((prev) => ({
												...prev,
												brand: event?.target?.value,
											}))
										}
									/>
								</div>
							) : (
								""
							)}

							{searchAttribute?.inspectionType &&
							searchAttribute.inspectionType.length &&
							searchAttribute.inspectionType[0].value.includes("coi") ? (
								<div className="m-2 my-3 flex w-[32%] flex-col">
									<Label className="mb-2 w-fit rounded-2xl border bg-gray-100 px-4 py-2">
										تولید کننده :
									</Label>
									<Input
										className="h-10 w-full max-w-[400px] rounded-2xl"
										value={searchAttribute?.manufacturer}
										onChange={(event) =>
											setSearchAttribute((prev) => ({
												...prev,
												manufacturer: event?.target?.value,
											}))
										}
									/>
								</div>
							) : (
								""
							)}

							{searchAttribute?.inspectionType &&
							searchAttribute.inspectionType.length &&
							searchAttribute.inspectionType[0].value.includes("coi") ? (
								<div className="m-2 my-3 flex w-[32%] flex-col">
									<Label className="mb-2 w-fit rounded-2xl border bg-gray-100 px-4 py-2">
										آزمایشگاه :
									</Label>
									<Input
										className="h-10 w-full max-w-[400px] rounded-2xl"
										value={searchAttribute?.labName}
										onChange={(event) =>
											setSearchAttribute((prev) => ({
												...prev,
												labName: event?.target?.value,
											}))
										}
									/>
								</div>
							) : (
								""
							)}

							<div className="m-2 my-3 flex w-[32%] flex-col">
								<Label className="mb-2 w-fit rounded-2xl border bg-gray-100 px-4 py-2">
									نام خریدار:
								</Label>
								<Input
									className="h-10 w-full max-w-[400px] rounded-2xl"
									value={searchAttribute?.buyer}
									onChange={(event) =>
										setSearchAttribute((prev) => ({
											...prev,
											buyer: event?.target?.value,
										}))
									}
								/>
							</div>
							<div className="m-2 my-3 flex w-[32%] flex-col">
								<Label className="mb-2 w-fit rounded-2xl border bg-gray-100 px-4 py-2">
									B/L No:
								</Label>
								<Input
									className="h-10 w-full max-w-[400px] rounded-2xl"
									value={searchAttribute?.billOfLadingNo}
									onChange={(event) =>
										setSearchAttribute((prev) => ({
											...prev,
											billOfLadingNo: event?.target?.value,
										}))
									}
								/>
							</div>
							<div className="m-2 my-3 flex w-[32%] flex-col">
								<Label className="mb-2 w-fit rounded-2xl border bg-gray-100 px-4 py-2">
									Performa No:
								</Label>
								<Input
									className="h-10 w-full max-w-[400px] rounded-2xl"
									value={searchAttribute?.proformaNo}
									onChange={(event) =>
										setSearchAttribute((prev) => ({
											...prev,
											proformaNo: event?.target?.value,
										}))
									}
								/>
							</div>
							<div className="m-2 my-3 flex w-[32%] flex-col">
								<Label className="mb-2 w-fit rounded-2xl border bg-gray-100 px-4 py-2">
									شماره درخواست:
								</Label>
								<Input
									className="h-10 w-full max-w-[400px] rounded-2xl"
									value={searchAttribute?.caseNo}
									onChange={(event) =>
										setSearchAttribute((prev) => ({
											...prev,
											caseNo: event?.target?.value,
										}))
									}
								/>
							</div>
							<div className="m-2 my-3 flex w-[32%] flex-col">
								<Label className="mb-2 w-fit rounded-2xl border bg-gray-100 px-4 py-2">
									شماره گواهی:
								</Label>
								<Input
									className="h-10 w-full max-w-[400px] rounded-2xl"
									value={searchAttribute?.certificateIssueNo}
									onChange={(event) =>
										setSearchAttribute((prev) => ({
											...prev,
											certificateIssueNo: event?.target?.value,
										}))
									}
								/>
							</div>
							<div className="m-2 my-3 flex w-[32%] flex-col">
								<Label className="mb-2 w-fit rounded-2xl border bg-gray-100 px-4 py-2">
									محل بازرسی:
								</Label>
								<Input
									className="h-10 w-full max-w-[400px] rounded-2xl"
									value={searchAttribute?.inspectionPlace}
									onChange={(event) =>
										setSearchAttribute((prev) => ({
											...prev,
											inspectionPlace: event?.target?.value,
										}))
									}
								/>
							</div>
							{!searchAttribute?.inspectionType ||
								(searchAttribute?.inspectionType.length &&
								!searchAttribute.inspectionType[0].value.includes("coi") ? (
									<div className="m-2 my-3 flex w-[32%] flex-col">
										<Label className="mb-2 w-fit rounded-2xl border bg-gray-100 px-4 py-2">
											کالا :
										</Label>
										<Input
											className="h-10 w-full max-w-[400px] rounded-2xl"
											value={searchAttribute?.goodsDescriptions}
											onChange={(event) =>
												setSearchAttribute((prev) => ({
													...prev,
													goodsDescriptions: event?.target?.value,
												}))
											}
										/>
									</div>
								) : (
									""
								))}

							<div className="m-2 my-3 flex w-[32%] flex-col">
								<Label className="mb-2 w-fit rounded-2xl border bg-gray-100 px-4 py-2">
									مبلغ بازرسی:
								</Label>
								<Input
									className="h-10 w-full max-w-[400px] rounded-2xl"
									value={searchAttribute?.inspectionFee}
									onChange={(event) =>
										setSearchAttribute((prev) => ({
											...prev,
											inspectionFee: event?.target?.value,
										}))
									}
								/>
							</div>

							<div className="m-2 my-3 flex w-[32%] flex-col">
								<Label className="mb-2 w-fit rounded-2xl border bg-gray-100 px-4 py-2">
									از تاریخ:
								</Label>
								<DatePicker
									calendar={persian}
									locale={persian_fa}
									inputClass={`min-w-[230px] text-[.9rem] mb-[1rem] mt-[1rem] pl-[2.8rem] pr-[.5rem] border-white border-2 bg-white rounded-2xl group relative text-ellipsis focus:border-blue-500 placeholder-gray-400 focus:text-black py-2 focus:outline-0`}
									placeholder="تاریخ"
									calendarPosition="bottom"
									onFocusedDateChange={(dateFocused, dateClicked) =>
										dateClicked &&
										setSearchAttribute((prev) => ({
											...prev,
											fromDate: dateClicked?.toDate(),
										}))
									}
									render={(value, openCalendar, onValueChange) => (
										<div className="group flex max-w-[400px] rounded-2xl border border-gray-200 bg-white">
											<div
												className="flex shrink-0 basis-10 cursor-pointer items-center justify-center rounded-s-2xl border-e border-gray-200 group-aria-disabled:cursor-not-allowed group-aria-disabled:bg-gray-50"
												onClick={openCalendar}
											>
												<FaCalendarAlt />
											</div>
											<input
												className="h-10 w-full rounded-e-2xl border-none px-3 text-start leading-4 focus:outline-none focus:ring-0 focus:ring-offset-0 disabled:bg-gray-50 group-aria-disabled:cursor-not-allowed"
												value={value}
												onChange={onValueChange}
												onFocus={openCalendar}
											/>
										</div>
									)}
									value={searchAttribute?.fromDate}
									maxDate={searchAttribute?.toDate}
								/>
							</div>
							<div className="m-2 my-3 flex w-[32%] flex-col">
								<Label className="mb-2 w-fit rounded-2xl border bg-gray-100 px-4 py-2">
									تا تاریخ:
								</Label>
								<DatePicker
									calendar={persian}
									locale={persian_fa}
									inputClass={`min-w-[230px] text-[.9rem] mb-[1rem] mt-[1rem] pl-[2.8rem] pr-[.5rem] border-white border-2 bg-white rounded-2xl group relative text-ellipsis focus:border-blue-500 placeholder-gray-400 focus:text-black py-2 focus:outline-0`}
									placeholder="تاریخ"
									calendarPosition="bottom"
									onFocusedDateChange={(dateFocused, dateClicked) =>
										dateClicked &&
										setSearchAttribute((prev) => ({
											...prev,
											toDate: dateClicked?.toDate(),
										}))
									}
									render={(value, openCalendar, onValueChange) => (
										<div className="group flex max-w-[400px] rounded-2xl border border-gray-200 bg-white">
											<div
												className="flex shrink-0 basis-10 cursor-pointer items-center justify-center rounded-s-2xl border-e border-gray-200 group-aria-disabled:cursor-not-allowed group-aria-disabled:bg-gray-50"
												onClick={openCalendar}
											>
												<FaCalendarAlt />
											</div>
											<input
												className="h-10 w-full rounded-e-2xl border-none px-3 text-start leading-4 focus:outline-none focus:ring-0 focus:ring-offset-0 disabled:bg-gray-50 group-aria-disabled:cursor-not-allowed"
												value={value}
												onChange={onValueChange}
												onFocus={openCalendar}
											/>
										</div>
									)}
									value={searchAttribute?.toDate}
									minDate={searchAttribute?.fromDate}
								/>
							</div>

							{
								// sampling filters
								searchAttribute.inspectionType?.some(
									(x) => x.value === InspectionType.Sampling,
								) && (
									<>
										<div className="m-2 my-3 flex w-[32%] flex-col">
											<Label className="mb-2 w-fit rounded-2xl border bg-gray-100 px-4 py-2">
												مهار:
											</Label>
											<Input
												className="h-10 w-full max-w-[400px] rounded-2xl rtl:text-right"
												dir="ltr"
												value={searchAttribute?.restraint}
												onChange={(event) =>
													setSearchAttribute((prev) => ({
														...prev,
														restraint: event?.target?.value,
													}))
												}
											/>
										</div>

										<div className="m-2 my-3 flex w-[32%] flex-col">
											<Label className="mb-2 w-fit rounded-2xl border bg-gray-100 px-4 py-2">
												شماره کوتاژ:
											</Label>
											<Input
												className="h-10 w-full max-w-[400px] rounded-2xl rtl:text-right"
												dir="ltr"
												value={searchAttribute?.cottageNo}
												onChange={(event) =>
													setSearchAttribute((prev) => ({
														...prev,
														cottageNo: event?.target?.value,
													}))
												}
											/>
										</div>

										<div className="m-2 my-3 flex w-[32%] flex-col">
											<Label className="mb-2 w-fit rounded-2xl border bg-gray-100 px-4 py-2">
												شماره برگه نمونه برداری:
											</Label>
											<Input
												className="h-10 w-full max-w-[400px] rounded-2xl rtl:text-right"
												dir="ltr"
												value={searchAttribute?.pageNo}
												onChange={(event) =>
													setSearchAttribute((prev) => ({
														...prev,
														pageNo: event?.target?.value,
													}))
												}
											/>
										</div>
									</>
								)
							}
						</div>

						<div className="my-2 flex justify-end">
							<Button
								variant="destructive"
								className="mx-1"
								disabled={loading || !searchAttribute}
								onClick={() => {
									setSearchAttribute({});
									setFilteredData([]);
								}}
							>
								{loading ? (
									<Loading
										size="sm"
										horizontalPlacement={"center"}
										verticalPlacement={"center"}
									/>
								) : (
									"حذف همه فیلترها"
								)}
							</Button>
							<Button
								className="mx-1"
								disabled={loading || !searchAttribute}
								onClick={() => {
									setCurrentPage(0);
									generateReport(0);
									setEnternalDropDown(false);
								}}
							>
								{loading ? (
									<Loading
										size="sm"
										horizontalPlacement={"center"}
										verticalPlacement={"center"}
									/>
								) : (
									"جستجو"
								)}
							</Button>
						</div>
					</AccordionContent>
				</AccordionItem>
			</Accordion>

			{canDownloadReport && filteredData?.length > 0 && (
				<div className="my-4">
					<Button
						variant="default"
						className="mx-1"
						disabled={loading || !searchAttribute}
						onClick={() => generateReport(1)}
					>
						{loading ? (
							<Loading
								size="sm"
								horizontalPlacement="center"
								verticalPlacement="center"
							/>
						) : (
							"دانلود فایل Excel"
						)}
					</Button>
				</div>
			)}

			{filteredData?.length && !loading ? (
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="text-center">#</TableHead>
							<TableHead className="text-center">شماره درخواست</TableHead>
							<TableHead className="text-center">شماره گواهی</TableHead>
							<TableHead className="text-center">نوع بازرسی</TableHead>
							<TableHead className="text-center">جزئیات بازرسی</TableHead>
							<TableHead className="text-center">خریدار</TableHead>
							<TableHead className="text-center">مشتری</TableHead>
							<TableHead className="text-center">شعبه</TableHead>
							<TableHead className="text-center">نام آزمایشگاه</TableHead>
							<TableHead className="text-center">
								Description of Goods
							</TableHead>
							<TableHead className="text-center">Performa No</TableHead>
							<TableHead className="text-center">B/L No</TableHead>
							{/* {
									// identity?.groups?.includes("coi-manager") ||
									// identity?.groups?.includes("ic-manager")
									true ? (
										<TableHead className="text-center">هزینه بازرسی</TableHead>
									) : (
										""
									)
								} */}
							<TableHead className="text-center">نوع پرداخت</TableHead>
							<TableHead className="text-center">وضعیت پرداخت</TableHead>
							<TableHead className="text-center">وضعیت فرایند</TableHead>
							<TableHead className="text-center">فایل بازرسی</TableHead>
							<TableHead className="text-center">تاریخ ایجاد</TableHead>
							<TableHead>عملیات</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{loading ? (
							<TableRow>
								<TableCell colSpan={10}>
									در حال دریافت اطلاعات... <Loading size={"sm"} />
								</TableCell>
							</TableRow>
						) : (
							filteredData?.map((data, index) => {
								const inspectionType = detectInspectionType(
									data.processDefinitionKey,
								);

								return (
									<TableRow
										key={data?.id}
										className="cursor-pointer"
										onClick={() => handleInspectionRedirect(data)}
									>
										<TableCell className="text-center">{index + 1}</TableCell>
										<TableCell className="text-center">
											{data?.caseNo ?? "-"}
										</TableCell>
										<TableCell className="text-center">
											{data?.parameters?.CertificateIssueNo ?? "-"}
										</TableCell>
										<TableCell className="text-center">
											{inspectionType
												? (inspectionTypeType[inspectionType]?.title ?? "-")
												: "-"}
										</TableCell>
										<TableCell className="text-center">
											{data?.parameters?.InspectionMethod
												? inspectionMethods?.map(
														(item) =>
															item?.value ===
																data?.parameters?.InspectionMethod &&
															item.label,
													)
												: "-"}
										</TableCell>
										<TableCell className="text-center">
											{data?.parameters?.Buyer?.name ?? "-"}
										</TableCell>
										<TableCell className="text-center">
											{data?.parameters?.Assignees?.customer?.name ?? "-"}
										</TableCell>
										<TableCell className="text-center">
											{data?.parameters?.Branch?.name ?? "-"}
										</TableCell>
										<TableCell className="text-center">
											{data?.parameters?.LabName ?? "-"}
										</TableCell>
										<TableCell className="text-center">
											{data?.parameters?.GoodsDescriptions ?? "-"}
										</TableCell>
										<TableCell className="text-center">
											{data?.parameters?.ProformaNo ?? "-"}
										</TableCell>
										<TableCell className="text-center">
											{data?.parameters?.BillOfLadingNo ?? "-"}
										</TableCell>
										{/* {
												// identity?.groups?.includes("coi-manager") ||
												// identity?.groups?.includes("ic-manager")
												true ? (
													<TableCell className="text-center">
														{data?.parameters?.InspectionFee ||
														data?.parameters?.InspectionFeeInRial
															? `${
																	data?.parameters?.InspectionFee?.replace(
																		/\B(?=(\d{3})+(?!\d))/g,
																		",",
																	) ||
																	data?.parameters?.InspectionFeeInRial?.replace(
																		/\B(?=(\d{3})+(?!\d))/g,
																		",",
																	)
																} ${
																	currencies.find(
																		(x) =>
																			x.value ===
																			data?.parameters?.InspectionFeeCurrency,
																	)?.label ?? "ریال"
																}`
															: "-"}
													</TableCell>
												) : (
													""
												)
											} */}

										<TableCell className="text-center">
											{data?.parameters?.CaseType
												? invoiceTypes?.map(
														(item) =>
															item?.value === data?.parameters?.CaseType &&
															item.label,
													)
												: "-"}
										</TableCell>

										<TableCell className="text-center">
											{data?.parameters?.InvoicePaymentStatus
												? invoicePaymentStatusTypes?.map(
														(item) =>
															item?.value ===
																data?.parameters?.InvoicePaymentStatus &&
															item.label,
													)
												: "-"}
										</TableCell>
										<TableCell className="text-center">
											<InstanceStatusBadge instance={data} />
										</TableCell>
										<TableCell className="text-center">
											{data?.hasFile ? "دارد" : "ندارد"}
										</TableCell>
										<TableCell className="text-center">
											{data?.createdAt
												? moment(data?.createdAt).format("jYYYY/jMM/jDD")
												: "-"}
										</TableCell>
										<TableCell>
											<TooltipProvider>
												<TableActions>
													<Tooltip>
														<TooltipTrigger asChild>
															<DynamicLink
																className="h-full"
																href={getInspectionCaseUrl({
																	id: data.id,
																	processKey: data.processDefinitionKey,
																})}
															>
																<TableAction className="hover:text-blue-500">
																	<FaEye />
																</TableAction>
															</DynamicLink>
														</TooltipTrigger>
														<TooltipContent>مشاهده درخواست</TooltipContent>
													</Tooltip>
												</TableActions>
											</TooltipProvider>
										</TableCell>
									</TableRow>
								);
							})
						)}
					</TableBody>
				</Table>
			) : (
				""
			)}

			{!filteredData?.length && isGetData > 0 && searchAttribute && (
				<p className="my-2 rounded-xl bg-gray-100 p-4">نتیجه ای یافت نشد...</p>
			)}

			<div className="my-4">
				{filteredData?.length ? (
					<Pagination
						items={items}
						currentPage={currentPage}
						size={size}
						onPageChange={setCurrentPage}
						loading={loading}
						setSize={setSize}
					/>
				) : (
					""
				)}
			</div>
		</>
	);
}
