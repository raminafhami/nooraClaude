"use client";
import { addCommas } from "persian-tools";
import { useEffect, useState } from "react";
import { FaEye } from "react-icons/fa";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Pagination from "@/components/ui/pagination/Pagination";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserType } from "@/identity/users/models/UserType";
import { PaymentPriority } from "@/inspection/flows/paymentOrder/data/PaymentPriority";
import { PaymentTyps } from "@/inspection/flows/paymentOrder/data/PaymentTypes";
import { currencies } from "@/inspection/models/Currencies";
import detectInspectionType from "@/inspection/utils/detectInspectionType";
import { Loading } from "@/ui/Loader";

import FindUser from "../../../inspection/_module/instance-search/modules/FindUser";
import SelectModule from "../../../inspection/_module/instance-search/modules/SelectModule";
import FinancialFilesModal from "./FinancialFilesModal";
import {
  Datum,
  FinancialSearchProps,
  PaymentOrderStates,
} from "./models/FinancialTypes";
import FinancialService from "./services/FinancialService";

export default function FinancialComponent() {
	const [searchAttribute, setSearchAttribute] = useState<FinancialSearchProps>(
		{},
	);
	const [items, setItems] = useState<number>(0);
	const [currentPage, setCurrentPage] = useState<number>(0);
	const [size, setSize] = useState<number>(10);
	const [loading, setLoading] = useState<boolean>(false);
	const [financialData, setFinancialData] = useState<Datum[]>([]);
	const [isModal, setIsModal] = useState<boolean>(false);
	const [instanceId, setInstanceId] = useState<string>();
	async function getFinancialData() {
		setLoading(true);
		try {
			let res = await FinancialService({
				page: currentPage,
				size,
				searchAttribute,
			});
			if (res) {
				setFinancialData(res?.result?.data);
				setItems(res?.result?.count);
				setLoading(false);
			}
		} catch (e: any) {
			setLoading(false);
		}
	}

	// async function generateExcel() {
	//   const data = [] as any;
	//   financialData?.map((item, index) => {
	//     const inspectionType = detectInspectionType(item.processDefinitionKey);

	//     data.push({
	//       ردیف: index + 1,
	//       "شماره درخواست": item?.caseNo ?? "-",
	//       "نوع بازرسی": inspectionType
	//         ? inspectionTypeType[inspectionType]?.title ?? "-"
	//         : "-",
	//       "جزئیات بازرسی":
	//         inspectionMethods?.find(
	//           (i) => i?.value === item?.parameters?.InspectionMethod,
	//         )?.label ?? "-",
	//       خریدار: item?.parameters?.Buyer?.name ?? "-",
	//       مشتری: item?.parameters?.Assignees?.customer?.name ?? "-",
	//       "هزینه بازرسی به ریال": item?.parameters?.InspectionFeeInRial
	//         ? Number(item?.parameters?.InspectionFeeInRial) || "-"
	//         : "-",
	//       "هزینه بازرسی": item?.parameters?.InspectionFee
	//         ? `${item?.parameters?.InspectionFee} ${
	//             currencies.find(
	//               (x) => x.value === item?.parameters?.InspectionFeeCurrency,
	//             )?.label ?? "ریال"
	//           }` || "-"
	//         : "-",
	//       "نوع پرداخت":
	//         invoiceTypes?.find((i) => i?.value === item?.parameters?.CaseType)
	//           ?.label ?? "-",
	//       "وضعیت فرایند":
	//         stateList?.find((i) => i?.value === item?.status)?.label ?? "-",
	//       "تاریخ ایجاد": moment(item?.createdAt).format("jYYYY/jMM/jDD") ?? "-",
	//     });
	//   });

	//   const workbook = {
	//     SheetNames: ["Sheet 1"],
	//     Sheets: {},
	//   };
	//   const worksheet = XLSX.utils.json_to_sheet(data);
	//   // @ts-ignore
	//   workbook.Sheets["Sheet 1"] = worksheet;

	//   XLSX.writeFile(
	//     workbook,
	//     "InspectionReport-" +
	//       moment(new Date()).format("YYYY/MM/DD - HH:mm") +
	//       ".xlsx",
	//   );
	// }

	useEffect(() => {
		getFinancialData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentPage, size]);

	return (
		<div className="space-y-10">
			<Accordion type="single" collapsible>
				<AccordionItem value="item-1">
					<AccordionTrigger className="mt-2 rounded-xl bg-gray-50 px-2">
						جست‌وجو پیشرفته
					</AccordionTrigger>
					<AccordionContent>
						<div className="flex flex-wrap rounded-2xl bg-gray-50 px-4 py-2">
							<div className="m-2 my-3 flex w-[32%] flex-col">
								<Label className="mb-2 w-fit rounded-2xl border bg-gray-100 px-4 py-2">
									درخواست دهنده:
								</Label>
								<FindUser
									setUser={(value) =>
										setSearchAttribute((prev) => ({
											...prev,
											user: value,
										}))
									}
									user={searchAttribute?.user}
									type={UserType.Personnel}
								/>
							</div>
							<div className="m-2 my-3 flex w-[32%] flex-col">
								<Label className="mb-2 w-fit rounded-2xl border bg-gray-100 px-4 py-2">
									دسته بندی:
								</Label>
								<SelectModule
									data={PaymentTyps}
									setValue={(value) =>
										setSearchAttribute((prev) => ({
											...prev,
											type: value,
										}))
									}
									value={searchAttribute?.type ?? []}
								/>
							</div>{" "}
							<div className="m-2 my-3 flex w-[32%] flex-col">
								<Label className="mb-2 w-fit rounded-2xl border bg-gray-100 px-4 py-2">
									اولویت:
								</Label>
								<SelectModule
									data={PaymentPriority}
									setValue={(value) =>
										setSearchAttribute((prev) => ({
											...prev,
											priority: value,
										}))
									}
									value={searchAttribute?.priority ?? []}
								/>
							</div>
							<div className="m-2 my-3 flex w-[32%] flex-col">
								<Label className="mb-2 w-fit rounded-2xl border bg-gray-100 px-4 py-2">
									وضعیت:
								</Label>
								<SelectModule
									data={PaymentOrderStates}
									setValue={(value) =>
										setSearchAttribute((prev) => ({
											...prev,
											status: value,
										}))
									}
									value={searchAttribute?.status ?? []}
								/>
							</div>{" "}
							<div className="m-2 my-3 flex w-[32%] flex-col">
								<Label className="mb-2 w-fit rounded-2xl border bg-gray-100 px-4 py-2">
									عنوان:
								</Label>
								<Input
									onChange={(event) =>
										setSearchAttribute((prev) => ({
											...prev,
											title: event?.target?.value,
										}))
									}
									value={searchAttribute?.title ?? ""}
								/>
							</div>
							<div className="m-2 my-3 flex w-[32%] flex-col">
								<Label className="mb-2 w-fit rounded-2xl border bg-gray-100 px-4 py-2">
									شماره درخواست:
								</Label>
								<Input
									type="number"
									onChange={(event) =>
										setSearchAttribute((prev) => ({
											...prev,
											caseNo: event?.target?.value,
										}))
									}
									value={searchAttribute?.caseNo ?? ""}
								/>
							</div>
						</div>
						<div className="my-2 flex justify-end">
							<Button
								variant="destructive"
								className="mx-1"
								disabled={loading || !searchAttribute}
								onClick={() => {
									setCurrentPage(0);
									setSearchAttribute({});
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
									getFinancialData();
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

			{isModal && instanceId && (
				<FinancialFilesModal
					isShow={isModal}
					setShow={setIsModal}
					instanceId={instanceId}
				/>
			)}

			{financialData?.length && !loading ? (
				<Table className="my-4 w-full">
					<TableHeader className="bg-gray-100 text-center">
						<TableRow>
							<TableHead className="text-center">ردیف</TableHead>
							<TableHead className="text-center">شماره درخواست</TableHead>
							<TableHead className="text-center">عنوان</TableHead>
							<TableHead className="text-center">مبلغ</TableHead>
							<TableHead className="text-center">درخواست دهنده</TableHead>
							<TableHead className="text-center">اولویت</TableHead>
							<TableHead className="text-center">تاریخ پرداخت</TableHead>
							<TableHead className="text-center">دسته بندی</TableHead>
							<TableHead className="text-center">وضعیت</TableHead>
							<TableHead className="text-center">
								توضیحات درخواست دهنده
							</TableHead>
							<TableHead className="text-center">توضیحات مدیر</TableHead>
							<TableHead className="text-center">توضیحات مالی</TableHead>
							<TableHead className="text-center">مدارک</TableHead>
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
							financialData?.map((data, index) => {
								const inspectionType = detectInspectionType(
									data.processDefinitionKey,
								);

								return (
									<TableRow key={data?.id}>
										<TableCell className="text-center">
											{currentPage * size + (index + 1)}
										</TableCell>
										<TableCell className="text-center">
											{data?.caseNo ?? "-"}
										</TableCell>
										<TableCell className="text-center">
											{data?.parameters?.Title ?? "-"}
										</TableCell>
										<TableCell className="text-center">
											{data?.parameters?.Amount && data?.parameters?.Currency
												? `${addCommas(data?.parameters?.Amount || "-")} ${
														currencies.find(
															(c) => c.value === data?.parameters?.Currency,
														)?.label || ""
													}`
												: "-"}
										</TableCell>
										<TableCell className="text-center">
											{data?.parameters?.UserData ?? "-"}
										</TableCell>
										<TableCell className="text-center">
											{data?.parameters?.Priority
												? PaymentPriority?.find(
														(p) =>
															p?.value === data?.parameters?.Priority || "",
													)?.label
												: "-"}
										</TableCell>
										<TableCell className="text-center">
											{data?.parameters?.PaymentDate ?? "-"}
										</TableCell>
										<TableCell className="text-center">
											{data?.parameters?.ProcessType
												? PaymentTyps?.find(
														(t) =>
															t?.value === data?.parameters?.ProcessType || "",
													)?.label
												: "-"}
										</TableCell>
										<TableCell className="text-center">
											{data?.currentState
												? data?.stateList?.find(
														(t) => t?.name === data?.currentState || "",
													)?.title
												: "-"}
										</TableCell>
										<TableCell className="text-center">
											<Popover>
												<PopoverTrigger className="max-w-[10rem] overflow-hidden text-ellipsis whitespace-nowrap transition-all hover:text-gray-500">
													{data?.parameters?.Description ?? "-"}
												</PopoverTrigger>
												<PopoverContent>
													{data?.parameters?.Description ?? "-"}
												</PopoverContent>
											</Popover>
										</TableCell>
										<TableCell className="text-center">
											<Popover>
												<PopoverTrigger className="max-w-[10rem] overflow-hidden text-ellipsis whitespace-nowrap transition-all hover:text-gray-500">
													{data?.parameters?.ReviewDes ?? "-"}
												</PopoverTrigger>
												<PopoverContent>
													{data?.parameters?.ReviewDes ?? "-"}
												</PopoverContent>
											</Popover>
										</TableCell>
										<TableCell className="text-center">
											<Popover>
												<PopoverTrigger className="max-w-[10rem] overflow-hidden text-ellipsis whitespace-nowrap transition-all hover:text-gray-500">
													{data?.parameters?.PayDes ?? "-"}
												</PopoverTrigger>
												<PopoverContent>
													{data?.parameters?.PayDes ?? "-"}
												</PopoverContent>
											</Popover>
										</TableCell>
										<TableCell className="text-center">
											<FaEye
												className="inline cursor-pointer transition-all hover:text-gray-500"
												onClick={() => {
													setIsModal(true);
													setInstanceId(data?.id);
												}}
											/>
										</TableCell>
									</TableRow>
								);
							})
						)}
					</TableBody>
				</Table>
			) : (
				<Table className="my-4 w-full">
					<TableHeader className="bg-gray-100 text-center">
						<TableRow>
							<TableHead className="text-center">ردیف</TableHead>
							<TableHead className="text-center">شماره درخواست</TableHead>
							<TableHead className="text-center">عنوان</TableHead>
							<TableHead className="text-center">مبلغ</TableHead>
							<TableHead className="text-center">درخواست دهنده</TableHead>
							<TableHead className="text-center">اولویت</TableHead>
							<TableHead className="text-center">تاریخ پرداخت</TableHead>
							<TableHead className="text-center">دسته بندی</TableHead>
							<TableHead className="text-center">وضعیت</TableHead>
							<TableHead className="text-center">
								توضیحات درخواست دهنده
							</TableHead>
							<TableHead className="text-center">توضیحات مدیر</TableHead>
							<TableHead className="text-center">توضیحات مالی</TableHead>
							<TableHead className="text-center">مدارک</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						<TableRow>
							<TableCell colSpan={10}>اطلاعاتی یافت نشد...</TableCell>
						</TableRow>
					</TableBody>
				</Table>
			)}

			{financialData?.length ? (
				<div className="my-4">
					<Pagination
						items={items}
						currentPage={currentPage}
						size={size}
						onPageChange={setCurrentPage}
						loading={loading}
						setSize={setSize}
					/>
				</div>
			) : (
				""
			)}
		</div>
	);
}
