"use client";
import moment from "moment-jalaali";
import { Controller, useForm } from "react-hook-form";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { DestructiveAlert } from "@/components/ui/alert/destructive-alert";
import { Button } from "@/components/ui/button";
import { Select } from "@/form/select";
import { AttendanceDateString } from "@/hrm/attendance/models/AttendanceDateString";
import { Personnel } from "@/hrm/personnel/models/Personnel";
import {
	PersonnelRequestType,
	personnelRequestType,
} from "@/hrm/personnelRequests/models/personnelRequestType";
import { createManualTime } from "@/hrm/personnelRequests/services/createManualTime";
import { createPersonnelRequest } from "@/hrm/personnelRequests/services/createPersonnelRequest";
import { createUpdateWholeTimes } from "@/hrm/personnelRequests/services/createUpdateWholeTimes";
import { MyRequests } from "@/hrm/personnelRequests/services/getMyRequests";
import { updateExtraRequest } from "@/hrm/personnelRequests/services/updateExtraRequest";
import { Loading } from "@/ui/Loader";

import ProfileAttendanceRequestDailyLeave from "./ProfileAttendanceRequestDailyLeave";
import ProfileAttendanceRequestDailyMission from "./ProfileAttendanceRequestDailyMission";
import ProfileAttendanceRequestExtra from "./ProfileAttendanceRequestExtra";
import ProfileAttendanceRequestHourlyLeave from "./ProfileAttendanceRequestHourlyLeave";
import ProfileAttendanceRequestHourlyMission from "./ProfileAttendanceRequestHourlyMission";
import ProfileAttendanceRequestManualTime from "./ProfileAttendanceRequestManualTime";

export interface FormData {
	dateFrom: string;
	dateTo: string;
	type: PersonnelRequestType | "manualEntry" | "extra";
	entitlement: boolean;
	date: string;
	timeFrom: string;
	timeTo: string;
	description: string;
	entryTime: string;
	exitTime: string;
	substitute: Personnel;
	requestId: string;
}

