"use client";

import moment from "jalali-moment";
import { useCallback, useEffect, useState } from "react";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { FaCalendarAlt } from "react-icons/fa";
import DatePicker from "react-multi-date-picker";
import { toast } from "sonner";

import { isApiResponse } from "@/api/utils/isApiResponse";
import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import { getBranches } from "@/branches/services/getBranches";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Pagination from "@/components/ui/pagination/Pagination";
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { instanceStatus } from "@/felo/instances/enums/InstanceStatus";
import { UserType } from "@/identity/users/models/UserType";
import { invoiceTypes } from "@/inspection/flows/coi/data/InvoiceTypes";
import { inspectionMethods } from "@/inspection/flows/coi/models/InspectionMethod";
import { inspectionType as inspectionTypeType } from "@/inspection/models/InspectionType";
import detectInspectionType from "@/inspection/utils/detectInspectionType";

import { InpectionReports } from "../../inspection/_module/instance-search/models/inpectionReportsTypes";
import FindUser from "../../inspection/_module/instance-search/modules/FindUser";
import SelectModule from "../../inspection/_module/instance-search/modules/SelectModule";
import { CollectionQuery } from "./CollectionQuery";
import { getCustomerCoordinatorInstances } from "./getCustomerCoordinatorInstances";

function CollectionList() {
	const { identity } = useLoggedInUser();

	const [branchsList, setBranchsList] = useState<
		Array<{ value: string; label: string }>
	>([]);

	const fetchBranches = useCallback(async () => {
		try {
			let response = await getBranches();

			const branchList = response.map(
				(item: { id: string; title: string }) => ({
					value: item.id,
					label: item.title,
				}),
			);

			setBranchsList(branchList);
		} catch (err) {
			console.error(err);
			toast.error("خطای نامشخصی در هنگام دریافت فهرست شعب رخ داد.");
		}
	}, []);

	useEffect(() => {
		fetchBranches();
	}, [fetchBranches]);

	const [searchAttribute, setSearchAttribute] = useState<CollectionQuery>();
	const [queryFilters, setQueryFilters] = useState<CollectionQuery>();

	const [size, setSize] = useState<number>(10);
	const [currentPage, setCurrentPage] = useState<number>(0);
	const offset = size * currentPage;
	const [items, setItems] = useState<number>(0);

	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [filteredData, setFilteredData] = useState<InpectionReports[]>();
	const [inspectionFeeInRialSum, setInspectionFeeInRialSum] =
		useState<number>(0);

	const fetchData = useCallback(
		async (download: number) => {
			try {
				setIsLoading(true);

				const response = await getCustomerCoordinatorInstances({
					branchId: identity.branchId,
					page: currentPage,
					size: size,
					searchAttribute: queryFilters,
					download,
				});

				if (isApiResponse(response)) {
					setFilteredData(response.result.data);
					setInspectionFeeInRialSum(response.result.unpaidAmountSum);
					setItems(response.result.count);
				} else {
					const url = window.URL.createObjectURL(new Blob([response]));

					const link = document.createElement("a");
					link.href = url;
					link.setAttribute(
						"download",
						`collection-${moment(new Date())
							.locale("fa")
							.format("YYYY/MM/DD")}.xlsx`,
					);

					document.body.appendChild(link);
					link.click();

					document.body.removeChild(link);
					window.URL.revokeObjectURL(url);
				}
			} catch (err) {
				console.error(err);
				toast.error("خطای نامشخصی رخ داد.");

				setFilteredData(undefined);
			} finally {
				setIsLoading(false);
			}
		},
		[currentPage, identity.branchId, queryFilters, size],
	);

	useEffect(() => {
		fetchData(0);
	}, [fetchData]);

	return (
		<>
			<div className="my-2 flex select-none flex-wrap rounded-xl border-2 border-gray-100 bg-gray-50 p-4">
				{(identity?.groups?.includes("ceo") ||
					identity?.groups?.includes("ic-manager") ||
					identity?.groups?.includes("coi-manager")) && (
					<>
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
					</>
				)}

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
						از تاریخ شروع:
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
								createdFromDate: dateClicked?.toDate(),
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
						value={searchAttribute?.createdFromDate}
						maxDate={searchAttribute?.createdToDate}
					/>
				</div>

				<div className="m-2 my-3 flex w-[32%] flex-col">
					<Label className="mb-2 w-fit rounded-2xl border bg-gray-100 px-4 py-2">
						تا تاریخ شروع:
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
								createdToDate: dateClicked?.toDate(),
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
						value={searchAttribute?.createdToDate}
						minDate={searchAttribute?.createdFromDate}
					/>
				</div>

				<div className="m-2 my-3 flex w-[32%] flex-col">
					<Label className="mb-2 w-fit rounded-2xl border bg-gray-100 px-4 py-2">
						از تاریخ پایان:
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
								completedFromDate: dateClicked?.toDate(),
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
						value={searchAttribute?.completedFromDate}
						maxDate={searchAttribute?.completedToDate}
					/>
				</div>

				<div className="m-2 my-3 flex w-[32%] flex-col">
					<Label className="mb-2 w-fit rounded-2xl border bg-gray-100 px-4 py-2">
						تا تاریخ پایان:
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
								completedToDate: dateClicked?.toDate(),
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
						value={searchAttribute?.completedToDate}
						minDate={searchAttribute?.completedFromDate}
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
			</div>

			<div className="my-2 flex justify-end">
				<Button
					variant="destructive"
					className="mx-1"
					disabled={isLoading}
					onClick={() => {
						setSearchAttribute({});
						setFilteredData([]);
					}}
				>
					حذف همه فیلترها
				</Button>

				<Button
					className="mx-1"
					disabled={isLoading}
					onClick={() => {
						setQueryFilters({ ...(searchAttribute ?? {}) });
						setCurrentPage(0);
					}}
				>
					جستجو
				</Button>
			</div>

			<div className="my-4">
				<Button
					variant={"default"}
					className="mx-1"
					disabled={isLoading || !searchAttribute || !filteredData}
					onClick={() => {
						fetchData(1);
					}}
				>
					دانلود فایل Excel
				</Button>
			</div>

			<Table className="my-4 w-full" loading={isLoading}>
				<TableCaption className="mx-4 select-none rounded-2xl bg-gray-50 py-2">
					مجموع:{" "}
					<span className="select-all">{`${inspectionFeeInRialSum?.toLocaleString()}`}</span>
					<span className="mx-1">ریال</span>
				</TableCaption>

				<TableHeader>
					<TableRow>
						<TableHead className="text-center">ردیف</TableHead>
						<TableHead className="text-center">شماره درخواست</TableHead>
						{/* <TableHead className="text-center">شماره گواهی</TableHead> */}
						<TableHead className="text-center">نوع بازرسی</TableHead>
						<TableHead className="text-center">جزئیات بازرسی</TableHead>
						<TableHead className="text-center">خریدار</TableHead>
						<TableHead className="text-center">مشتری</TableHead>
						<TableHead className="text-center">شعبه</TableHead>
						<TableHead className="text-center">مبلغ قابل پرداخت</TableHead>
						<TableHead className="text-center">نوع پرداخت</TableHead>
						<TableHead className="text-center">وضعیت فرایند</TableHead>
						<TableHead className="text-center">تاریخ ایجاد</TableHead>
					</TableRow>
				</TableHeader>

				<TableBody>
					{filteredData?.length ? (
						filteredData?.map((data, index) => {
							const inspectionType = detectInspectionType(
								data.processDefinitionKey,
							);

							return (
								<TableRow key={data.id}>
									<TableCell className="text-center">
										{offset + index + 1}
									</TableCell>
									<TableCell className="text-center">
										{data.caseNo ?? "-"}
									</TableCell>
									{/* <TableCell className="text-center">
								{data.parameters?.CertificateIssueNo ?? "-"}
								</TableCell> */}
									<TableCell className="text-center">
										{inspectionType
											? (inspectionTypeType[inspectionType]?.title ?? "-")
											: "-"}
									</TableCell>
									<TableCell className="text-center">
										{data.parameters?.InspectionMethod
											? inspectionMethods?.map(
													(item) =>
														item?.value === data.parameters?.InspectionMethod &&
														item.label,
												)
											: "-"}
									</TableCell>
									<TableCell className="text-center">
										{data.parameters?.Buyer?.name ?? "-"}
									</TableCell>
									<TableCell className="text-center">
										{data.parameters?.Assignees?.customer?.name ?? "-"}
									</TableCell>
									<TableCell className="text-center">
										{data.parameters?.Branch?.name ?? "-"}
									</TableCell>
									<TableCell className="text-center">
										{/* TODO: define custom type for data */}
										{`${(data as any).unpaidAmount?.replace(
											/\B(?=(\d{3})+(?!\d))/g,
											",",
										)} ریال` || "-"}
									</TableCell>
									<TableCell className="text-center">
										{data.parameters?.CaseType
											? invoiceTypes?.map(
													(item) =>
														item?.value === data.parameters?.CaseType &&
														item.label,
												)
											: "-"}
									</TableCell>
									<TableCell className="text-center">
										{instanceStatus[data.status] || "-"}
									</TableCell>
									<TableCell className="text-center">
										{data.createdAt
											? moment(data.createdAt).format("jYYYY/jMM/jDD")
											: "-"}
									</TableCell>
								</TableRow>
							);
						})
					) : (
						<TableRow>
							<TableCell colSpan={100}>هیچ موردی یافت نشد.</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>

			<div className="my-4">
				{!!filteredData?.length && (
					<Pagination
						items={items}
						currentPage={currentPage}
						size={size}
						onPageChange={setCurrentPage}
						loading={isLoading}
						setSize={setSize}
					/>
				)}
			</div>
		</>
	);
}

export { CollectionList };
