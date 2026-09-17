"use client";
import moment from "moment-jalaali";
import React, { useEffect, useState } from "react";
import { FaCheck, FaTrash } from "react-icons/fa";

import { personnelRequestType } from "@/hrm/personnelRequests/models/personnelRequestType";
import { substituteRequestModel } from "@/hrm/personnelRequests/models/substituteRequestModel";
import { getTimeString } from "@/time/getTimeString";
import { Loading } from "@/ui/Loader";
import { Panel } from "@/ui/Panel";
import { Table } from "@/ui/Table";

const data: substituteRequestModel[] = [
	{
		id: "2",
		type: "dailyLeave",
		dateFrom: "2023-10-29",
		dateTo: "2023-11-02",
		status: "pendingForSubstitute",
		substitute: "",
		yourAction: "",
		entitlement: true,
	},
	{
		id: "4",
		type: "dailyLeave",
		dateFrom: "2023-10-29",
		dateTo: "2023-11-02",
		status: "pendingForSubstitute",
		substitute: "",
		yourAction: "",
		entitlement: true,
	},
	{
		id: "14",
		type: "dailyLeave",
		dateFrom: "2023-10-29",
		dateTo: "2023-11-02",
		status: "pendingForSubstitute",
		substitute: "",
		yourAction: "",
		entitlement: true,
	},
	{
		id: "24",
		type: "dailyLeave",
		dateFrom: "2023-10-29",
		dateTo: "2023-11-02",
		status: "pendingForSubstitute",
		substitute: "",
		yourAction: "",
		entitlement: true,
	},
	{
		id: "34",
		type: "dailyLeave",
		dateFrom: "2023-10-29",
		dateTo: "2023-11-02",
		status: "pendingForSubstitute",
		substitute: "",
		yourAction: "",
		entitlement: true,
	},
	{
		id: "44",
		type: "dailyLeave",
		dateFrom: "2023-10-29",
		dateTo: "2023-11-02",
		status: "pendingForSubstitute",
		substitute: "",
		yourAction: "",
		entitlement: true,
	},
];

function ProfileAttendanceRequestSubstituteTable({
	onRequestsFetch,
	requests,
	onSubstituteRequestAction,
}: {
	onSubstituteRequestAction: (request: substituteRequestModel[]) => void;
	requests: substituteRequestModel[];
	onRequestsFetch: (requests: substituteRequestModel[]) => void;
}) {
	useEffect(() => {
		if (requests.length === 0) {
			onRequestsFetch(data);
		}
	}, [requests, onRequestsFetch]);
	const [loading, setLoading] = useState<string[]>([]);

	const checkHandler = (selectedRequest: substituteRequestModel) => {
		setLoading((prev) => [...prev, selectedRequest.id]);
		setTimeout(() => {
			setLoading((prev) => prev.filter((id) => id !== selectedRequest.id));
			if ((selectedRequest.type = "dailyLeave")) {
				const updatedValue: substituteRequestModel = {
					...selectedRequest,
					type: "dailyLeave",
					substitute: "فلانی",
					status: "pendingForManager",
					yourAction: "accepted",
				};

				const updatedRequest = requests.map(
					(request: substituteRequestModel) => {
						if (selectedRequest.id === request.id) return updatedValue;
						return request;
					},
				);

				onSubstituteRequestAction(updatedRequest);
			}
		}, 5000);
	};

	const rejectHandler = (selectedRequest: substituteRequestModel) => {
		// const updatedValue: substituteRequestModel = {
		//   ...selectedRequest,
		//   yourAction: "rejected",
		// };
		setLoading((prev) => [...prev, selectedRequest.id]);
		setTimeout(() => {
			setLoading((prev) => prev.filter((id) => id !== selectedRequest.id));
			const updatedRequest = requests.filter(
				(request: substituteRequestModel) => request.id !== selectedRequest.id,
			);

			onSubstituteRequestAction(updatedRequest);
		}, 5000);
	};

	return (
		<>
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
						</Table.Row>
					</Table.Head>
					<Table.Body>
						{requests.length === 0 ? (
							<Table.Row key="empty">
								<Table.Cell colSpan={100}>درخواستی ثبت نشده است</Table.Cell>
							</Table.Row>
						) : (
							requests.map((request, index) => (
								<Table.Row key={`requestTable ${request.id}`}>
									<Table.Cell>
										<Table.Actions>
											{!request.yourAction &&
												request.status === "pendingForSubstitute" && (
													<>
														{!loading.find((id) => id == request.id) && (
															<>
																<Table.Action className="hover:text-green-500">
																	<FaCheck
																		onClick={() => checkHandler(request)}
																	/>
																</Table.Action>
																<Table.Action className="hover:text-red-500">
																	<FaTrash
																		onClick={() => rejectHandler(request)}
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
									<Table.Cell>غزاله نیازی</Table.Cell>
									<Table.Cell>{personnelRequestType[request.type]}</Table.Cell>
									{request.type === "hourlyLeave" && (
										<Table.Cell className="flex gap-2">
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
										</Table.Cell>
									)}
									{request.type === "dailyLeave" && (
										<Table.Cell>
											<span>
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
										</Table.Cell>
									)}
								</Table.Row>
							))
						)}
					</Table.Body>
				</Table.Root>
			</Panel.Root>
		</>
	);
}

export default ProfileAttendanceRequestSubstituteTable;