const requestTypes = [
	// {
	//   name: "manualEntry",
	//   label: "ورود و خروج دستی",
	//   value: "manualEntry",
	// },
	{
		name: "extra",
		label: "درخواست اضافه کاری",
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

function ProfileAttendanceRequestsForm({
	onRequestAdd,
	setLoading,
	requests,
}: {
	requests: MyRequests[];
	setLoading: React.Dispatch<React.SetStateAction<boolean>>;
	onRequestAdd: (request: any) => void;
}) {
	const methods = useForm<FormData>();
	const requestType = methods.watch("type");
	const fields = methods.watch();

	return (
		<form
			className="flex h-min w-full max-w-[30rem] flex-col items-center justify-center gap-y-4 rounded-3xl px-2 py-4 sm:items-start xl:max-w-max"
			onSubmit={methods.handleSubmit(async (data) => {
				try {
					if (data.type === PersonnelRequestType.dailyLeave) {
						const finalData = {
							dateFrom: moment(data.dateFrom, "jYYYY/jMM/jDD")
								.locale("en")
								.format("YYYY-MM-DD") as AttendanceDateString,
							dateTo: moment(data.dateTo, "jYYYY/jMM/jDD")
								.locale("en")
								.format("YYYY-MM-DD") as AttendanceDateString,
							entitlement: true,
							deputyId: data.substitute.userId,
							type: data.type as PersonnelRequestType,
						};
						const response = await createPersonnelRequest(finalData);
						if (response)
							onRequestAdd({ ...finalData, status: "waitingConfirmation" });
					}
					if (data.type === PersonnelRequestType.dailyMission) {
						const finalData = {
							dateFrom: moment(data.dateFrom, "jYYYY/jMM/jDD")
								.locale("en")
								.format("YYYY-MM-DD") as AttendanceDateString,
							dateTo: moment(data.dateTo, "jYYYY/jMM/jDD")
								.locale("en")
								.format("YYYY-MM-DD") as AttendanceDateString,
							entitlement: true,
							type: data.type as PersonnelRequestType,
							description: data.description,
						};
						const response = await createPersonnelRequest(finalData);
						if (response)
							onRequestAdd({ ...finalData, status: "waitingConfirmation" });
					}
					if (data.type === PersonnelRequestType.hourlyLeave) {
						const finalData = {
							dateFrom: moment(data.date, "jYYYY/jMM/jDD")
								.locale("en")
								.format("YYYY-MM-DD") as AttendanceDateString,
							dateTo: moment(data.date, "jYYYY/jMM/jDD")
								.locale("en")
								.format("YYYY-MM-DD") as AttendanceDateString,
							timeFrom: data.timeFrom,
							timeTo: data.timeTo,
							entitlement: true,
							type: data.type as PersonnelRequestType,
						};
						const response = await createPersonnelRequest(finalData);
						if (response)
							onRequestAdd({ ...finalData, status: "waitingConfirmation" });
					}
					if (data.type === PersonnelRequestType.hourlyMission) {
						const finalData = {
							dateFrom: moment(data.date, "jYYYY/jMM/jDD")
								.locale("en")
								.format("YYYY-MM-DD") as AttendanceDateString,
							dateTo: moment(data.date, "jYYYY/jMM/jDD")
								.locale("en")
								.format("YYYY-MM-DD") as AttendanceDateString,
							timeFrom: data.timeFrom,
							timeTo: data.timeTo,
							entitlement: true,
							type: data.type as PersonnelRequestType,
							description: data.description,
						};
						const response = await createPersonnelRequest(finalData);
						console.log({ ...finalData, status: "waitingConfirmation" });
						if (response)
							onRequestAdd({ ...finalData, status: "waitingConfirmation" });
					}
					if (data.type === "manualEntry") {
						const finalData = {
							date: moment(data.date, "jYYYY/jMM/jDD")
								.locale("en")
								.format("YYYY-MM-DD") as AttendanceDateString,
							times: `${data.entryTime},${data.exitTime}`,
						};
						const response = await createUpdateWholeTimes(finalData);

						if (response)
							onRequestAdd({
								...finalData,
								status: "waitingConfirmation",
								type: "manualTime",
							});
					}
					if (data.type === "extra") {
						const finalData = {
							description: data.description,
						};
						const response = await updateExtraRequest(
							data.requestId,
							finalData,
						);

						if (response)
							onRequestAdd({
								...finalData,
								status: "waitingConfirmation",
								type: "extraRequest",
							});
					}
				} catch (err) {
					methods.setError("root.server", {
						message: "Something went wrong...",
					});
				}
			})}
		>
			<div className="flex w-full flex-col gap-x-2 gap-y-2 sm:flex-row">
				<label
					htmlFor="requestType"
					id="requestType"
					className="pt-2 sm:basis-28"
				>
					نوع درخواست:
				</label>
				<div className="min-w-[11rem] grow">
					<Controller
						name="type"
						control={methods.control}
						render={({ field: { onChange, value } }) => (
							<Select
								className="rounded-lg"
								id="type"
								items={requestTypes}
								value={fields["type"]}
								onLeave={() => {
									methods.trigger("type");
								}}
								onMutate={(v) => {
									methods.reset({ type: v as PersonnelRequestType });
									methods.setValue("type", v as PersonnelRequestType, {
										shouldDirty: true,
										shouldTouch: true,
										shouldValidate: true,
									});
								}}
							/>
						)}
					/>
				</div>
			</div>
			{requestType === "hourlyLeave" ? (
				<ProfileAttendanceRequestHourlyLeave methods={methods} />
			) : requestType === "dailyLeave" ? (
				<ProfileAttendanceRequestDailyLeave methods={methods} />
			) : requestType === "dailyMission" ? (
				<ProfileAttendanceRequestDailyMission methods={methods} />
			) : requestType === "hourlyMission" ? (
				<ProfileAttendanceRequestHourlyMission methods={methods} />
			) : requestType === "manualEntry" ? (
				<ProfileAttendanceRequestManualTime methods={methods} />
			) : requestType === "extra" ? (
				<ProfileAttendanceRequestExtra requests={requests} methods={methods} />
			) : (
				<></>
			)}

			<div className="flex gap-4 self-end">
				<Button
					className="w-fit px-10"
					disabled={
						!methods.formState.isDirty ||
						methods.formState.isSubmitting ||
						!methods.formState.isValid
					}
				>
					{methods.formState.isSubmitting ? (
						<Loading horizontalPlacement="center" intent="white" size="sm" />
					) : methods.formState.isSubmitSuccessful &&
					  !methods.formState.isDirty ? (
						"افزوده شد!"
					) : (
						"افزودن"
					)}
				</Button>
			</div>
			<div className="flex gap-y-4 self-end">
				{!methods.formState.isSubmitting &&
					methods.formState.isSubmitSuccessful && (
						<div className="w-full">
							<Alert className="mb-4" variant="info">
								<AlertDescription>
									{fields["type"] === "manualEntry"
										? "ورود و خروج با موفقیت اعمال شد."
										: "درخواست با موفقیت افزوده شد."}
								</AlertDescription>
							</Alert>
						</div>
					)}
				{!methods.formState.isSubmitting &&
					methods.formState.submitCount > 0 &&
					!methods.formState.isSubmitSuccessful && (
						<div className="w-full">
							<DestructiveAlert className="mb-4">
								<AlertDescription>
									{fields["type"] === "manualEntry"
										? "ورود و خروج اعمال نشد."
										: "درخواست ثبت نشد."}
								</AlertDescription>
							</DestructiveAlert>
						</div>
					)}
			</div>
		</form>
	);
}

export default ProfileAttendanceRequestsForm;
