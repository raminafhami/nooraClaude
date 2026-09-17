"use client";
import moment from "moment-jalaali";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { FaFilter } from "react-icons/fa";

import { Button } from "@/components/ui/button";
import { DateInput } from "@/form/DateInput";
import { Select, SelectDynamic } from "@/form/select";
import { Personnel } from "@/hrm/personnel/models/Personnel";
import { getPersonnel } from "@/hrm/personnel/services/getPersonnel";
import { personnelRequestType } from "@/hrm/personnelRequests/models/personnelRequestType";
import {
	getPersonnelRequests,
	PersonnelRequest,
} from "@/hrm/personnelRequests/services/getPersonnelRequests";
import { compareById } from "@/utils";

const requestTypes = [
	{
		name: "extra",
		label: personnelRequestType.extra,
		value: "extra",
	},
	{
		name: "dailyLeave",
		label: personnelRequestType.dailyLeave,
		value: "dailyLeave",
	},
	{
		name: "hourlyLeave",
		label: personnelRequestType.hourlyLeave,
		value: "hourlyLeave",
	},
	{
		name: "dailyMission",
		label: personnelRequestType.dailyMission,
		value: "dailyMission",
	},
	{
		name: "hourlyMission",
		label: personnelRequestType.hourlyMission,
		value: "hourlyMission",
	},
];
const statusType = [
	{
		name: "rejected",
		label: "رد شده",
		value: "rejected",
	},
	{
		name: "counted",
		label: "تایید شده",
		value: "counted",
	},
	{
		name: "waitingConfirmation",
		label: "در انتظار تایید",
		value: "waitingConfirmation",
	},
	// {
	//   name: "pendingForSubstitute",
	//   label: "در انتظار تایید جانشین",
	//   value: "pendingForSubstitute",
	// },
	// {
	//   name: "pendingForManager",
	//   label: "در انتظار تایید مدیر",
	//   value: "pendingForManager",
	// },
];

function RequestsFilter({
	onFilterSubmit,
	setTableLoading,
	setError,
}: {
	setTableLoading: React.Dispatch<React.SetStateAction<boolean>>;
	setError: React.Dispatch<React.SetStateAction<boolean>>;
	onFilterSubmit: (requests: PersonnelRequest[]) => void;
}) {
	const methods = useForm();
	const fields = methods.watch();
	const [showFilters, setShowFilters] = useState(false);
	const [people, setPeople] = useState<Personnel[]>([]);

	useEffect(() => {
		const fetchPersonnel = async () => {
			try {
				setPeople(await getPersonnel({ sort: { personnelCode: "asc" } }));
			} catch {}
		};
		fetchPersonnel();
	}, []);

	return (
		<div className="flex min-h-8 w-full items-center gap-5">
			{!showFilters && (
				<div
					className="flex cursor-pointer gap-1"
					onClick={() => setShowFilters(true)}
				>
					<FaFilter />
					<div className="font-semibold">فیلتر</div>
				</div>
			)}
			{showFilters && (
				<form
					onSubmit={methods.handleSubmit(async (data) => {
						// ...
					})}
					className="flex grow flex-row flex-wrap justify-center gap-x-4 gap-y-4"
				>
					<div className="flex w-full basis-1/4 flex-col items-start gap-1">
						<label htmlFor="type">نوع درخواست</label>
						<Controller
							name="requestTypes"
							control={methods.control}
							render={({ field: { onChange, value } }) => (
								<Select
									id="type"
									className="w-[12.5rem] rounded-lg"
									items={requestTypes}
									value={fields["type"]}
									optional
									onLeave={() => {
										methods.trigger("type");
									}}
									onMutate={(v) => {
										methods.setValue("type", v, {
											shouldDirty: true,
											shouldTouch: true,
										});
									}}
								/>
							)}
						/>
					</div>
					<div className="flex w-full basis-1/4 flex-col items-start gap-1">
						<label htmlFor="status" className="w-full">
							وضعیت درخواست
						</label>
						<Controller
							name="status"
							control={methods.control}
							render={({ field: { onChange, value } }) => (
								<Select
									className="w-[12.5rem] rounded-lg"
									id="statusType"
									items={statusType}
									optional
									value={fields["status"]}
									onLeave={() => {
										methods.trigger("status");
									}}
									onMutate={(v) => {
										methods.setValue("status", v, {
											shouldDirty: true,
											shouldTouch: true,
											shouldValidate: true,
										});
									}}
								/>
							)}
						/>
					</div>
					<div className="flex w-full basis-1/4 flex-col items-start gap-1">
						<label htmlFor="name">پرسنل</label>
						<div className="flex w-[12.5rem] flex-col">
							<Controller
								name="name"
								control={methods.control}
								render={({ field: { onChange, value } }) => (
									<SelectDynamic<Personnel>
										id="user"
										value={fields["name"]}
										onCompare={compareById}
										onLabel={(x) => x.fullname}
										onLeave={() => {
											methods.trigger("name");
										}}
										onMutate={(v) => {
											methods.setValue("name", v!, {
												shouldDirty: true,
												shouldTouch: true,
											});
											methods.register("name");
										}}
										onSearch={(v) => {
											return people.filter((x) => x.fullname.includes(v));
										}}
									/>
								)}
							/>
						</div>
					</div>
					<div className="flex w-full basis-1/4 flex-col items-start gap-1">
						<label className="shrink-0" htmlFor="dateFrom">
							از تاریخ
						</label>
						<div className="w-[12.5rem]">
							<DateInput
								value={fields["dateFrom"]}
								onBlur={() => {
									methods.trigger("dateFrom");
								}}
								onMutate={(v) => {
									methods.setValue("dateFrom", v, {
										shouldDirty: true,
										shouldTouch: true,
										shouldValidate: true,
									});
								}}
								{...((ref, ...register) => register)(
									methods.register("dateFrom"),
								)}
							/>
						</div>
					</div>
					<div className="flex w-full basis-1/4 flex-col items-start gap-1">
						<label className="shrink-0" htmlFor="dateTo">
							تا تاریخ
						</label>
						<div className="w-[12.5rem]">
							<DateInput
								value={fields["dateTo"]}
								onBlur={() => {
									methods.trigger("dateTo");
								}}
								onMutate={(v) => {
									methods.setValue("dateTo", v, {
										shouldDirty: true,
										shouldTouch: true,
										shouldValidate: true,
									});
								}}
								{...((ref, ...register) => register)(
									methods.register("dateTo"),
								)}
							/>
						</div>
					</div>
					<div className="flex w-full basis-1/4 flex-col justify-end gap-1">
						<Button className="w-[12.5rem]" variant="secondary">
							اعمال فیلتر
						</Button>
					</div>
				</form>
			)}
		</div>
	);
}

export default RequestsFilter;
