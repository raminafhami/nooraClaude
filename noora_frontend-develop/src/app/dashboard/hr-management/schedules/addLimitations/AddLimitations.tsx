"use client";
import React, { useState } from "react";
import { FaPencilAlt } from "react-icons/fa";
import { TbRotateClockwise } from "react-icons/tb";

import { Button } from "@/components/ui/button";
import { updatePersonnel } from "@/hrm/personnel/services/updatePersonnel";
import { TimeString } from "@/time/TimeString";
import { Loading } from "@/ui/Loader";

import { SchedulesPersonnelList } from "../SchedulesPersonnelList";
import { PersonnelSelectionType } from "../SchedulesWidget";
import AddLimitationForm from "./AddLimitationForm";

export interface Limitations {
	maxExtraTime: TimeString;
	maxDayLeave: number | undefined;
	maxManualTime: number | undefined;
}

function AddLimitations() {
	const [userIds, setUserIds] = useState<{ userId: [] }>({
		userId: [],
	});

	const [isSubmittingForm, setIsSubmittingForm] = useState(false);

	const [limitations, setLimitations] = useState<Limitations>({
		maxExtraTime: "",
		maxDayLeave: undefined,
		maxManualTime: undefined,
	});

	const [submit, setSubmit] = useState({
		submitted: false,
		error: false,
		message: "",
	});

	const reloadClickHandler = () => {
		setUserIds({ userId: [] });
		setSubmit({ submitted: false, error: false, message: "" });
		setLimitations({
			maxExtraTime: "",
			maxDayLeave: undefined,
			maxManualTime: undefined,
		});
	};

	const onLimitationsChange = (
		change:
			| { maxDayLeave: Limitations["maxDayLeave"] }
			| { maxExtraTime: Limitations["maxExtraTime"] }
			| { maxManualTime: Limitations["maxManualTime"] },
	) => {
		setLimitations((prev) => {
			return { ...prev, ...change };
		});
	};

	const fetchAllUpdateRequests = async () => {
		try {
			setIsSubmittingForm(true);
			const requests = userIds.userId.map(async (i) => {
				const updateResponse = await updatePersonnel(i, limitations);
				return updateResponse;
			});
			const responses = await Promise.all(requests);
			if (requests.length === responses.length) {
				setSubmit({ submitted: true, error: false, message: "" });
			}
		} catch (error) {
			setSubmit({
				submitted: true,
				error: true,
				message: "مشکلی پیش آمده‌است",
			});
		} finally {
			setIsSubmittingForm(false);
		}
	};

	return (
		<div className="flex max-w-screen-2xl flex-col justify-start">
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
				<div className="flex flex-row flex-wrap gap-x-12 gap-y-4">
					<div className="w-full sm:max-w-[18rem]">
						<SchedulesPersonnelList
							mode={PersonnelSelectionType.multiPersonnel}
							formData={userIds}
							changeForm={setUserIds}
						/>
					</div>

					<div className="flex flex-col items-center gap-2">
						<AddLimitationForm
							onLimitationsChange={onLimitationsChange}
							limitations={limitations}
						/>
						<div className="ms-[5.4rem] flex w-fit flex-col items-center gap-y-3">
							<Button
								type="submit"
								disabled={!userIds.userId.length}
								onClick={fetchAllUpdateRequests}
								className="flex w-28 gap-2 px-4"
							>
								<FaPencilAlt width={20} />
								{isSubmittingForm ? <Loading /> : "ثبت"}
							</Button>

							{submit.submitted ? (
								<button
									onClick={reloadClickHandler}
									className="flex gap-2 text-primary-600"
								>
									<TbRotateClockwise width={50} height={50} />
									بارگذاری مجدد فرم
								</button>
							) : (
								<></>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default AddLimitations;
