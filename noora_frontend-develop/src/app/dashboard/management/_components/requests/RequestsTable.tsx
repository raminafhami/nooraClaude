import moment from "moment-jalaali";
import React, { useEffect, useState } from "react";
import { CgClose } from "react-icons/cg";
import { FaCheck, FaTrash } from "react-icons/fa";

import Pagination from "@/components/ui/pagination/Pagination";
import {
	PersonnelRequestStatusType,
	personnelRequestStatusType,
} from "@/hrm/personnelRequests/models/personnelRequestStatusType";
import {
	PersonnelRequestType,
	personnelRequestType,
} from "@/hrm/personnelRequests/models/personnelRequestType";
import {
	getPersonnelRequests,
	PersonnelRequest,
} from "@/hrm/personnelRequests/services/getPersonnelRequests";
import { postPersonnelRequestStatus } from "@/hrm/personnelRequests/services/postPersonnelRequestStatus";
import { cn } from "@/lib/utils";
import { getTimeString } from "@/time/getTimeString";
import { Loading } from "@/ui/Loader";
import { Panel } from "@/ui/Panel";
import { Table } from "@/ui/Table";

function RequestsTable({
	onSubstituteRequestAction,
	tableLoading,
	setTableLoading,
	error,
	setError,
}: {
	tableLoading: boolean;
	error: boolean;
	setTableLoading: React.Dispatch<React.SetStateAction<boolean>>;
	setError: React.Dispatch<React.SetStateAction<boolean>>;
	onSubstituteRequestAction: (
		request: PersonnelRequest,
		status:
			| PersonnelRequestStatusType.counted
			| PersonnelRequestStatusType.rejected,
	) => void;
	requests: PersonnelRequest[];
	onRequestsFetch: (requests: PersonnelRequest[]) => void;
}) {
	const [items, setItems] = useState<number>(0);
	const [currentPage, setCurrentPage] = useState<number>(0);
	const [size, setSize] = useState<number>(10);
	const [requests, setRequests] = useState<PersonnelRequest[]>();
	async function loadRequests() {
		try {
			setTableLoading(true);
			const responses: any = await getPersonnelRequests({
				page: currentPage,
				size: size,
			});
			setItems(responses?.count);

			setRequests(responses?.data);
			setError(false);
		} catch (err: any) {
			setError(true);
		} finally {
			setTableLoading(false);
		}
	}

	useEffect(() => {
		loadRequests();
	}, [setRequests, currentPage]);

	const [loading, setLoading] = useState<string[]>([]);

	const actionHandler = async (
		action: "confirmed" | "rejected",
		request: PersonnelRequest,
	) => {
		try {
			setLoading((prev) => [...prev, request.id]);
			const response = await postPersonnelRequestStatus({
				personnelRequestIds: [request.id],
				status: action,
			});
			if (response) {
				action === "confirmed" &&
					onSubstituteRequestAction(
						request,
						PersonnelRequestStatusType.counted,
					);
				action === "rejected" &&
					onSubstituteRequestAction(
						request,
						PersonnelRequestStatusType.rejected,
					);
				loadRequests();
			}
			setError(false);
		} catch {
			setError(true);
		} finally {
			setLoading((prev) => prev.filter((id) => id !== request.id));
		}
	};

	return (
		<div className="flex w-full flex-col">
			<Panel.Root className="scrollbar-thin scrollbar-thumb-gray-100 scrollbar-thumb-rounded-lg overflow-auto">
				<Table.Root>
					<Table.Head>
						<Table.Row key="header" className="bg-gray-100 text-right">
							<Table.Cell as="th" className="w-16"></Table.Cell>
							<Table.Cell as="th" className="w-16">
								ردیف
							</Table.Cell>
							<Table.Cell as="th">درخواست دهنده</Table.Cell>
							<Table.Cell as="th">نوع درخواست</Table.Cell>
							<Table.Cell as="th">بازه درخواست</Table.Cell>
							<Table.Cell as="th">وضعیت</Table.Cell>
							<Table.Cell as="th">توضیحات</Table.Cell>
							<Table.Cell as="th">جانشین</Table.Cell>
						</Table.Row>
					</Table.Head>
					<Table.Body>
						{tableLoading ? (
							<Table.Row key="loading">
								<Table.Cell colSpan={100}>
									<Loading size="sm">در حال دریافت اطلاعات...</Loading>
								</Table.Cell>
							</Table.Row>
						) : error ? (
							<Table.Row key="error">
								<Table.Cell colSpan={100}> خطایی رخ داده است.</Table.Cell>
							</Table.Row>
						) : requests?.length === 0 ? (
							<Table.Row key="empty">
								<Table.Cell colSpan={100}>درخواستی ثبت نشده است</Table.Cell>
							</Table.Row>
						) : (
							requests?.map((request, index) => (
								<Table.Row key={`actions ${request?.id} `}>
									<Table.Cell>
										<Table.Actions>
											{request.status !== "counted" &&
												request.status !== "rejected" && (
													<>
														{!loading.find((id) => id == request.id) && (
															<>
																<Table.Action className="hover:text-green-500">
																	<FaCheck
																		onClick={() =>
																			actionHandler("confirmed", request)
																		}
																	/>
																</Table.Action>
																<Table.Action className="hover:text-red-500">
																	<CgClose
																		onClick={() =>
																			actionHandler("rejected", request)
																		}
																	/>
																</Table.Action>
															</>
														)}
														{loading.find((id) => id == request.id) && (
															<Table.Action className="flex gap-2 ps-2">
																<Loading size="sm" />
															</Table.Action>
														)}
													</>
												)}
										</Table.Actions>
									</Table.Cell>
									<Table.Cell className="text-center"> {index + 1}</Table.Cell>
									<Table.Cell>{`${request?.user[0]?.name} ${request?.user[0]?.lastname}`}</Table.Cell>
									<Table.Cell>{personnelRequestType[request.type]}</Table.Cell>
									{(request.type === PersonnelRequestType.hourlyLeave ||
										request.type === PersonnelRequestType.hourlyMission ||
										request.type === PersonnelRequestType.extra) && (
										<>
											<Table.Cell>
												<span className="ml-2">
													{moment(request.dateFrom, "YYYY-MM-DD")
														.locale("en")
														.format("jYYYY/jMM/jDD")}{" "}
													,
												</span>
												<span>
													{getTimeString(request.timeFrom, false)} تا{" "}
													{getTimeString(request.timeTo, false)}
												</span>
											</Table.Cell>
										</>
									)}
									{(request.type === PersonnelRequestType.dailyLeave ||
										request.type === PersonnelRequestType.dailyMission) && (
										<>
											<Table.Cell>
												<span>
													{moment(request.dateFrom, "YYYY-MM-DD")
														.locale("en")
														.format("jYYYY/jMM/jDD")}{" "}
												</span>
												<span>تا </span>
												<span>
													{moment(request.dateTo, "YYYY-MM-DD")
														.locale("en")
														.format("jYYYY/jMM/jDD")}
												</span>
											</Table.Cell>
										</>
									)}
									<Table.Cell className="min-w-fit">
										<span
											className={cn(
												"inline-block min-w-fit rounded-2xl px-3 py-1",
												request.status === "rejected" &&
													"bg-red-300/20 text-red-600",
												request.status === "counted" &&
													"bg-blue-300/20 text-blue-600",
												request.status === "waitingConfirmation" &&
													"bg-yellow-300/20 text-yellow-600",
												// request.status === "pendingForManager" &&
												//   "bg-green-300/20 text-green-600",
												// request.status === "pendingForSubstitute" &&
												//   "bg-yellow-300/20 text-yellow-600"
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

									<Table.Cell className="">
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
			<div>
				<Pagination
					className="mt-2 !pl-0"
					items={items}
					currentPage={currentPage}
					size={size}
					onPageChange={setCurrentPage}
					loading={tableLoading}
					setSize={setSize}
				/>
			</div>
		</div>
	);
}

export default RequestsTable;
