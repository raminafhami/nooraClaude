"use client";

import moment from "moment";
import { useCallback, useEffect, useState } from "react";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { useFormContext } from "react-hook-form";
import DatePicker, { DateObject } from "react-multi-date-picker";
import { z } from "zod";

import GetInstanceFile from "@/api/inspection/getInstanceFile";
import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import { Label } from "@/components/ui/label";
import { addWatcherToInstance } from "@/felo/instances/services/addWatcherToInstance";
import { getInstanceById } from "@/felo/instances/services/getInstanceById";
import { useTaskContext } from "@/felo/tasks/hooks/useTaskContext";
import {
  inspectionMethod,
  InspectionMethod,
} from "@/inspection/models/InspectionMethod";

import { DocumentsView } from "../../../../../felo/files/components/documents-view/DocumentsView";
import { Ids } from "../../data";
import FindUser from "../../modules/FindUser";
import { schema } from "./PhaseSchema";

type FormData = z.infer<typeof schema>;

export function PhasePage() {
	const { identity } = useLoggedInUser();

	const {
		formState: { errors },
		register,
		resetField,
		setValue,
		trigger,
		watch,
	} = useFormContext<FormData>();

	const fields = watch();

	const {
		task: { data, userId, instanceId },
		hooks,
	} = useTaskContext();

	const [loading, setLoading] = useState<boolean>(false);
	const [user, setUser] = useState<any>();
	const [fileId, setFileId] = useState<any>();
	const [assigneeType, setAssigneeType] = useState<string>();
	const [inspectorType, setInspectorType] = useState<string>();
	const [open, setOpen] = useState<boolean>(false);
	const getInstanceData = useCallback(
		async function () {
			const res = await getInstanceById(fields.InspectionInstanceId, [
				"InspectionMethod",
				"CustomName",
			]);
			setValue("InspectionData", res);
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[fields.InspectionInstanceId],
	);

	useEffect(() => {
		register("InspectorAssignee", { required: "این فیلد اجباری است" });
		register("ScheduleDate", { required: "این فیلد اجباری است" });
		register("InspectorPhone", { required: "این فیلد اجباری است" });
	}, [register]);

	useEffect(() => {
		getInstanceData();
	}, [getInstanceData]);

	useEffect(() => {
		if (assigneeType === "user" && user?.length) {
			addWatcherToInstance(instanceId, user?.id);
			setValue("InspectorAssignee", user?.id);
			setValue("InspectorName", `${user?.name} ${user?.lastname}`);
			setValue("InspectorPhone", `${user?.phoneNo}`);
		}
		if (assigneeType === "me" && userId) {
			addWatcherToInstance(instanceId, userId);
			setValue("InspectorAssignee", userId);
			setValue("InspectorName", fields[Ids.inspectionExpertName]);
		}

		if (inspectorType?.length) {
			addWatcherToInstance(instanceId, userId!);
			setValue("Inspectortype", inspectorType);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user, assigneeType, userId, inspectorType]);

	useEffect(() => {
		if (hooks.get().length === 0) {
			hooks.registerHook("submit", ({ task, data }) => {
				addWatcherToInstance(task.instanceId, data["InspectorAssignee"]);
			});
		}
	}, [hooks]);

	return (
		<>
			{data[Ids.inspectionInstanceId] && (
				<DocumentsView
					title="مدارک فایل بازرسی"
					instanceId={data[Ids.inspectionInstanceId]}
					folders={["docs"]}
				/>
			)}

			<div className="col-span-9 col-start-1 flex flex-wrap items-center justify-start rounded-xl border-x-4 border-gray-200 bg-gray-100 p-1 px-10">
				<div className="flex flex-col">
					<label className="mx-[1.5rem] mt-[.5rem] select-none">
						نوع بازرسی
					</label>
					<input
						readOnly
						disabled
						value={
							`${fields[Ids.inspectionData]?.name} ${
								inspectionMethod[
									fields[Ids.inspectionData]?.parameters
										?.InspectionMethod as InspectionMethod
								]
									? `(${
											inspectionMethod[
												fields[Ids.inspectionData]?.parameters
													?.InspectionMethod as InspectionMethod
											]
										})`
									: ""
							}` || "-"
						}
						className={`group relative mx-[1rem] mb-[1rem] mt-[1rem] text-ellipsis rounded-2xl border-2 border-white bg-white py-2 pl-[2.8rem] pr-[.5rem] text-[.9rem] placeholder-gray-400 focus:border-blue-500 focus:text-black focus:outline-0`}
						placeholder={"شماره فایل"}
					/>
				</div>
				<div className="flex flex-col">
					<label className="mx-[1.5rem] mt-[.5rem] select-none">
						شماره فایل
					</label>
					<input
						readOnly
						disabled
						value={fields[Ids.inspectionCaseNo] ?? "-"}
						className={`group relative mx-[1rem] mb-[1rem] mt-[1rem] text-ellipsis rounded-2xl border-2 border-white bg-white py-2 pl-[2.8rem] pr-[.5rem] text-[.9rem] placeholder-gray-400 focus:border-blue-500 focus:text-black focus:outline-0`}
						placeholder={"شماره فایل"}
					/>
				</div>
				<div className="flex flex-col">
					<label className="mx-[1.5rem] mt-[.5rem] select-none">
						شماره ترخیص کار
					</label>
					<input
						readOnly
						disabled
						value={
							fields[Ids.dischargerPhoneNo]
								? fields[Ids.dischargerPhoneNo]
								: "-"
						}
						className={`group relative mx-[1rem] mb-[1rem] mt-[1rem] text-ellipsis rounded-2xl border-2 border-white bg-white py-2 pl-[2.8rem] pr-[.5rem] text-[.9rem] placeholder-gray-400 focus:border-blue-500 focus:text-black focus:outline-0`}
						placeholder={"شماره ترخیص کار"}
					/>
				</div>

				<div className="flex flex-col">
					<label className="mx-[1.5rem] mt-[.5rem] select-none">گمرک</label>
					<input
						readOnly
						disabled
						value={
							fields[Ids.inspectionData]?.parameters?.CustomName
								? fields[Ids.inspectionData]?.parameters?.CustomName
								: "-"
						}
						className={`group relative mx-[1rem] mb-[1rem] mt-[1rem] text-ellipsis rounded-2xl border-2 border-white bg-white py-2 pl-[2.8rem] pr-[.5rem] text-[.9rem] placeholder-gray-400 focus:border-blue-500 focus:text-black focus:outline-0`}
						placeholder={"گمرک"}
					/>
				</div>

				<div className="flex flex-col">
					<label className="mx-[1.5rem] mt-[.5rem] select-none">
						اختصاص به
					</label>
					<select
						onChange={(event) => {
							setAssigneeType(event.target.value);
						}}
						className={`group relative mx-[1rem] mb-[1rem] mt-[1rem] min-w-[230px] text-ellipsis rounded-2xl border-2 border-white bg-white py-2 pl-[2.8rem] pr-[.5rem] text-[.9rem] placeholder-gray-400 focus:border-blue-500 focus:text-black focus:outline-0`}
						defaultValue={assigneeType ? assigneeType : "undefined"}
					>
						<option
							value={"undefined"}
							disabled
							selected={assigneeType ? false : true}
						>
							انتخاب
						</option>
						<option
							value={"me"}
							selected={assigneeType === "me" ? true : false}
						>
							{fields[Ids.inspectionExpertName]}
						</option>
						<option
							value={"user"}
							selected={assigneeType === "user" ? true : false}
						>
							بازرس
						</option>
					</select>
					<p className="mx-[1rem] text-red-600">
						{errors?.InspectorAssignee?.message}
					</p>
				</div>
				{assigneeType === "user" && (
					<FindUser
						user={user}
						open={open}
						setOpen={setOpen}
						setUser={(value: any) => {
							setUser(value);
							setValue("InspectorAssignee", value?.id, {
								shouldDirty: true,
								shouldValidate: true,
							});
							setValue("InspectorName", `${value?.name} ${value?.lastname}`, {
								shouldDirty: true,
							});
						}}
					/>
				)}
				<div className="flex flex-col">
					<label className="mx-[1.5rem] mt-[.5rem] select-none">
						نوع بازرس
					</label>
					<select
						onChange={(event) => {
							setInspectorType(event.target.value);
							setValue("InspectorPhone", event.target.value);
						}}
						className={`group relative mx-[1rem] mb-[1rem] mt-[1rem] min-w-[230px] text-ellipsis rounded-2xl border-2 border-white bg-white py-2 pl-[2.8rem] pr-[.5rem] text-[.9rem] placeholder-gray-400 focus:border-blue-500 focus:text-black focus:outline-0`}
						defaultValue={"undefined"}
					>
						<option value={"undefined"} disabled>
							انتخاب
						</option>
						<option value={"official"}>بازرس رسمی شرکت</option>
						<option value={"freelance"}>آزاد</option>
					</select>
					<p className="mx-[1rem] text-red-600">
						{errors?.InspectorPhone?.message}
					</p>
				</div>
				<div className="flex flex-col">
					<Label className="mx-[1.5rem] mt-[.5rem] select-none">
						تاریخ بازرسی
					</Label>
					<DatePicker
						calendar={persian}
						locale={persian_fa}
						inputClass={`mx-[1rem] min-w-[230px] text-[.9rem] mb-[1rem] mt-[1rem] pl-[2.8rem] pr-[.5rem] border-white border-2 bg-white rounded-2xl group relative text-ellipsis focus:border-blue-500 placeholder-gray-400 focus:text-black py-2 focus:outline-0`}
						placeholder="تاریخ"
						calendarPosition="bottom"
						onFocusedDateChange={(dateFocused, dateClicked) =>
							dateClicked && setValue("ScheduleDate", dateClicked?.toDate())
						}
						value={fields[Ids.scheduleDate]}
						// minDate={moment(new Date()).locale("fa").format("YYYY/MM/DD")}
					/>
					<p className="mx-[1rem] text-red-600">
						{errors?.ScheduleDate?.message?.toString()}
					</p>
				</div>
			</div>
		</>
	);
}
