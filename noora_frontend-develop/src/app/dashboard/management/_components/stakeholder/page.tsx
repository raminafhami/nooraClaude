"use client";

import { useEffect, useState } from "react";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { FaCalendarAlt } from "react-icons/fa";
import DatePicker from "react-multi-date-picker";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Pagination from "@/components/ui/pagination/Pagination";
import { Cost } from "@/financial/costs/models/Cost";
import { getCosts } from "@/financial/costs/services/getCosts";
import { Layout } from "@/ui/Layout";

import { Stakeholder } from "./_components/Stakeholder";
import FindUser from "./modules/FindUser";
import SelectModule from "./modules/SelectModule";
import {
	CostCaseStatusType,
	CostOrderCaseStatusType,
	InstanceStatusTypes,
} from "./modules/StakeHolderStatusTypes";

interface SearchAttributeProps {
	status?: { value: string; label: string }[] | [];
	caseStatus?: { value: string; label: string }[] | [];
	fileStatus?: { value: string; label: string }[] | [];
	fromDate?: Date;
	toDate?: Date;
}

export default function StakeholderPage() {
	const [items, setItems] = useState<number>();
	const [currentPage, setCurrentPage] = useState<number>(0);
	const [size, setSize] = useState<number>(10);
	const [loading, setLoading] = useState<boolean>(false);
	const [searchAttribute, setSearchAttribute] =
		useState<SearchAttributeProps>();
	const [user, setUser] = useState<any>();
	const [open, setOpen] = useState(false);
	const [data, setData] = useState<Cost[]>();

	useEffect(() => {
		if (user) getCostsList();
		else setData(undefined);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentPage, user, searchAttribute, size]);

	async function getCostsList() {
		setLoading(true);
		try {
			const status = searchAttribute?.status
				? searchAttribute?.status
				: undefined;

			const caseStatus = searchAttribute?.caseStatus
				? searchAttribute?.caseStatus
				: undefined;
			const fileStatus = searchAttribute?.fileStatus
				? searchAttribute?.fileStatus
				: undefined;

			const instance: any = {};

			// Handle date filtering
			if (searchAttribute?.fromDate || searchAttribute?.toDate) {
				instance["createdAt"] = {};
				if (searchAttribute?.fromDate) {
					instance["createdAt"].$gte = new Date(searchAttribute.fromDate);
				}
				if (searchAttribute?.toDate) {
					instance["createdAt"].$lte = new Date(searchAttribute.toDate);
				}
			}

			let res = await getCosts({
				filters: {
					personId: user?.id,
					status: status?.length
						? {
								$in: status?.flatMap((item) =>
									item.value === "undefined"
										? CostOrderCaseStatusType?.flatMap((i) => i?.value)
										: item.value,
								),
							}
						: undefined,
					"instance.invoicePaymentStatus": caseStatus?.length
						? {
								$in: caseStatus?.flatMap((item) =>
									item.value === "undefined"
										? CostCaseStatusType?.flatMap((i) => i?.value)
										: item.value,
								),
							}
						: undefined,
					"instance.status": fileStatus?.length
						? {
								$in: fileStatus?.flatMap((item) =>
									item.value === "undefined"
										? InstanceStatusTypes?.flatMap((i) => i?.value)
										: item.value,
								),
							}
						: undefined,
					$and: [
						searchAttribute?.fromDate
							? {
									"instance.createdAt": {
										$gte: `$date'${searchAttribute.fromDate.toISOString()}'`,
									},
								}
							: undefined,
						searchAttribute?.toDate
							? {
									"instance.createdAt": {
										$lte: `$date'${searchAttribute.toDate.toISOString()}'`,
									},
								}
							: undefined,
						{ total: { $exists: true } },
						{ total: { $ne: null } },
						{ total: { $ne: "0" } },
					].filter(Boolean),
				},
				pagination: {
					page: currentPage,
					pageSize: size,
				},
				populate: ["instance"],
			});

			if (res) {
				setTimeout(() => {
					setData(res?.items);
					setItems(res?.total);
					setLoading(false);
				}, 300);
			}
		} catch (err) {
			console.error(err);
			toast.error("خطایی رخ داد!");
			setLoading(false);
		}
	}

	return (
		<>
			<Layout.Root>
				<Layout.Head title="ذینفع ها"></Layout.Head>
				<Layout.Content>
					<div className="mx-2 flex items-center">
						<div className="flex flex-col">
							<Label className="mb-2">انتخاب کاربر</Label>
							<FindUser
								setUser={setUser}
								user={user}
								open={open}
								setOpen={setOpen}
							/>
						</div>
					</div>
					{data && (
						<div className="flex w-full items-center rounded-2xl bg-gray-100 p-4">
							<div className="mx-2 my-2 flex min-w-[158px] flex-col">
								<Label className="mb-2"> بر اساس پرداختی ذینفع</Label>
								<SelectModule
									data={CostOrderCaseStatusType}
									setValue={(value) =>
										setSearchAttribute((prev) => ({
											...prev,
											status: value,
										}))
									}
									value={searchAttribute?.status ?? []}
								/>
							</div>

							<div className="mx-2 my-2 flex min-w-[158px] flex-col">
								<Label className="mb-2"> بر اساس پرداختی فایل</Label>
								<SelectModule
									data={CostCaseStatusType}
									setValue={(value) =>
										setSearchAttribute((prev) => ({
											...prev,
											caseStatus: value,
										}))
									}
									value={searchAttribute?.caseStatus ?? []}
								/>
							</div>

							<div className="mx-2 my-2 flex min-w-[158px] flex-col">
								<Label className="mb-2"> بر اساس وضعیت فرایند</Label>
								<SelectModule
									data={InstanceStatusTypes}
									setValue={(value) =>
										setSearchAttribute((prev) => ({
											...prev,
											fileStatus: value,
										}))
									}
									value={searchAttribute?.fileStatus ?? []}
								/>
							</div>

							<div className="mx-2 my-3 flex flex-col">
								<Label className="mb-1 w-fit rounded-2xl bg-gray-100">
									از تاریخ
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
										<div className="w group flex rounded-2xl border border-gray-200 bg-white">
											<div
												className="flex shrink-0 basis-10 cursor-pointer items-center justify-center rounded-s-2xl border-e border-gray-200 group-aria-disabled:cursor-not-allowed group-aria-disabled:bg-gray-50"
												onClick={openCalendar}
											>
												<FaCalendarAlt />
											</div>
											<input
												className="h-10 w-[158px] rounded-e-2xl border-none px-3 text-start leading-4 focus:outline-none focus:ring-0 focus:ring-offset-0 disabled:bg-gray-50 group-aria-disabled:cursor-not-allowed"
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

							<div className="mx-8 my-3 flex flex-col">
								<Label className="mb-1 w-fit rounded-2xl bg-gray-100">
									تا تاریخ
								</Label>
								<DatePicker
									calendar={persian}
									locale={persian_fa}
									inputClass={` text-[.9rem] mb-[1rem] mt-[1rem] pl-[2.8rem] pr-[.5rem] border-white border-2 bg-white rounded-2xl group relative text-ellipsis focus:border-blue-500 placeholder-gray-400 focus:text-black py-2 focus:outline-0`}
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
												className="h-10 w-[158px] rounded-e-2xl border-none px-3 text-start leading-4 focus:outline-none focus:ring-0 focus:ring-offset-0 disabled:bg-gray-50 group-aria-disabled:cursor-not-allowed"
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

							{searchAttribute?.status ||
							searchAttribute?.fileStatus ||
							searchAttribute?.caseStatus ||
							searchAttribute?.fromDate ||
							searchAttribute?.toDate ? (
								<Button
									onClick={() => setSearchAttribute({})}
									className="self-end"
									variant="destructive"
								>
									حذف همه فیلترها
								</Button>
							) : (
								""
							)}
						</div>
					)}

					<Stakeholder
						user={user}
						loading={loading}
						costs={data}
						getData={getCostsList}
						setLoading={setLoading}
						pagination={
							<Pagination
								items={items ? items : 0}
								currentPage={currentPage}
								size={size}
								onPageChange={setCurrentPage}
								loading={loading}
								setSize={setSize}
							/>
						}
					/>
				</Layout.Content>
			</Layout.Root>
		</>
	);
}
