"use client";

import Link from "next/link";

import { DeadlineProgressBar } from "@/components/ui/deadline-progressbar";
import { Panel } from "@/ui/Panel";
import { Table } from "@/ui/Table";

import { ActivityRow } from "./api";

function remainingColors(percentageRemaining: number) {
	if (percentageRemaining <= 0) {
		return {
			bgColor: "bg-red-300",
			textColor: "text-red-400",
			progressColor: "bg-red-400",
		};
	}
	if (percentageRemaining < 60) {
		return {
			bgColor: "bg-gray-200",
			textColor: "text-yellow-400",
			progressColor: "bg-[#fffdb2]",
		};
	}
	return {
		bgColor: "bg-gray-200",
		textColor: "text-green-400",
		progressColor: "bg-green-200",
	};
}

function ActivityRowsTable({
	rows,
	onEdit,
}: {
	rows: ActivityRow[];
	onEdit?: (row: ActivityRow) => void;
}) {
	return (
		<Panel.Root>
			<Table.Root>
				<Table.Head>
					<Table.Row className="bg-gray-100 text-right">
						<Table.Cell as="th" className="w-12">
							ردیف
						</Table.Cell>
						<Table.Cell as="th">مبدأ</Table.Cell>
						<Table.Cell as="th">شماره درخواست</Table.Cell>
						<Table.Cell as="th">نوع درخواست</Table.Cell>
						<Table.Cell as="th">کارهای در حال اجرا</Table.Cell>
						<Table.Cell as="th">اطلاعات تکمیلی</Table.Cell>
						<Table.Cell as="th">وضعیت</Table.Cell>
						<Table.Cell as="th">زمان باقی مانده</Table.Cell>
						<Table.Cell as="th">زمان شروع</Table.Cell>
						<Table.Cell as="th">آخرین بروزرسانی</Table.Cell>
						<Table.Cell as="th">مدت</Table.Cell>
						<Table.Cell as="th">دلیل</Table.Cell>
						{onEdit && <Table.Cell as="th"></Table.Cell>}
					</Table.Row>
				</Table.Head>
				<Table.Body>
					{rows.length === 0 ? (
						<Table.Row>
							<Table.Cell colSpan={100}>
								برای این روز فعالیتی در تاریخچه یا ثبت دستی نیست.
							</Table.Cell>
						</Table.Row>
					) : (
						rows.map((row, index) => (
							<Table.Row key={row.id}>
								<Table.Cell>{index + 1}</Table.Cell>
								<Table.Cell>{row.originLabel}</Table.Cell>
								<Table.Cell>
									{row.sourceLink ? (
										<Link className="text-primary underline" href={row.sourceLink}>
											{row.caseNo || row.relatedLabel || "مشاهده"}
										</Link>
									) : (
										row.caseNo || row.relatedLabel || "-"
									)}
								</Table.Cell>
								<Table.Cell>
									{row.origin === "manual" ? row.title : row.processName || row.title}
								</Table.Cell>
								<Table.Cell>{row.runningTasks || "-"}</Table.Cell>
								<Table.Cell>{row.extraInfo || row.description || "-"}</Table.Cell>
								<Table.Cell>{row.statusLabel}</Table.Cell>
								<Table.Cell>
									{row.remaining ? (
										<DeadlineProgressBar
											className="w-24"
											timeStarted={row.remaining.timeActivated}
											deadLine={row.remaining.deadline}
											colors={remainingColors}
										/>
									) : (
										"-"
									)}
								</Table.Cell>
								<Table.Cell>{row.startedLabel || row.startTime || "-"}</Table.Cell>
								<Table.Cell>{row.updatedLabel || "-"}</Table.Cell>
								<Table.Cell>{row.durationLabel || "-"}</Table.Cell>
								<Table.Cell>
									{row.incompleteReason || "-"}
									{row.changeHistory?.length ? (
										<details className="mt-1 text-xs text-muted-foreground">
											<summary>تاریخچه تغییرات</summary>
											<ul className="mt-1 space-y-1">
												{row.changeHistory.map((change, changeIndex) => (
													<li key={changeIndex}>
														{change.byName}:{" "}
														{change.summary ||
															Object.keys(change.changes || {}).join("، ")}
													</li>
												))}
											</ul>
										</details>
									) : null}
								</Table.Cell>
								{onEdit && (
									<Table.Cell>
										{row.origin === "manual" && (
											<button
												className="text-primary"
												type="button"
												onClick={() => onEdit(row)}
											>
												ویرایش
											</button>
										)}
									</Table.Cell>
								)}
							</Table.Row>
						))
					)}
				</Table.Body>
			</Table.Root>
		</Panel.Root>
	);
}

export { ActivityRowsTable };
