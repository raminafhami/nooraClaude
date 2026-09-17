import moment from "moment-jalaali";
import React, { useCallback, useEffect, useState } from "react";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { FaEye, FaPencilAlt } from "react-icons/fa";
import { TbRotateClockwise } from "react-icons/tb";
import { DateObject } from "react-multi-date-picker";

import { Button } from "@/components/ui/button";
import { AttendanceDateString } from "@/hrm/attendance/models/AttendanceDateString";
import { getAttendancesInDetail } from "@/hrm/attendance/services/getAttendancesInDetail";
import { validateTimeString } from "@/time/validateTimeString";
import { Loading } from "@/ui/Loader";

import { ScheduleCalendar } from "../ScheduleCalendar";
import { ScheduleGuide } from "../ScheduleGuide";
import { SchedulesPersonnelList } from "../SchedulesPersonnelList";
import { PersonnelSelectionType, Query } from "../SchedulesWidget";
import { SchedulesWorkingShiftList } from "../SchedulesWorkingShiftList";

export interface InitialWorkShifts {
	date: DateObject;
	workShiftId: string;
}
function EditingOnePersonnelSchedule({ query }: { query: Query }) {
	const [initialWorkShifts, setInitialWorkShifts] = useState<
		InitialWorkShifts[]
	>([]);

	const [updatedFormData, setUpdatedFormData] = useState<Query["formData"]>({
		userId: [],
		datesAndWorkShift: {},
	});

	const loadWorkShifts = async (
		personnelId: string,
	): Promise<InitialWorkShifts[] | undefined> => {
		const currentDate = moment();

		const firstDayOfMonth = currentDate.clone().startOf("jMonth");
		const formattedFirstDay = firstDayOfMonth.format("jYYYY-jMM-jDD");

		const lastDayOfMonth = currentDate.clone().endOf("jMonth");
		const formattedLastDay = lastDayOfMonth.format("jYYYY-jMM-jDD");

		const response = await getAttendancesInDetail(
			personnelId,
			moment(formattedFirstDay, "jYYYY-jMM-jDD").format(
				"YYYY-MM-DD",
			) as AttendanceDateString,
			moment(formattedLastDay, "jYYYY-jMM-jDD").format(
				"YYYY-MM-DD",
			) as AttendanceDateString,
		);

		const dateAndWorkShiftId = response
			.filter((i) => i.workshiftId)
			.map((i) => ({
				date: new DateObject({
					date: moment(i.date!, "YYYY-MM-DD").format("jYYYY/jMM/jDD"),
					calendar: persian,
					locale: persian_fa,
				}),
				workShiftId: i.workshiftId!,
			}));
		if (dateAndWorkShiftId.length > 0) return dateAndWorkShiftId;
	};

	const handleWorkShiftsFetch = useCallback(
		async (personnelId: string): Promise<void> => {
			setInitialWorkShifts([]);
			const workShifts = await loadWorkShifts(personnelId);
			if (workShifts) setInitialWorkShifts(workShifts);
		},
		[],
	);
	function isValidUpdatedFormObj(obj: Query["formData"]): boolean {
		const dateEntries = Object.entries(obj.datesAndWorkShift);
		if (dateEntries.length == 0) {
			return false;
		}
		const isDatesValid = dateEntries.every(([key, values]) => {
			return key !== "" && values.length !== 0;
		});

		if (!isDatesValid) {
			return false;
		}

		if (obj.userId.length == 0) {
			return false;
		}
		return true;
	}

	const reloadClickHandler = () => {
		query.setLastSubmittedPersonnel([]);
		query.changeStep(-1);
		query.setFormData({ userId: [], datesAndWorkShift: {} });
		setUpdatedFormData({ userId: [], datesAndWorkShift: {} });
		query.setCurrent("");
		query.setColorAndWorkShiftId((prev) =>
			prev.map((each) => ({ ...each, workingRegulationId: "" })),
		);
		setInitialWorkShifts([]);
		query.setSubmit({ submitted: false, error: false, message: "" });
		query.setCalDisabled(true);
	};

	const [error, setError] = useState("");

	function validateTime(time: string): string {
		const value = time.replaceAll("_", "") + ":00";

		if (!validateTimeString(value)) {
			return "فرمت زمان وارد شده صحیح نمی باشد.";
		}
		return "";
	}

	return (
		<div className="flex min-w-full flex-col justify-start">
			<div className="z-50 -my-4 h-12 self-end">
				{query.submit.submitted && !query.submit.error ? (
					<span className="rounded-lg bg-green-500 px-4 py-1 text-white">
						با موفقیت ثبت شد
					</span>
				) : query.submit.submitted && query.submit.error ? (
					<span className="rounded-lg bg-red-500 px-4 py-2 text-white">
						{query.submit.message}
					</span>
				) : (
					""
				)}
			</div>
			<div className="flex flex-col gap-y-4">
				<div className="flex flex-col justify-between gap-x-5 gap-y-4 md:flex-row">
					<div className="flex w-full flex-col gap-4 md:max-w-[18rem]">
						<SchedulesPersonnelList
							mode={PersonnelSelectionType.onePersonnel}
							formData={updatedFormData}
							locked={false}
							changeForm={setUpdatedFormData}
						/>

						<div className="flex w-full justify-between">
							<Button
								type="button"
								disabled={
									updatedFormData.userId.length === 0 ||
									query.lastSubmittedPersonnel[0] === updatedFormData.userId[0]
								}
								onClick={() => {
									query.setLastSubmittedPersonnel([updatedFormData.userId[0]]);
									handleWorkShiftsFetch(updatedFormData.userId[0]);
									query.changeStep(1);
									query.setSubmit({
										submitted: false,
										message: "",
										error: false,
									});
								}}
								className="item-center flex w-full justify-center gap-x-2 px-4"
							>
								<FaEye width={20} height={20} />
								<span>مشاهده شیفت کاری</span>
							</Button>
						</div>
					</div>
					{query.step > 1 && (
						<div className="flex w-full max-w-[100rem] flex-col items-center justify-center gap-2 self-center overflow-hidden">
							<SchedulesWorkingShiftList
								mode={PersonnelSelectionType.onePersonnel}
								setCalDisabled={query.setCalDisabled}
								currentWorkingRegulationId={query.current}
								setColorAndId={query.setColorAndWorkShiftId}
								setCurrentWorkingRegulationId={query.setCurrent}
							/>

							<div></div>

							<div className="flex w-full flex-col justify-end">
								<ScheduleCalendar
									mode={PersonnelSelectionType.onePersonnel}
									disabled={query.isCalDisabled}
									setColorAndId={query.setColorAndWorkShiftId}
									colorAndId={query.colorsAndWorkShift}
									currentWorkingRegulationId={query.current}
									setDate={query.setFormData}
									initialValue={initialWorkShifts}
									onUpdatingForm={setUpdatedFormData}
								/>
								<Button
									type="submit"
									disabled={
										!isValidUpdatedFormObj(updatedFormData) ||
										query.isSubmittingFrom ||
										!!error
									}
									onClick={() => query.onFormSubmit(updatedFormData)}
									className="item-center mt-4 flex w-fit justify-center gap-2 self-end px-8"
								>
									<FaPencilAlt width={20} />
									{query.isSubmittingFrom ? <Loading /> : "ثبت تغییرات"}
								</Button>
								{query.step > 1 && (
									<div className="flex items-center gap-3 self-end">
										{query.submit.submitted ? (
											<button
												onClick={reloadClickHandler}
												className="flex items-center gap-2 text-primary-600"
											>
												<TbRotateClockwise width={50} height={50} />
												بارگذاری مجدد فرم
											</button>
										) : (
											""
										)}
									</div>
								)}
								{query.step > 1 && (
									<ScheduleGuide
										colorAndId={query.colorsAndWorkShift}
										formData={query.formData}
									/>
								)}
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

export default EditingOnePersonnelSchedule;
