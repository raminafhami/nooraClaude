"use client";

import Link from "next/link";

import { Panel } from "@/ui/Panel";
import { Table } from "@/ui/Table";

import { ActivityRow } from "./api";

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
						<Table.Cell as="th">عنوان</Table.Cell>
						<Table.Cell as="th">شرح</Table.Cell>
						<Table.Cell as="th">مبدأ</Table.Cell>
						<Table.Cell as="th">ماژول</Table.Cell>
						<Table.Cell as="th">رکورد</Table.Cell>
						<Table.Cell as="th">شروع</Table.Cell>
						<Table.Cell as="th">پایان</Table.Cell>
						<Table.Cell as="th">مدت</Table.Cell>
						<Table.Cell as="th">همکاران</Table.Cell>
						<Table.Cell as="th">وضعیت</Table.Cell>
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
								<Table.Cell>{row.title}</Table.Cell>
								<Table.Cell>{row.description || "-"}</Table.Cell>
								<Table.Cell>{row.originLabel}</Table.Cell>
								<Table.Cell>{row.sourceModuleLabel}</Table.Cell>
								<Table.Cell>
									{row.sourceLink ? (
										<Link className="text-primary underline" href={row.sourceLink}>
											{row.relatedLabel || "مشاهده"}
										</Link>
									) : (
										row.relatedLabel || "-"
									)}
								</Table.Cell>
								<Table.Cell>{row.startTime || "-"}</Table.Cell>
								<Table.Cell>{row.endTime || "-"}</Table.Cell>
								<Table.Cell>{row.durationLabel || "-"}</Table.Cell>
								<Table.Cell>
									{row.colleagues.length
										? row.colleagues.map((item) => item.fullName).join("، ")
										: "-"}
								</Table.Cell>
								<Table.Cell>{row.statusLabel}</Table.Cell>
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
