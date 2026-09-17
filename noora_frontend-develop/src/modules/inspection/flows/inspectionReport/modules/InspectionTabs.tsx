"use client";

import { useEffect, useState } from "react";
import { BsCameraReelsFill, BsChatSquareText } from "react-icons/bs";
import { FaPlus } from "react-icons/fa";
import { FiAlertTriangle } from "react-icons/fi";
import { IoChevronUp } from "react-icons/io5";
import { DateObject } from "react-multi-date-picker";
import { toast } from "sonner";

import GetInspectionFile from "@/api/inspection/getInspectionFile";
import PostInspectionFile from "@/api/inspection/postInspectionFile";
import { useTaskContext } from "@/felo/tasks/hooks/useTaskContext";
import FileInput from "@/ui/FileInput";
import { Disclosure, Tab } from "@headlessui/react";

import { Ids } from "../data";
import { DocumentTypes } from "../data/DocumentTypes";
import IVR from "./IVRData";
import { PageTicket } from "./PageTicket";
import PDFGenerator from "./PDFGenerator";
import QuantityControl from "./QuantityControl";

interface Props {
	clientDevice: any;
	loading: boolean;
	setLoading: (state: boolean) => void;
	instanceId: string;
	latitude: number;
	longitude: number;
	fields: any;
	setValue: any;
	data: any;
	tabIndex: number;
	setTabIndex: (tab: number) => void;
	isValidate?: boolean;
}

interface formAttribuiteProps {
	paymentDate?: string | DateObject;
	subject: string;
}

