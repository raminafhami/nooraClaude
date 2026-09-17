"use client";

import { DeadlineProgressBar } from "@/components/ui/deadline-progressbar";
import { Loading } from "@/ui/Loader";
import { Panel } from "@/ui/Panel";
import { Table } from "@/ui/Table";

import { ApplicationProvider } from "./ApplicationContext";
import { ApplicationItemDate } from "./ApplicationItemDate";
import { ApplicationItemMore } from "./ApplicationItemMore";
import { ApplicationItemProcess } from "./ApplicationItemProcess";
import { ApplicationItemTasks } from "./ApplicationItemTasks";
import { ApplicationsTableActions } from "./ApplicationsTableActions";
import { Application } from "./models/Application";
import { ApplicationQuery } from "./models/ApplicationQuery";

function getDeadlineProgressBarColors(percentageRemaining: number) {
	let progressColor = "bg-green-200";
	let bgColor = "bg-gray-200";
	let textColor = "text-green-400";

	if (percentageRemaining <= 0) {
		bgColor = "bg-red-300";
		textColor = "text-red-400";
		progressColor = "bg-red-400";
	} else if (percentageRemaining < 60) {
		progressColor = "bg-[#fffdb2]";
		textColor = "text-yellow-400";
	}

	return { bgColor, progressColor, textColor };
}

function ApplicationsTable({
	error,
	loading,
	offset,
	applications,
}: {
	error: string | null;
	loading: boolean;
	offset: number;
	applications: Application[];
}) {
	return (
		<Panel.Root>
			<Table.Root>
				<Table.Head>
					<Table.Row className="bg-gray-100 text-right">
						<Table.Cell as="th" className="w-16"></Table.Cell>
						<Table.Cell as="th" className="w-16">
							ردیف
						</Table.Cell>
						<Table.Cell as="th" className="w-36">
							شماره درخواست
						</Table.Cell>
						<Table.Cell as="th" className="w-72">
							نوع درخواست
						</Table.Cell>
						<Table.Cell as="th">کارهای در حال اجرا</Table.Cell>
						<Table.Cell as="th" className="w-72">
							اطلاعات تکمیلی
						</Table.Cell>
						<Table.Cell as="th" className="w-44">
							وضعیت
						</Table.Cell>
						<Table.Cell as="th" className="w-40">
							زمان باقی مانده
						</Table.Cell>
						<Table.Cell as="th" className="w-40">
							زمان شروع
						</Table.Cell>
						<Table.Cell as="th" className="w-40">
							آخرین بروزرسانی
						</Table.Cell>
					</Table.Row>
				</Table.Head>
				<Table.Body>
					{loading ? (
						<Table.Row key="loading">
							<Table.Cell></Table.Cell>
							<Table.Cell colSpan={100}>
								<Loading size="sm">در حال دریافت اطلاعات...</Loading>
							</Table.Cell>
						</Table.Row>
					) : error ? (
						<Table.Row key="error">
							<Table.Cell></Table.Cell>
							<Table.Cell colSpan={100}>{error}</Table.Cell>
						</Table.Row>
					) : (
						applications.map((application, index) => (
							<ApplicationProvider
								application={application}
								key={application.instance.id}
							>
								<Table.Row key={application.instance.id}>
									<Table.Cell>
										<ApplicationsTableActions key={application.instance.id} />
									</Table.Cell>
									<Table.Cell>{offset + index + 1}</Table.Cell>
									<Table.Cell>{application.instance.caseNo}</Table.Cell>
									<Table.Cell>
										<ApplicationItemProcess instance={application.instance} />
									</Table.Cell>
									<Table.Cell>
										<ApplicationItemTasks tasks={application.tasks} />
									</Table.Cell>
									<Table.Cell>
										<ApplicationItemMore instance={application.instance} />
									</Table.Cell>
									<Table.Cell>
										{application.instance.phase?.title || "-"}
									</Table.Cell>
									<Table.Cell>
										{application.instance.timeActivated &&
										application.instance.maxPossibleDuration ? (
											<DeadlineProgressBar
												className="w-24"
												timeStarted={application.instance.timeActivated}
												deadLine={application.instance.maxPossibleDuration}
												colors={getDeadlineProgressBarColors}
											/>
										) : (
											"-"
										)}
									</Table.Cell>
									<Table.Cell>
										<ApplicationItemDate date={application.instance.createAt} />
									</Table.Cell>
									<Table.Cell>
										<ApplicationItemDate date={application.instance.updateAt} />
									</Table.Cell>
								</Table.Row>
							</ApplicationProvider>
						))
					)}
				</Table.Body>
			</Table.Root>
		</Panel.Root>
	);
}

export { ApplicationsTable };
