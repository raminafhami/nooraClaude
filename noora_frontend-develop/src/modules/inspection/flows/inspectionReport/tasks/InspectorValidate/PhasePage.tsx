"use client";

import "../../modules/map/index";

import moment from "moment-jalaali";
import { useEffect, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import { BsChatSquareText } from "react-icons/bs";
import { toast } from "sonner";
import { z } from "zod";

import GetInspectionFile from "@/api/inspection/getInspectionFile";
import AddNewTicket from "@/app/dashboard/tickets-list/_components/modal/AddNewTicket";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DocumentsView } from "@/felo/files/components/documents-view/DocumentsView";
import { useTaskContext } from "@/felo/tasks/hooks/useTaskContext";

import { Ids } from "../../data";
import InspectionTabs from "../../modules/InspectionTabs";
import { parseDevice } from "../../modules/map/DeviceDetector";
import { schema } from "../InspectorSelection/PhaseSchema";

type FormData = z.infer<typeof schema>;

export function PhasePage() {
	const { setValue, watch } = useFormContext<FormData>();

	const fields = watch();

	const {
		task: { data, userId, instanceId },
	} = useTaskContext();

	const [isModal, setIsModal] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(false);
	const [clientDevice, setClientDevice] = useState<any>(undefined);
	const [latitude, setLatitude] = useState<number>(+fields[Ids.latitude]);
	const [longitude, setLongitude] = useState<number>(+fields[Ids.longitude]);
	const [filesId, setFilesId] = useState<any>([]);
	const [tabIndex, setTabIndex] = useState<number>(0);

	async function getFilesId() {
		setLoading(true);
		try {
			let res = await GetInspectionFile({ processInstanceId: instanceId });
			if (res) {
				setTimeout(() => {
					setFilesId(res.result.files);
					setLoading(false);
				}, 100);
			}
		} catch {
			setLoading(false);
			toast.error("خطایی در دریافت عکس ها رخ داد!");
		}
		setLoading(false);
	}

	useEffect(() => {
		getFilesId();
		const userAgent = navigator.userAgent;
		const deviceType = parseDevice(userAgent);
		deviceType.then((res) => {
			setClientDevice(res);
		});
		setLoading(false);
	}, []);
	// const { dispatch } = useContext(TaskDetailsContext);

	// useEffect(() => {
	//   dispatch({ type: "update", options: { saveBtn: true } });
	// }, [dispatch]);

	// const handleAdd = () => {

	// };

	// useEffect(() => {
	//   if (hooks.get().length === 0) {
	//     hooks.registerHook("pre-submit", async ({ data, task }) => {
	//       const currentValues = Array.isArray(data["RejectDescriptionList"])
	//         ? [...data["RejectDescriptionList"]]
	//         : [];

	//       data["RejectDescriptionList"] = [
	//         ...currentValues,
	//         {
	//           description: newDescriptionValue,
	//           date: new Date().toISOString(),
	//         },
	//       ];

	//       console.log(data["RejectDescriptionList"]);
	//       setNewDescriptionValue("");
	//     });
	//   }
	// }, [hooks, newDescriptionValue]);

	return (
		<>
			{data[Ids.inspectionInstanceId] && (
				<DocumentsView
					title="مدارک فایل بازرسی"
					instanceId={data[Ids.inspectionInstanceId]}
					folders={["docs"]}
				/>
			)}

			{isModal && (
				<AddNewTicket
					key={"addTicket"}
					isShow={isModal}
					setShow={setIsModal}
					isExternal
					caseNumber={fields[Ids.inspectionCaseNo]}
					refType="instance-inspection"
					userId={fields[Ids.inspectorAssignee]}
				/>
			)}
			<button
				type="button"
				onClick={() => setIsModal(true)}
				className="btn float-left my-10 ml-10 flex cursor-pointer select-none items-center rounded-md bg-blue-500 p-3 text-white hover:bg-blue-700"
			>
				<>
					<BsChatSquareText size={20} className="ml-1" /> تیکت به بازرس
				</>
			</button>
			<div className="col-span-9 col-start-1 items-center justify-center rounded-xl border-x-4 border-gray-200 bg-gray-100 p-1 px-5">
				<InspectionTabs
					setTabIndex={setTabIndex}
					tabIndex={tabIndex}
					setValue={setValue}
					fields={fields}
					clientDevice={clientDevice}
					instanceId={instanceId}
					latitude={latitude}
					loading={loading}
					longitude={longitude}
					setLoading={setLoading}
					data={data}
					isValidate
				/>
			</div>
			<div className="relative my-4 flex flex-col">
				<label className="my-[.5rem] select-none">وضعیت نهایی</label>
				<Select
					onValueChange={(value) => setValue("Status", value)}
					defaultValue={fields[Ids.status]}
					dir="rtl"
				>
					<SelectTrigger className="w-[180px]">
						<SelectValue placeholder="انتخاب" />
					</SelectTrigger>
					<SelectContent>
						<SelectGroup>
							<SelectLabel>وضعیت نهایی</SelectLabel>
							<SelectItem value="accept">تایید</SelectItem>
							<SelectItem value="reject">بازرسی مجدد</SelectItem>
						</SelectGroup>
					</SelectContent>
				</Select>
				<div className="mx-1 my-2">
					{data[Ids.rejectDescriptionList]?.length && (
						<label className="mx-[1.5rem] mt-[.5rem] select-none">
							توضیحات قبلی
						</label>
					)}
					{data[Ids.rejectDescriptionList]?.length &&
						data[Ids.rejectDescriptionList]?.map((item: any, index: number) => (
							<div
								key={index}
								className={`group relative mx-[1rem] mb-[1rem] mt-[1rem] min-h-[8rem] resize-none overflow-y-auto text-ellipsis rounded-2xl border-2 border-white bg-gray-100 py-2 pl-[2.8rem] pr-[.5rem] text-[.9rem] placeholder-gray-400 focus:border-blue-500 focus:text-black focus:outline-0`}
							>
								{item?.description}
								<p className="absolute bottom-0 left-0">
									{moment(item?.date).format("HH:mm - jYYYY/jM/jD")}
								</p>
							</div>
						))}
				</div>
				<div className="mt-3 flex flex-col">
					<label className="mx-[1.5rem] mt-[.5rem] select-none">توضیحات</label>
					<textarea
						onChange={(event) => {
							const currentValues = Array.isArray(data["RejectDescriptionList"])
								? [...data["RejectDescriptionList"]]
								: [];

							setValue("RejectDescriptionList", [
								...currentValues,
								{
									description: event.target.value,
									date: new Date().toISOString(),
								},
							]);
						}}
						value={
							fields["RejectDescriptionList"] &&
							fields["RejectDescriptionList"]?.at(-1)?.description
						}
						className={`group relative mx-[1rem] mb-[1rem] mt-[1rem] min-h-[10rem] resize-none text-ellipsis rounded-2xl border-2 border-white bg-gray-100 py-2 pl-[2.8rem] pr-[.5rem] text-[.9rem] placeholder-gray-400 focus:border-blue-500 focus:text-black focus:outline-0`}
						placeholder={"توضیحات"}
					/>
				</div>
			</div>
		</>
	);
}
