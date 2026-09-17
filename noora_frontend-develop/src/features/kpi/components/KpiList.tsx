"use client";

import moment from "jalali-moment";
import dynamic from "next/dynamic";
import { useCallback } from "react";
import { FaPenToSquare, FaTrash, FaUserPlus } from "react-icons/fa6";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardNav,
	CardTitle,
} from "@/components/ui/card";
import { DeleteDialog } from "@/components/ui/dialog/delete-dialog";
import { useDialogs } from "@/components/ui/dialog/use-dialogs";
import { Numeric } from "@/components/ui/numeric";
import { usePagination } from "@/components/ui/pagination/usePagination";
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
import { getUserFullname } from "@/identity/users/utils/getUserFullname";
import { asNavigationProp } from "@/utils/asNavigationProp";

import { kpiTargetMetrics } from "../enums/KpiTargetMetric";
import { KpiApi } from "../models/Kpi";
import { deleteKpi } from "../services/deleteKpi";
import { getKpi } from "../services/getKpi";
import { timeFrames } from "../utils/TimeFrames";

const KpiUpsertDialog = dynamic(
	() => import("@/kpi/components/KpiUpsertDialog"),
);

const KpiList = () => {
	const dialogs = useDialogs();

	// data
	const fetchData = useCallback(async (page: number, pageSize: number) => {
		const kpiList = await getKpi({
			pagination: { page, pageSize },
			populate: ["userId", "groupId"],
			sort: { createdAt: "desc" },
		});

		return [kpiList.items, kpiList.total] as const;
	}, []);

	const { items, isLoading, offset, Pagination, refetch } =
		usePagination(fetchData);

	const handleKpiAddDialogOpen = useCallback(async () => {
		const result = await dialogs.open(KpiUpsertDialog, {});

		if (result) {
			refetch();
		}
	}, [dialogs, refetch]);

	const handleKpiUpdateDialogOpen = useCallback(
		async (kpi: KpiApi) => {
			const result = await dialogs.open(KpiUpsertDialog, {
				item: kpi,
			});

			if (result) {
				refetch();
			}
		},
		[dialogs, refetch],
	);

	const handleDeleteDialogOpen = useCallback(
		async (kpi: KpiApi) => {
			const result = await dialogs.open(DeleteDialog, {
				title: kpi.title,
				onSubmit: async () => {
					await deleteKpi(kpi.id);
					toast.success("شاخص عملکرد با موفقیت حذف شد.");
				},
				onError: () => {
					toast.error("خطای نامشخصی در هنگام حذف شاخص عملکرد رخ داد.");
				},
			});

			if (result) {
				refetch();
			}
		},
		[dialogs, refetch],
	);

	return (
		<div className="col-span-full">
			<Card>
				<CardHeader orientation="horizontal">
					<CardTitle>لیست شاخص عملکرد</CardTitle>

					<CardNav>
						<Button variant="primary" onClick={handleKpiAddDialogOpen}>
							<FaUserPlus />
							<span>افزودن شاخص عملکرد</span>
						</Button>
					</CardNav>
				</CardHeader>

				<CardContent className="px-0">
					<Table
						loading={isLoading}
						pagination={<Pagination />}
						slotProps={{
							root: { className: "rounded-none border-x-0" },
						}}
					>
						<TableHeader>
							<TableRow>
								<TableHead className="w-20">#</TableHead>
								<TableHead className="w-48">عنوان</TableHead>
								<TableHead className="w-64">کاربر یا گروه</TableHead>
								<TableHead className="w-64">نوع درخواست</TableHead>
								<TableHead className="w-48">بازه زمانی</TableHead>
								<TableHead className="w-48">مقدار مورد انتظار</TableHead>
								<TableHead className="w-32">تاریخ شروع</TableHead>
								<TableHead className="w-32">تاریخ پایان</TableHead>
								<TableHead className="w-24">عملیات</TableHead>
							</TableRow>
						</TableHeader>

						<TableBody>
							{items?.length ? (
								items.map((item, index) => (
									<TableRow key={item.id} className="whitespace-nowrap">
										<TableCell>
											<Numeric value={offset + index + 1} />
										</TableCell>

										<TableCell>{item.title}</TableCell>

										<TableCell>
											{item.userId ? (
												<>
													{getUserFullname(asNavigationProp(item.userId))}&nbsp;
													{item.position === "coordinator"
														? "- هماهنگ کننده"
														: "- بازاریاب"}
												</>
											) : (
												<>{asNavigationProp(item.groupId)?.title}</>
											)}
										</TableCell>

										<TableCell>{item.processKeys.join(", ")}</TableCell>

										<TableCell>
											{timeFrames.find(
												([_, value]) => value === item.timeFrame,
											)?.[0] ?? "نامشخص"}
										</TableCell>

										<TableCell>
											<div className="flex flex-col">
												{item.targets.map((target) => (
													<div
														key={target.metric}
														className="flex items-center gap-1"
													>
														<span>
															{kpiTargetMetrics[target.metric]?.title}:
														</span>
														<span>{target.value}</span>
													</div>
												))}
											</div>
										</TableCell>

										<TableCell>
											{moment(item.startDate).format("jYYYY/jMM/jDD")}
										</TableCell>

										<TableCell>
											{moment(item.endDate).format("jYYYY/jMM/jDD")}
										</TableCell>

										<TableCell>
											<TooltipProvider>
												<TableActions>
													<Tooltip>
														<TableAction>
															<TooltipTrigger asChild>
																<Button
																	className="size-full"
																	size="icon"
																	variant="link"
																	onClick={() =>
																		handleKpiUpdateDialogOpen(item)
																	}
																>
																	<FaPenToSquare />
																</Button>
															</TooltipTrigger>
															<TooltipContent>ویرایش</TooltipContent>
														</TableAction>
													</Tooltip>

													<Tooltip>
														<TableAction>
															<TooltipTrigger asChild>
																<Button
																	className="size-full"
																	size="icon"
																	variant="link"
																	onClick={() => {
																		handleDeleteDialogOpen(item);
																	}}
																>
																	<FaTrash />
																</Button>
															</TooltipTrigger>
															<TooltipContent>حذف</TooltipContent>
														</TableAction>
													</Tooltip>
												</TableActions>
											</TooltipProvider>
										</TableCell>
									</TableRow>
								))
							) : (
								<TableRow>
									<TableCell colSpan={100}>هیچ موردی یافت نشد.</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	);
};

export { KpiList };
