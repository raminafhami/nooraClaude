"use client";
import React, { useEffect, useState } from "react";
import { FaEye, FaPencilAlt } from "react-icons/fa";
import { TbRotateClockwise } from "react-icons/tb";

import { Button } from "@/components/ui/button";
import { validateTimeString } from "@/time/validateTimeString";
import { Loading } from "@/ui/Loader";

import { ScheduleCalendar } from "../ScheduleCalendar";
import { ScheduleGuide } from "../ScheduleGuide";
import { SchedulesPersonnelList } from "../SchedulesPersonnelList";
import { PersonnelSelectionType, Query } from "../SchedulesWidget";
import { SchedulesWorkingShiftList } from "../SchedulesWorkingShiftList";

export function AddingNewSchedule({ query }: { query: Query }) {
	const {
		current,
		formData,
		setCurrent,
		setFormData,
		colorsAndWorkShift,
		setColorAndWorkShiftId,
		setCalDisabled,
		isCalDisabled,
		submit,
		step,
		changeStep,
	} = query;

	const [lockPersonnel, setLockPersonnel] = useState(false);
	const [error, setError] = useState("");

	function isValidInitialFormObj(obj: Query["formData"]): boolean {
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
	// if calendar is touched then lock the personnel
	useEffect(() => {
		if (Object.entries(formData.datesAndWorkShift).length) {
			setLockPersonnel(true);
		} else {
			setLockPersonnel(false);
		}
	}, [formData.datesAndWorkShift]);

	const [makeCalEmpty, setMakeCalEmpty] = useState(false);

	const reloadClickHandler = () => {
		query.changeStep(-1);
		setFormData({ userId: [], datesAndWorkShift: {} });
		setCurrent("");
		setColorAndWorkShiftId((prev) =>
			prev.map((each) => ({ ...each, workingRegulationId: "" })),
		);
		setMakeCalEmpty(true);
		query.setSubmit({ submitted: false, error: false, message: "" });
		setCalDisabled(true);
	};

	return (
		<div className="flex min-w-full flex-col justify-start">
			<div className="z-50 -my-4 h-12 self-end">
				{submit.submitted && !submit.error ? (
					<span className="rounded-lg bg-green-500 px-4 py-1 text-white">
						با موفقیت ثبت شد
					</span>
				) : submit.submitted && submit.error ? (
					<span className="rounded-lg bg-red-500 px-4 py-2 text-white">
						{submit.message}
					</span>
				) : (
					""
				)}
			</div>
			<div className="flex flex-col gap-y-4">
				<div className="flex flex-col justify-between gap-x-5 gap-y-4 md:flex-row">
					<div className="flex flex-col gap-5">
						<SchedulesPersonnelList
							mode={PersonnelSelectionType.multiPersonnel}
							formData={formData}
							changeForm={setFormData}
							locked={lockPersonnel}
						/>
						<div className="flex w-full justify-between">
							<Button
								type="button"
								disabled={formData.userId.length === 0}
								onClick={() => {
									changeStep(1);
								}}
								className="item-center flex w-full justify-center gap-x-2 px-4"
							>
								<FaEye width={20} height={20} />
								<span>افزودن شیفت کاری</span>
							</Button>
						</div>
					</div>

					{step > 1 && (
						<div className="flex w-full flex-col items-center justify-between gap-2">
							<SchedulesWorkingShiftList
								mode={PersonnelSelectionType.multiPersonnel}
								setCalDisabled={setCalDisabled}
								setColorAndId={setColorAndWorkShiftId}
								setCurrentWorkingRegulationId={setCurrent}
								currentWorkingRegulationId={current}
							/>
							<div className="flex w-full flex-col justify-end gap-4">
								<ScheduleCalendar
									mode={PersonnelSelectionType.multiPersonnel}
									setEmptyCal={setMakeCalEmpty}
									emptyCal={makeCalEmpty}
									disabled={isCalDisabled}
									setDate={setFormData}
									colorAndId={colorsAndWorkShift}
									setColorAndId={setColorAndWorkShiftId}
									currentWorkingRegulationId={current}
								/>
								<Button
									type="submit"
									disabled={
										!isValidInitialFormObj(formData) ||
										query.isSubmittingFrom ||
										!!error
									}
									onClick={() => query.onFormSubmit(formData)}
									className="flex w-fit gap-2 self-end px-8"
								>
									<FaPencilAlt width={20} />
									{query.isSubmittingFrom ? <Loading /> : "ثبت تغییرات"}
								</Button>
								{step > 1 && (
									<div className="flex h-16 items-center gap-3 self-end">
										{submit.submitted ? (
											<Button
												onClick={reloadClickHandler}
												className="flex items-center gap-2 text-primary-600"
											>
												<TbRotateClockwise width={50} height={50} />
												بارگذاری مجدد فرم
											</Button>
										) : (
											<></>
										)}
									</div>
								)}
								{query.step > 1 && (
									<ScheduleGuide
										formData={formData}
										colorAndId={colorsAndWorkShift}
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
