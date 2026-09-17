"use client";

import moment from "jalali-moment";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import getSubContractorFile from "@/api/subContractors/getSubContractorFile";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Loading } from "@/ui/Loader";

import { SearchAttributeProps, SubcontractorsTypes } from "./page";

interface SubcontractorsProps {
	subcontractorsData: SubcontractorsTypes[];
	loading: boolean;
	setSearch: (s: any) => void;
	getData: () => void;
	setLoading: (s: boolean) => void;
}
export function SubContractors({
	subcontractorsData,
	loading,
	setSearch,
	getData,
	setLoading,
}: SubcontractorsProps) {
	const [searchAttribute, setSearchAttribute] =
		useState<SearchAttributeProps>();
	const [previewLoading, setPreviewLoading] = useState<string | null>(null);

	useEffect(() => {
		const delayDebounceFn = setTimeout(() => {
			if (searchAttribute) {
				setSearch(searchAttribute);
			}
		}, 700);

		return () => clearTimeout(delayDebounceFn);
	}, [searchAttribute]);

	const showIntermediateControl = async (fileId: string) => {
		try {
			setPreviewLoading(fileId);
			const res = await getSubContractorFile({ fileId });
			if (res) {
				window.open(URL.createObjectURL(res), "_blank");
			} else {
				toast.info("فایل پیوست اضافه نشده است!");
			}
		} catch (error) {
			toast.error("خطا در دریافت فایل پیوست، مجدد تلاش کنید!");
		} finally {
			setPreviewLoading(null);
		}
	};

	return (
		<>
			<Table className="block overflow-x-auto lg:table">
				<TableHeader>
					<TableRow className="select-none bg-gray-100 text-right">
						<TableHead className="text-right text-black">ردیف</TableHead>
						<TableHead className="text-right text-black">
							<input
								key={`input[name]`}
								className="max-w-[10rem] bg-transparent placeholder-black outline-0 focus:text-blue-500 focus:placeholder-blue-500"
								placeholder={"🔎︎ " + "نام"}
								onChange={(event) =>
									setSearchAttribute((prev) => ({
										...prev,
										name: event.target.value,
									}))
								}
								value={searchAttribute?.name}
							/>
						</TableHead>

						<TableHead className="text-right text-black">
							مدرک تایید صلاحیت
						</TableHead>
						<TableHead className="text-right text-black">
							دلیل واگذاری
						</TableHead>

						<TableHead className="text-right text-black">
							تاریخ ارزیابی
						</TableHead>
						<TableHead className="text-right text-black">
							تاریخ ارزیابی بعدی
						</TableHead>
					</TableRow>
				</TableHeader>

				<TableBody className="text-[13px]">
					{loading ? (
						<TableRow>
							<TableCell>
								<Loading size={"sm"}>در حال بارگزاری...</Loading>
							</TableCell>
						</TableRow>
					) : subcontractorsData?.length ? (
						subcontractorsData.map((subcontractor, index: number) => (
							<TableRow
								className={`h-14 align-baseline`}
								key={subcontractor.id}
							>
								<TableCell>{index + 1}</TableCell>

								<TableCell className={`overflow-hidden`}>
									{subcontractor?.name ? subcontractor.name : "-"}
								</TableCell>
								<TableCell>
									{previewLoading === subcontractor.id ? (
										<Loading size={"sm"} />
									) : (
										<button
											onClick={() => showIntermediateControl(subcontractor.id)}
										>
											مشاهده
										</button>
									)}
								</TableCell>
								<TableCell>
									{subcontractor?.reasonAssignment
										? subcontractor.reasonAssignment
										: "-"}
								</TableCell>

								<TableCell>
									{subcontractor?.evaluationDate
										? getDatesIngregorian(subcontractor.evaluationDate)
										: "-"}
								</TableCell>

								<TableCell>
									{subcontractor?.nextEvaluationDate
										? getDatesIngregorian(subcontractor.nextEvaluationDate)
										: "-"}
								</TableCell>
							</TableRow>
						))
					) : (
						""
					)}
					{!loading &&
						(!subcontractorsData || subcontractorsData?.length === 0) && (
							<TableRow>
								<TableCell colSpan={100}>موردی یافت نشد...</TableCell>
							</TableRow>
						)}
				</TableBody>
			</Table>
		</>
	);
}

export function getDatesIngregorian(date: string): string {
	return moment(date, "YYYY-MM-DD").locale("fa").format("jYYYY/jMM/jDD");
}
