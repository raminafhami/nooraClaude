import moment from "moment-jalaali";
import React, { useEffect, useState } from "react";
import { CgClose } from "react-icons/cg";

import { personnelRequestStatusType } from "@/hrm/personnelRequests/models/personnelRequestStatusType";
import {
  PersonnelRequestType,
  personnelRequestType,
} from "@/hrm/personnelRequests/models/personnelRequestType";
import { deleteRequest } from "@/hrm/personnelRequests/services/deleteRequest";
import { MyRequests } from "@/hrm/personnelRequests/services/getMyRequests";
import { cn } from "@/lib/utils";
import { getTimeString } from "@/time/getTimeString";
import { Loading } from "@/ui/Loader";
import { Panel } from "@/ui/Panel";
import { Table } from "@/ui/Table";

function ProfileAttendanceRequestTable({
	requests,
	loading,
	onRequestsAction,
	error,
}: {
	error: boolean;
	onRequestsAction: () => void;
	loading: boolean;
	requests: MyRequests[];
}) {
	const [filteredRequests, setFilteredRequests] = useState<MyRequests[]>([]);

	useEffect(() => {
		const filteredRequests = requests.filter((request) => {
			if (request.type === PersonnelRequestType.extra) {
				return request.description;
			}
			return true;
		});
		setFilteredRequests(filteredRequests);
	}, [requests]);

	const [actionLoading, setActionLading] = useState<string[]>([]);
	const [isError, setIsError] = useState(false);

	const actionHandler = async (request: MyRequests) => {
		setActionLading((prev) => [...prev, request.id]);
		await deleteRequest(request.id)
			.then(() => {
				onRequestsAction();
				setIsError(false);
			})
			.catch(() => {
				setIsError(true);
			})
			.finally(() => {
				setActionLading((prev) => prev.filter((id) => id !== request.id));
			});
	};
	return (
		<>
			{/* <div className="h-[22rem] overflow-y-auto w-full"> */}
			<Panel.Root className="scrollbar-thin scrollbar-thumb-gray-100 scrollbar-thumb-rounded-lg h-fit overflow-auto">
				<Table.Root>
					<Table.Head>
						<Table.Row key="header" className="bg-gray-100 text-right">
							<Table.Cell as="th" className="w-16"></Table.Cell>
							<Table.Cell as="th" className="w-16">
								ردیف
							</Table.Cell>
							<Table.Cell as="th" className="w-32">
								نوع درخواست
							</Table.Cell>
							<Table.Cell as="th" className="w-56">
								بازه درخواست
							</Table.Cell>
							<Table.Cell as="th" className="w-36">
								وضعیت
							</Table.Cell>
							<Table.Cell as="th">توضیحات</Table.Cell>
							<Table.Cell as="th">جانشین</Table.Cell>
						</Table.Row>
					</Table.Head>
					<Table.Body>
						{loading ? (
							<Table.Row key="loading">
								<Table.Cell colSpan={100}>
									<Loading size="sm">در حال دریافت اطلاعات...</Loading>
								</Table.Cell>
							</Table.Row>
						) : error ? (
							<Table.Row key="error">
								<Table.Cell colSpan={100}>خطایی رخ داده‌است.</Table.Cell>
							</Table.Row>
						) : filteredRequests.length === 0 ? (
							<Table.Row key="empty">
								<Table.Cell colSpan={100}>درخواستی ثبت نشده است</Table.Cell>
							</Table.Row>
						) : (
							filteredRequests?.map((request, index) => (
								<Table.Row key={`attendance-table ${request?.id} `}>
									<Table.Cell>
										<Table.Actions>
											{request.status !== "counted" &&
												request.status !== "rejected" &&
												request.type !== PersonnelRequestType.extra && (
													<>
														{!actionLoading.find((id) => id == request.id) && (
															<>
																<Table.Action className="hover:text-red-500">
																	<CgClose
																		onClick={() => actionHandler(request)}
																	/>
																</Table.Action>
															</>
														)}
														{actionLoading.find((id) => id == request.id) && (
															<Table.Action className="flex gap-2 ps-2">
																<Loading size="sm" />
															</Table.Action>
														)}
													</>
												)}
										</Table.Actions>
									</Table.Cell>
									<Table.Cell className="text-center">{index + 1}</Table.Cell>
									<Table.Cell>{personnelRequestType[request.type]}</Table.Cell>
									{(request.type === PersonnelRequestType.hourlyLeave ||
										request.type === PersonnelRequestType.hourlyMission ||
										request.type === PersonnelRequestType.extra) && (
										<>
											<Table.Cell>
												<div className="flex w-56 gap-2">
													<span>
														{moment(request.dateFrom, "YYYY-MM-DD")
															.locale("en")
															.format("jYYYY/jMM/jDD")}{" "}
														,
													</span>
													<span>
														{getTimeString(request.timeFrom, false)} تا{" "}
														{getTimeString(request.timeTo, false)}
													</span>
												</div>
											</Table.Cell>
										</>
									)}
									{(request.type === PersonnelRequestType.dailyLeave ||
										request.type === PersonnelRequestType.dailyMission) && (
										<Table.Cell>
											<div className="flex w-56 gap-2">
												<span className="flex gap-2">
													{moment(request.dateFrom, "YYYY-MM-DD")
														.locale("en")
														.format("jYYYY/jMM/jDD")}
												</span>
												<span>تا </span>
												<span>
													{moment(request.dateTo, "YYYY-MM-DD")
														.locale("en")
														.format("jYYYY/jMM/jDD")}{" "}
												</span>
											</div>
										</Table.Cell>
									)}
									<Table.Cell>
										<span
											className={cn(
												"inline-block min-w-fit rounded-2xl px-2 py-[0.2rem]",
												request.status === "rejected" &&
													"bg-red-300/10 text-red-600",
												request.status === "counted" &&
													"bg-blue-300/10 text-blue-600",
												request.status === "waitingConfirmation" &&
													"bg-yellow-300/10 text-yellow-600",
												// request.status === "pendingForManager" &&
												//   "text-green-500",
												// request.status === "pendingForSubstitute" &&
												//   "text-yellow-500"
											)}
										>
											{personnelRequestStatusType[request.status]}
										</span>
									</Table.Cell>
									<Table.Cell>
										{request.type === PersonnelRequestType.dailyLeave ||
										request.type === PersonnelRequestType.hourlyLeave
											? "-"
											: request?.description}
									</Table.Cell>
									<Table.Cell>
										{request.type === PersonnelRequestType.dailyLeave
											? request.substitute
											: "-"}
									</Table.Cell>
								</Table.Row>
							))
						)}
					</Table.Body>
				</Table.Root>
			</Panel.Root>
			{/* </div> */}
		</>
	);
}

export default ProfileAttendanceRequestTable;
