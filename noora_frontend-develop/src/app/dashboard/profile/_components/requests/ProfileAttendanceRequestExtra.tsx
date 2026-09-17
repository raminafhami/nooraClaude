"use client";

import moment from "moment-jalaali";
import React, { useEffect, useState } from "react";
import { UseFormReturn } from "react-hook-form";

import { FieldError } from "@/form/FieldError";
import { Input } from "@/form/Input";
import { PersonnelRequestType } from "@/hrm/personnelRequests/models/personnelRequestType";
import { MyRequests } from "@/hrm/personnelRequests/services/getMyRequests";
import { cn } from "@/lib/utils";
import { messages } from "@/messages";
import { getTimeString } from "@/time/getTimeString";

import { FormData } from "./ProfileAttendanceRequestsForm";

function ProfileAttendanceRequestExtra({
	methods,
	requests,
}: {
	requests: MyRequests[];
	methods: UseFormReturn<FormData, any>;
}) {
	const [extraRequests, setExtraRequests] = useState<MyRequests[]>([]);

	const [selectedRequest, setSelectedRequest] = useState<MyRequests | null>(
		null,
	);

	useEffect(() => {
		const filteredRequests = requests.filter((request) => {
			if (request.type === PersonnelRequestType.extra) {
				return !request.description;
			}
		});
		setExtraRequests(filteredRequests);
	}, [requests]);

	const onRequestSelect = (request: MyRequests) => {
		setSelectedRequest(request);
		methods.setValue("requestId", request.id, {
			shouldDirty: true,
			shouldTouch: true,
			shouldValidate: true,
		});
	};

	return (
		<div className="flex w-full flex-col gap-y-4">
			<div className="flex w-full grow flex-col items-center gap-2 sm:flex-row">
				<div className="flex gap-x-2 self-start sm:basis-28">
					یکی از درخواست‌های زیر را انتخاب کنید:
				</div>
				<div className="flex w-full min-w-[11rem] grow flex-col">
					{extraRequests.length === 0 ? (
						<div className="w-full rounded-xl border border-primary-900/10 bg-primary-400/10 px-1 py-3">
							درخواستی برای نمایش وجود ندارد .
						</div>
					) : (
						extraRequests.map((request) => (
							<div
								onClick={() => onRequestSelect(request)}
								key={request.id}
								className={cn(
									"flex cursor-pointer flex-col rounded-xl px-5 py-4",
									selectedRequest?.id === request.id
										? "border border-primary-900/10 bg-primary-400/30"
										: "bg-primary-200/20",
								)}
							>
								<div className="flex gap-x-2 sm:basis-28">
									<div className="w-16">تاریخ:</div>
									<div>
										{moment(request.dateTo, "YYYY-MM-DD").format(
											"jYYYY/jMM/jDD",
										)}
									</div>
								</div>
								<div className="flex gap-10">
									<div className="flex gap-x-2 sm:basis-28">
										<div className="w-16">از ساعت:</div>
										<div>{getTimeString(request.timeFrom, false)}</div>
									</div>
									<div className="flex gap-x-2 sm:basis-28">
										<div className="w-16">تا ساعت:</div>
										<div>{getTimeString(request.timeTo, false)}</div>
									</div>
								</div>
							</div>
						))
					)}
				</div>
			</div>

			<div>
				<div className="flex w-full min-w-[11rem] grow flex-col justify-between gap-x-2 gap-y-2">
					<div className="flex grow flex-col gap-x-2 gap-y-2 sm:flex-row">
						<label className="pt-2 sm:basis-28" htmlFor="dateTo">
							تاریخ:
						</label>
						<div className="min-w-[11rem] grow">
							<Input
								disabled
								readOnly
								value={
									selectedRequest
										? moment(selectedRequest?.dateFrom, "YYYY-MM-DD").format(
												"jYYYY/jMM/jDD",
											)
										: undefined
								}
							/>
						</div>
					</div>
					<div className="flex grow flex-col gap-x-2 gap-y-2 sm:flex-row">
						<label className="pt-2 sm:basis-28" htmlFor="description">
							به مدت:
						</label>
						<div className="min-w-[11rem] grow">
							<Input
								id="duration"
								disabled
								readOnly
								value={
									selectedRequest
										? `${getTimeString(
												selectedRequest?.timeFrom,
												false,
											)} تا ${getTimeString(selectedRequest?.timeTo, false)}`
										: ""
								}
							/>
						</div>
					</div>
					<div className="flex grow flex-col gap-x-2 gap-y-2 sm:flex-row">
						<label className="pt-2 sm:basis-28" htmlFor="description">
							توضیحات:
						</label>
						<div className="min-w-[11rem] grow">
							<Input
								disabled={!selectedRequest}
								id="description"
								{...methods.register("description", {
									required: messages.validation.required,
								})}
							/>
							<FieldError error={methods.formState.errors["description"]} />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default ProfileAttendanceRequestExtra;