export default function InspectionTabs({
	clientDevice,
	loading,
	setLoading,
	instanceId,
	latitude,
	longitude,
	fields,
	setValue,
	data,
	tabIndex,
	setTabIndex,
	isValidate,
}: Props) {
	const [formAttribuite, setFormAttribuite] = useState<formAttribuiteProps>();
	const [file, setFile] = useState<any>();
	const [filesId, setFilesId] = useState<any>([]);
	const [inputs, setInputs] = useState<any>(
		fields[Ids.quantityControl] ?? [{ name: "", from: "", to: "" }],
	);

	function classNames(...classes: any) {
		return classes.filter(Boolean).join(" ");
	}

	const handleAddInput = () => {
		setInputs([...inputs, { name: "", from: "", to: "" }]);
	};

	async function postFile(file: any, category?: string, description?: string) {
		setLoading(true);
		const filesArray = Object.values(file).map((key) => key);
		try {
			let res = await PostInspectionFile({
				files: filesArray,
				processInstanceId: instanceId,
				category,
				description,
			});
			if (res) {
				setTimeout(() => {
					toast.success("با موفقیت اضافه شد!");
					setLoading(false);
				}, 100);
			}
		} catch (error) {
			setLoading(false);
			toast.error("خطایی رخ داد!");
			console.error(error);
		}
	}

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
		} catch (e) {
			console.error(e);
			setLoading(false);
			toast.error("خطایی در دریافت عکس ها رخ داد!");
		}
	}

	const { dispatch } = useTaskContext();

	useEffect(() => {
		if (tabIndex === 2) {
			getFilesId();
		}
	}, [tabIndex]);

	useEffect(() => {
		dispatch({ type: "update", options: { saveBtn: true } });
	}, [dispatch]);

	return (
		<Tab.Group selectedIndex={tabIndex}>
			<Tab.List className="my-2 flex w-full justify-start overflow-auto py-4">
				<Tab
					onClick={() => setTabIndex(0)}
					accessKey="text"
					className={({ selected }) =>
						classNames(
							"mx-2 min-w-[8rem] rounded-lg py-2.5 text-sm font-medium leading-5",
							"ring-white/60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2",
							selected
								? "bg-white text-blue-700 shadow"
								: "bg-white text-gray-400 hover:bg-blue-100 hover:text-blue-700",
						)
					}
				>
					گزارش متنی
				</Tab>
				<Tab
					onClick={() => setTabIndex(1)}
					className={({ selected }) =>
						classNames(
							"mx-2 min-w-[8rem] rounded-lg py-2.5 text-sm font-medium leading-5",
							"ring-white/60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2",
							selected
								? "bg-white text-blue-700 shadow"
								: "bg-white text-gray-400 hover:bg-blue-100 hover:text-blue-700",
						)
					}
				>
					تصاویر
				</Tab>
				<Tab
					onClick={() => {
						setTabIndex(2);
					}}
					className={({ selected }) =>
						classNames(
							"mx-2 min-w-[8rem] rounded-lg py-2.5 text-sm font-medium leading-5",
							"ring-white/60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2",
							selected
								? "bg-white text-blue-700 shadow"
								: "bg-white text-gray-400 hover:bg-blue-100 hover:text-blue-700",
						)
					}
				>
					گزارش نهایی
				</Tab>
				<Tab
					onClick={() => setTabIndex(3)}
					className={({ selected }) =>
						classNames(
							"mx-2 min-w-[8rem] rounded-lg py-2.5 text-sm font-medium leading-5",
							"ring-white/60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2",
							selected
								? "bg-white text-blue-700 shadow"
								: "bg-white text-gray-400 hover:bg-blue-100 hover:text-blue-700",
						)
					}
				>
					<BsChatSquareText size={15} className="ml-2 inline" />
					تیکت ها
				</Tab>
			</Tab.List>
			<Tab.Panels>
				<Tab.Panel id="text">
					<div className="mt-3 flex flex-col">
						<label className="mx-[1.5rem] mt-[.5rem] select-none">
							ابزارهای بکار رفته (در صورت کاربرد) / Inspection tools (if any)
						</label>
						<textarea
							onChange={(event) =>
								setValue("InspectionTools", event.target.value)
							}
							value={fields[Ids.inspectionTools]}
							className={`group relative mx-[1rem] mb-[1rem] mt-[1rem] min-h-[10rem] resize-none text-ellipsis rounded-2xl border-2 border-white bg-white py-2 pl-[2.8rem] pr-[.5rem] text-[.9rem] placeholder-gray-400 focus:border-blue-500 focus:text-black focus:outline-0`}
							placeholder={" ابزارهای بکار رفته "}
						/>
					</div>
					{/* <div className="flex flex-col mt-3">
              <label className=" mt-[.5rem] mx-[1.5rem] select-none">
                کنترل گزارش / Quantity control report/Quantity
              </label>
              <textarea
                onChange={(event) =>
                  setValue("QuantityReport", event.target.value)
                }
                value={fields[Ids.quantityReport]}
                className={`mx-[1rem] min-h-[10rem] resize-none text-[.9rem] mb-[1rem] mt-[1rem] pl-[2.8rem] pr-[.5rem] border-white border-2 bg-white rounded-2xl group relative text-ellipsis focus:border-blue-500 placeholder-gray-400 focus:text-black py-2 focus:outline-0`}
                placeholder={"کنترل گزارش"}
              />
            </div>
            <div className="flex flex-col mt-3">
              <label className=" mt-[.5rem] mx-[1.5rem] select-none">
                گزارش کنترل بسته‌بندی / Packaging control report
              </label>
              <textarea
                onChange={(event) =>
                  setValue("PackingReport", event.target.value)
                }
                value={fields[Ids.packingReport]}
                className={`mx-[1rem] min-h-[10rem] resize-none text-[.9rem] mb-[1rem] mt-[1rem] pl-[2.8rem] pr-[.5rem] border-white border-2 bg-white rounded-2xl group relative text-ellipsis focus:border-blue-500 placeholder-gray-400 focus:text-black py-2 focus:outline-0`}
                placeholder={"گزارش کنترل بسته‌بندی"}
              />
            </div> */}
					<div className="mt-3 flex flex-col">
						<label className="mx-[1.5rem] mt-[.5rem] select-none">
							مربوط به بارگیری (شامل شماره کانتینر ها یا اطلاعات)
						</label>
						<textarea
							onChange={(event) =>
								setValue("LoadingReport", event.target.value)
							}
							value={fields[Ids.loadingReport]}
							className={`group relative mx-[1rem] mb-[1rem] mt-[1rem] min-h-[10rem] resize-none text-ellipsis rounded-2xl border-2 border-white bg-white py-2 pl-[2.8rem] pr-[.5rem] text-[.9rem] placeholder-gray-400 focus:border-blue-500 focus:text-black focus:outline-0`}
							placeholder={"مربوط به بارگیری"}
						/>
					</div>
					<div className="mt-3 flex flex-col">
						<label className="mx-[1.5rem] mt-[.5rem] select-none">
							فروشنده
						</label>
						<input
							onChange={(event) => setValue("Seller", event.target.value)}
							value={fields[Ids.seller]}
							className={`group relative mx-[1rem] mb-[1rem] mt-[1rem] text-ellipsis rounded-2xl border-2 border-white bg-white py-2 pl-[2.8rem] pr-[.5rem] text-[.9rem] placeholder-gray-400 focus:border-blue-500 focus:text-black focus:outline-0`}
							placeholder={"فروشنده"}
						/>
					</div>
					<div className="relative flex flex-col">
						<label className="mx-[1.5rem] my-[.5rem] select-none">
							QUANTITY
						</label>

						<select
							onChange={(event) => setValue("Quantity", event.target.value)}
							value={fields[Ids.quantity]}
							className={`group relative mx-[1rem] mb-[1rem] w-[300px] text-ellipsis rounded-2xl border-2 border-white bg-white px-2 py-2 pl-[2.8rem] pr-[2rem] text-[.9rem] placeholder-gray-400 focus:border-blue-500 focus:text-black focus:outline-0`}
							defaultValue={
								fields[Ids.quantity] ? fields[Ids.quantity] : "undefined"
							}
						>
							<option
								value={"undefined"}
								disabled
								selected={fields[Ids.quantity] ? false : true}
							>
								انتخاب
							</option>
							<option
								value={"OKAY"}
								selected={fields[Ids.quantity] === "OKAY" ? true : false}
							>
								CONFIRM
							</option>
							<option
								value={"NOTOKAY"}
								selected={fields[Ids.quantity] === "NOTOKAY" ? true : false}
							>
								REJECT
							</option>
							<option
								value={"NA"}
								selected={fields[Ids.quantity] === "NA" ? true : false}
							>
								N/A
							</option>
						</select>
					</div>
					{fields[Ids.quantity] === "NOTOKAY" && (
						<div className="mt-3 flex flex-col">
							<label className="mx-[1.5rem] mt-[.5rem] select-none">
								توضیحات
							</label>
							<textarea
								onChange={(event) =>
									setValue("QuantityDes", event.target.value)
								}
								value={fields[Ids.quantityDes]}
								className={`group relative mx-[1rem] mb-[1rem] mt-[1rem] min-h-[10rem] resize-none text-ellipsis rounded-2xl border-2 border-white bg-white py-2 pl-[2.8rem] pr-[.5rem] text-[.9rem] placeholder-gray-400 focus:border-blue-500 focus:text-black focus:outline-0`}
								placeholder={"توضیحات"}
							/>
						</div>
					)}

					<div className="relative flex flex-col">
						<label className="mx-[1.5rem] my-[.5rem] select-none">
							APPEARANCE
						</label>

						<select
							onChange={(event) => setValue("Appearence", event.target.value)}
							value={fields[Ids.appearence]}
							className={`group relative mx-[1rem] mb-[1rem] w-[300px] text-ellipsis rounded-2xl border-2 border-white bg-white px-2 py-2 pl-[2.8rem] pr-[2rem] text-[.9rem] placeholder-gray-400 focus:border-blue-500 focus:text-black focus:outline-0`}
							defaultValue={
								fields[Ids.appearence] ? fields[Ids.appearence] : "undefined"
							}
						>
							<option
								value={"undefined"}
								disabled
								selected={fields[Ids.appearence] ? false : true}
							>
								انتخاب
							</option>
							<option
								value={"OKAY"}
								selected={fields[Ids.appearence] === "OKAY" ? true : false}
							>
								CONFIRM
							</option>
							<option
								value={"NOTOKAY"}
								selected={fields[Ids.appearence] === "NOTOKAY" ? true : false}
							>
								REJECT
							</option>
							<option
								value={"NA"}
								selected={fields[Ids.appearence] === "NA" ? true : false}
							>
								N/A
							</option>
						</select>
					</div>
					{fields[Ids.appearence] === "NOTOKAY" && (
						<div className="mt-3 flex flex-col">
							<label className="mx-[1.5rem] mt-[.5rem] select-none">
								توضیحات
							</label>
							<textarea
								onChange={(event) =>
									setValue("AppearenceDes", event.target.value)
								}
								value={fields[Ids.appearenceDes]}
								className={`group relative mx-[1rem] mb-[1rem] mt-[1rem] min-h-[10rem] resize-none text-ellipsis rounded-2xl border-2 border-white bg-white py-2 pl-[2.8rem] pr-[.5rem] text-[.9rem] placeholder-gray-400 focus:border-blue-500 focus:text-black focus:outline-0`}
								placeholder={"توضیحات"}
							/>
						</div>
					)}

					<div className="relative flex flex-col">
						<label className="mx-[1.5rem] my-[.5rem] select-none">
							MARKING LABEL
						</label>

						<select
							onChange={(event) =>
								setValue("MarketingLabel", event.target.value)
							}
							value={fields[Ids.marketingLabel]}
							className={`group relative mx-[1rem] mb-[1rem] w-[300px] text-ellipsis rounded-2xl border-2 border-white bg-white px-2 py-2 pl-[2.8rem] pr-[2rem] text-[.9rem] placeholder-gray-400 focus:border-blue-500 focus:text-black focus:outline-0`}
							defaultValue={
								fields[Ids.marketingLabel]
									? fields[Ids.marketingLabel]
									: "undefined"
							}
						>
							<option
								value={"undefined"}
								disabled
								selected={fields[Ids.marketingLabel] ? false : true}
							>
								انتخاب
							</option>
							<option
								value={"OKAY"}
								selected={fields[Ids.marketingLabel] === "OKAY" ? true : false}
							>
								CONFIRM
							</option>
							<option
								value={"NOTOKAY"}
								selected={
									fields[Ids.marketingLabel] === "NOTOKAY" ? true : false
								}
							>
								REJECT
							</option>
							<option
								value={"NA"}
								selected={fields[Ids.marketingLabel] === "NA" ? true : false}
							>
								N/A
							</option>
						</select>
					</div>
					{fields[Ids.marketingLabel] === "NOTOKAY" && (
						<div className="mt-3 flex flex-col">
							<label className="mx-[1.5rem] mt-[.5rem] select-none">
								توضیحات
							</label>
							<textarea
								onChange={(event) =>
									setValue("MarketingLabelDes", event.target.value)
								}
								value={fields[Ids.marketingLabelDes]}
								className={`group relative mx-[1rem] mb-[1rem] mt-[1rem] min-h-[10rem] resize-none text-ellipsis rounded-2xl border-2 border-white bg-white py-2 pl-[2.8rem] pr-[.5rem] text-[.9rem] placeholder-gray-400 focus:border-blue-500 focus:text-black focus:outline-0`}
								placeholder={"توضیحات"}
							/>
						</div>
					)}

					<div className="relative flex flex-col">
						<label className="mx-[1.5rem] my-[.5rem] select-none">
							TESTING / DATA MEASUREMENT
						</label>

						<select
							onChange={(event) => setValue("Testing", event.target.value)}
							value={fields[Ids.testing]}
							className={`group relative mx-[1rem] mb-[1rem] w-[300px] text-ellipsis rounded-2xl border-2 border-white bg-white px-2 py-2 pl-[2.8rem] pr-[2rem] text-[.9rem] placeholder-gray-400 focus:border-blue-500 focus:text-black focus:outline-0`}
							defaultValue={
								fields[Ids.testing] ? fields[Ids.testing] : "undefined"
							}
						>
							<option
								value={"undefined"}
								disabled
								selected={fields[Ids.testing] ? false : true}
							>
								انتخاب
							</option>
							<option
								value={"OKAY"}
								selected={fields[Ids.testing] === "OKAY" ? true : false}
							>
								CONFIRM
							</option>
							<option
								value={"NOTOKAY"}
								selected={fields[Ids.testing] === "NOTOKAY" ? true : false}
							>
								REJECT
							</option>
							<option
								value={"NA"}
								selected={fields[Ids.testing] === "NA" ? true : false}
							>
								N/A
							</option>
						</select>
					</div>
					{fields[Ids.testing] === "NOTOKAY" && (
						<div className="mt-3 flex flex-col">
							<label className="mx-[1.5rem] mt-[.5rem] select-none">
								توضیحات
							</label>
							<textarea
								onChange={(event) => setValue("TestingDes", event.target.value)}
								value={fields[Ids.testingDes]}
								className={`group relative mx-[1rem] mb-[1rem] mt-[1rem] min-h-[10rem] resize-none text-ellipsis rounded-2xl border-2 border-white bg-white py-2 pl-[2.8rem] pr-[.5rem] text-[.9rem] placeholder-gray-400 focus:border-blue-500 focus:text-black focus:outline-0`}
								placeholder={"توضیحات"}
							/>
						</div>
					)}
					<div className="relative flex flex-col">
						<label className="mx-[1.5rem] my-[.5rem] select-none">
							INSPECTION OVERALL CONCLUSION
						</label>

						<select
							onChange={(event) =>
								setValue("InspectionOverall", event.target.value)
							}
							value={fields[Ids.inspectionOverall]}
							className={`group relative mx-[1rem] mb-[1rem] w-[300px] text-ellipsis rounded-2xl border-2 border-white bg-white px-2 py-2 pl-[2.8rem] pr-[2rem] text-[.9rem] placeholder-gray-400 focus:border-blue-500 focus:text-black focus:outline-0`}
							defaultValue={
								fields[Ids.inspectionOverall]
									? fields[Ids.inspectionOverall]
									: "undefined"
							}
						>
							<option
								value={"undefined"}
								disabled
								selected={fields[Ids.inspectionOverall] ? false : true}
							>
								انتخاب
							</option>
							<option
								value={"ACCEPTED"}
								selected={
									fields[Ids.inspectionOverall] === "ACCEPTED" ? true : false
								}
							>
								ACCEPTED
							</option>
							<option
								value={"PENDING"}
								selected={
									fields[Ids.inspectionOverall] === "PENDING" ? true : false
								}
							>
								PENDING
							</option>
							<option
								value={"FAILED"}
								selected={
									fields[Ids.inspectionOverall] === "FAILED" ? true : false
								}
							>
								FAILED
							</option>
						</select>
					</div>

					<div className="relative flex flex-col">
						<label className="mx-[1.5rem] my-[.5rem] flex select-none items-center">
							Packed Quantity
							<button type="button" onClick={handleAddInput}>
								<FaPlus
									size={16}
									className="mr-2 text-blue-500 hover:text-blue-600"
								/>
							</button>
						</label>

						<QuantityControl
							setInputs={(value) => {
								setInputs(value);
								setValue("QuantityControl", value);
							}}
							inputs={inputs}
						/>
					</div>

					<div className="mt-3 flex flex-col">
						<label className="mx-[1.5rem] mt-[.5rem] select-none">
							سایر توضیحات
						</label>
						<textarea
							onChange={(event) => setValue("Description", event.target.value)}
							value={fields[Ids.description]}
							className={`group relative mx-[1rem] mb-[1rem] mt-[1rem] min-h-[10rem] resize-none text-ellipsis rounded-2xl border-2 border-white bg-white py-2 pl-[2.8rem] pr-[.5rem] text-[.9rem] placeholder-gray-400 focus:border-blue-500 focus:text-black focus:outline-0`}
							placeholder={"سایر توضیحات"}
						/>
					</div>

					<div className="mt-3 flex flex-col">
						<label className="mx-[1.5rem] mt-[.5rem] select-none">
							Factory Gate
						</label>
						<textarea
							onChange={(event) =>
								setValue("FactoryGateNote", event.target.value)
							}
							value={fields[Ids.factoryGateNote]}
							className={`group relative mx-[1rem] mb-[1rem] mt-[1rem] min-h-[10rem] resize-none text-ellipsis rounded-2xl border-2 border-white bg-white py-2 pl-[2.8rem] pr-[.5rem] text-[.9rem] placeholder-gray-400 focus:border-blue-500 focus:text-black focus:outline-0`}
							placeholder={"Factory Gate Note"}
						/>
					</div>
					<div className="mt-3 flex flex-col">
						<label className="mx-[1.5rem] mt-[.5rem] select-none">
							Appearance
						</label>
						<textarea
							onChange={(event) =>
								setValue("AppearanceNote", event.target.value)
							}
							value={fields[Ids.appearanceNote]}
							className={`group relative mx-[1rem] mb-[1rem] mt-[1rem] min-h-[10rem] resize-none text-ellipsis rounded-2xl border-2 border-white bg-white py-2 pl-[2.8rem] pr-[.5rem] text-[.9rem] placeholder-gray-400 focus:border-blue-500 focus:text-black focus:outline-0`}
							placeholder={"Appearance Note"}
						/>
					</div>
					<div className="mt-3 flex flex-col">
						<label className="mx-[1.5rem] mt-[.5rem] select-none">
							Marking Label
						</label>
						<textarea
							onChange={(event) =>
								setValue("MarkingLabelNote", event.target.value)
							}
							value={fields[Ids.markingLabelNote]}
							className={`group relative mx-[1rem] mb-[1rem] mt-[1rem] min-h-[10rem] resize-none text-ellipsis rounded-2xl border-2 border-white bg-white py-2 pl-[2.8rem] pr-[.5rem] text-[.9rem] placeholder-gray-400 focus:border-blue-500 focus:text-black focus:outline-0`}
							placeholder={"Marking Label Note"}
						/>
					</div>
					<div className="mt-3 flex flex-col">
						<label className="mx-[1.5rem] mt-[.5rem] select-none">Seals</label>
						<textarea
							onChange={(event) => setValue("SealsNote", event.target.value)}
							value={fields[Ids.sealsNote]}
							className={`group relative mx-[1rem] mb-[1rem] mt-[1rem] min-h-[10rem] resize-none text-ellipsis rounded-2xl border-2 border-white bg-white py-2 pl-[2.8rem] pr-[.5rem] text-[.9rem] placeholder-gray-400 focus:border-blue-500 focus:text-black focus:outline-0`}
							placeholder={"Seals Note"}
						/>
					</div>
					<div className="mt-3 flex flex-col">
						<label className="mx-[1.5rem] mt-[.5rem] select-none">
							Sampling
						</label>
						<textarea
							onChange={(event) => setValue("SamplingNote", event.target.value)}
							value={fields[Ids.samplingNote]}
							className={`group relative mx-[1rem] mb-[1rem] mt-[1rem] min-h-[10rem] resize-none text-ellipsis rounded-2xl border-2 border-white bg-white py-2 pl-[2.8rem] pr-[.5rem] text-[.9rem] placeholder-gray-400 focus:border-blue-500 focus:text-black focus:outline-0`}
							placeholder={"Sampling Note"}
						/>
					</div>
					<div className="mt-3 flex flex-col">
						<label className="mx-[1.5rem] mt-[.5rem] select-none">
							Testing
						</label>
						<textarea
							onChange={(event) => setValue("TestingNote", event.target.value)}
							value={fields[Ids.testingNote]}
							className={`group relative mx-[1rem] mb-[1rem] mt-[1rem] min-h-[10rem] resize-none text-ellipsis rounded-2xl border-2 border-white bg-white py-2 pl-[2.8rem] pr-[.5rem] text-[.9rem] placeholder-gray-400 focus:border-blue-500 focus:text-black focus:outline-0`}
							placeholder={"Testing Note"}
						/>
					</div>
					<div className="mt-3 flex flex-col">
						<label className="mx-[1.5rem] mt-[.5rem] select-none">
							Loading
						</label>
						<textarea
							onChange={(event) => setValue("LoadingNote", event.target.value)}
							value={fields[Ids.loadingNote]}
							className={`group relative mx-[1rem] mb-[1rem] mt-[1rem] min-h-[10rem] resize-none text-ellipsis rounded-2xl border-2 border-white bg-white py-2 pl-[2.8rem] pr-[.5rem] text-[.9rem] placeholder-gray-400 focus:border-blue-500 focus:text-black focus:outline-0`}
							placeholder={"Loading Note"}
						/>
					</div>
				</Tab.Panel>
				<Tab.Panel id="pic">
					{DocumentTypes.map((item, index) => (
						<Disclosure key={index}>
							{({ open }) => (
								<>
									<Disclosure.Button
										className={`relative w-full border py-6 pl-[3rem] text-right ${
											index === 0 && "rounded-t-lg"
										} ${
											index === 5 && !open && "rounded-b-lg"
										} border-gray-200 bg-white px-4 shadow-sm hover:bg-gray-100`}
									>
										{item.label}
										<IoChevronUp
											size={18}
											className={`${
												open ? "rotate-180 transform" : ""
											} absolute left-2 top-[34%] ml-2 h-5 w-5 text-gray-700 transition-all delay-75`}
										/>
									</Disclosure.Button>
									<Disclosure.Panel className="bg-gray-50 px-4 py-4 text-center text-gray-700">
										<div className="my-5">
											{clientDevice?.device?.type === "smartphone" ||
											fields[Ids.inspectorName] ===
												fields[Ids.inspectionExpertName] ? (
												<>
													<FileInput
														key={"image"}
														className="mx-2"
														accept={
															"image/*,image/heic,image/heic-sequence,image/heif,image/heif-sequence"
														}
														// disabled={clientDevice?.device?.type === "desktop"}
														design="inspection"
														loading={loading}
														multiple
														capture="user"
														file={file}
														setFile={(file) => {
															postFile(
																file,
																`${item.value}:image`,
																`latitude:${latitude}-longitude:${longitude}`,
															);
														}}
														tooltip={"فایل"}
														onRemove={() => setFile(undefined)}
													/>
													<FileInput
														key={"video"}
														className="mx-2"
														accept={
															"video/*,video/mp4,video/quicktime,video/x-m4v,video/x-msvideo,video/x-ms-wmv"
														}
														// disabled={clientDevice?.device?.type === "desktop"}
														design="inspection"
														loading={loading}
														multiple
														capture="user"
														file={file}
														setFile={(file) => {
															postFile(
																file,
																`${item.value}:video`,
																`latitude:${latitude}-longitude:${longitude}`,
															);
														}}
														onRemove={() => setFile(undefined)}
														tooltip={"فایل"}
														placeholderIcon={
															<BsCameraReelsFill
																size={"1.2rem"}
																className="cursor-pointer text-gray-500 outline-none hover:text-blue-500"
																data-tooltip-id="uploadFile"
															/>
														}
													/>
												</>
											) : (
												<>
													<FiAlertTriangle className="ml-2 inline text-red-600" />
													<span className="text-red-600">
														امکان بارگزاری عکس تنها با تلفن های هوشمند امکان
														پذیر است.
													</span>
												</>
											)}
										</div>
									</Disclosure.Panel>
								</>
							)}
						</Disclosure>
					))}
				</Tab.Panel>
				<Tab.Panel
					id="ivr-form"
					className={"flex w-full flex-col justify-center"}
				>
					<IVR
						fields={fields}
						filesId={filesId}
						getFilesId={getFilesId}
						latitude={latitude}
						loading={loading}
						longitude={longitude}
						setLoading={setLoading}
					/>
					{!isValidate && (
						<div className="flex w-full justify-center">
							<button className="btn float-left mx-2 my-4 flex cursor-pointer select-none items-center rounded-xl bg-blue-500 p-3 text-white hover:bg-blue-700">
								Final Submit / ثبت نهایی اطلاعات
							</button>
						</div>
					)}
				</Tab.Panel>
			</Tab.Panels>
			<Tab.Panel>
				<PageTicket caseNo={fields[Ids.inspectionCaseNo]} />
			</Tab.Panel>
		</Tab.Group>
	);
}
