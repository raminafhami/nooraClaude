"use client";

import moment from "moment-jalaali";
import React, { useEffect, useState } from "react";

import { AttendanceDateString } from "@/hrm/attendance/models/AttendanceDateString";
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
import { cn } from "@/lib/utils";
import { getTimeString } from "@/time/getTimeString";
import { Card } from "@/ui/Card";
import { Head } from "@/ui/Head";
import { Loading } from "@/ui/Loader";

function PersonnelLeaveRequests() {
	const [isError, setError] = useState<boolean>(false);
	const [isLoading, setLoading] = useState<boolean>(true);
	const [requests, setRequests] = useState<PersonnelRequest[] | null>(null);

	useEffect(() => {
		(async () => {
			try {
				setError(false);
				setLoading(true);

				const { data: requests }: any = await getPersonnelRequests({
					dateFrom: moment().format("YYYY-MM-DD") as AttendanceDateString,
					dateTo: moment().format("YYYY-MM-DD") as AttendanceDateString,
				});

				const filteredRequests = requests.filter(
					(request: PersonnelRequest) =>
						request.status !== PersonnelRequestStatusType["rejected"] &&
						request.type !== PersonnelRequestType["extra"],
				);

				setRequests(filteredRequests);
			} catch (err: any) {
				setError(true);
			} finally {
				setLoading(false);
			}
		})();
	}, []);

	return (
		<div className="shrink-0 basis-[35rem] space-y-8">
			<Head.Root>
				<Head.Title>مرخصی‌ها و ماموریت‌های امروز</Head.Title>
			</Head.Root>

			<Card className="mt-16 overflow-hidden" height="xl" padding="md">
				<div className="flex w-full flex-wrap gap-2 overflow-y-auto">
					{isLoading ? (
						<Loading horizontalPlacement="center" intent="white" size="sm" />
					) : isError ? (
						<div>مشکلی رخ داده است.</div>
					) : requests && requests?.length == 0 ? (
						<div>درخواست ثبت نشده است.</div>
					) : (
						requests?.map((request) => (
							<Card
								key={request.id}
								height="auto"
								intent="white"
								className="flex w-[20rem] shrink-0 flex-col gap-y-2 px-3 py-2"
							>
								<div className="flex">
									<div className="w-32">درخواست دهنده</div>
									<div>{request.fullname} </div>
								</div>
								<div className="flex">
									<div className="w-32">نوع درخواست</div>
									<div>{personnelRequestType[request.type]}</div>
								</div>
								<div className="flex">
									<div className="w-32">بازه درخواست</div>
									<div>
										{(request.type === PersonnelRequestType.hourlyLeave ||
											request.type === PersonnelRequestType.hourlyMission) && (
											<>
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
											</>
										)}
										{(request.type === PersonnelRequestType.dailyLeave ||
											request.type === PersonnelRequestType.dailyMission) && (
											<div className="flex gap-x-1">
												<span>
													{moment(request.dateFrom, "YYYY-MM-DD")
														.locale("en")
														.format("jYYYY/jMM/jDD")}
												</span>
												<span>تا </span>
												<span>
													{moment(request.dateTo, "YYYY-MM-DD")
														.locale("en")
														.format("jYYYY/jMM/jDD")}
												</span>
											</div>
										)}
									</div>
								</div>
								<div className="flex">
									<div className="w-32">وضعیت درخواست</div>
									<div
										className={cn(
											"rounded-2xl px-2 py-[0.2rem]",
											request.status === "rejected" &&
												"bg-red-300/10 text-red-600",
											request.status === "counted" &&
												"bg-blue-300/10 text-blue-600",
											request.status === "waitingConfirmation" &&
												"bg-yellow-300/10 text-yellow-600",
										)}
									>
										{personnelRequestStatusType[request.status]}
									</div>
								</div>
							</Card>
						))
					)}
				</div>
			</Card>
		</div>
	);
}

export default PersonnelLeaveRequests;
