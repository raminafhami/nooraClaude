import Image from "next/image";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

import GetInstanceFile from "@/api/inspection/getInstanceFile";
import { useTaskContext } from "@/felo/tasks/hooks/useTaskContext";
import GetAllUserDocuments from "@/identity/userDocuments/services/getAllUserDocuments";
import GetUserDocumentsFile from "@/identity/userDocuments/services/getUserDocumentsFile";
import { Loading } from "@/ui/Loader";
import { Table } from "@/ui/Table";

import { Ids } from "../data";
import ImageCard from "./ImagesCard";
import Map from "./map";
import PDFGenerator from "./PDFGenerator";

interface Props {
	filesId: any;
	setLoading: (state: boolean) => void;
	loading: boolean;
	getFilesId: () => void;
	latitude: number;
	longitude: number;
	fields: any;
}
export default function IVR({
	filesId,
	setLoading,
	loading,
	getFilesId,
	latitude,
	longitude,
	fields,
}: Props) {
	const [fileId, setFileId] = useState<any>();
	const [inspectorSign, setInspectorSign] = useState<any>();
	const [expertSign, setExpertSign] = useState<any>();
	const {
		task: { data, userId, instanceId, key },
	} = useTaskContext();
	async function getFile() {
		setLoading(true);
		try {
			let res = await GetInstanceFile({
				processInstanceId: fields[Ids.inspectionInstanceId],
			});
			if (res) {
				setFileId(res?.result?.files[0]?.id);
			}
		} catch {}
	}

	async function getUserSignature() {
		setLoading(true);
		try {
			let inspectorRes = await GetAllUserDocuments({
				userId: fields[Ids.inspectorAssignee],
				page: 0,
				size: 99,
				key: "signature",
			});
			if (inspectorRes) {
				let inspectorFile = await GetUserDocumentsFile({
					fileId: inspectorRes[0].id,
				});
				if (inspectorFile) {
					setTimeout(() => {
						const files = new File(
							[inspectorFile],
							`${fields[Ids.inspectorName]}-sign` || "",
							{
								type: inspectorFile.type,
							},
						);
						const reader = new FileReader();
						reader.onloadend = () => {
							setInspectorSign(reader.result as string);
						};
						reader.readAsDataURL(files);
						setLoading(false);
					}, 100);
				}
			}
			let expertRes = await GetAllUserDocuments({
				userId: fields[Ids.inspectionExpert],
				page: 0,
				size: 99,
				key: "signature",
			});
			if (expertRes) {
				let expertFile = await GetUserDocumentsFile({
					fileId: inspectorRes[0].id,
				});
				if (expertFile) {
					setTimeout(() => {
						const files = new File(
							[expertFile],
							`${fields[Ids.inspectorName]}-sign` || "",
							{
								type: expertFile.type,
							},
						);
						const reader = new FileReader();
						reader.onloadend = () => {
							setExpertSign(reader.result as string);
						};
						reader.readAsDataURL(files);
						setLoading(false);
					}, 100);
				}
			}
		} catch {
			toast.error("خطایی در دریافت امضا رخ داد!");
		}
	}

	useEffect(() => {
		if (fields[Ids.inspectionInstanceId]) getFile();
	}, [fields[Ids.inspectionInstanceId]]);

	useEffect(() => {
		getUserSignature();
	}, [fields[Ids.inspectionExpert], fields[Ids.inspectorAssignee]]);

	return (
		<>
			<PDFGenerator
				caseNo={fields[Ids.inspectionCaseNo]}
				dynamicContent={
					<div className="w-full border-4">
						<div className="rounded-md bg-white px-4 py-2">
							<div className="my-2 h-[2.5rem] border-b-2 pb-3">
								<span>
									Report reference number/ شماره مرجع گزارش:{" "}
									<span>{fields[Ids.inspectionCaseNo] ?? "-"}</span>
								</span>
							</div>

							<div className="my-2 h-[2.5rem] border-b-2 pb-3">
								<span>
									Name of inspector(s)/ نام بازرس:{" "}
									<span>{fields[Ids.inspectorName] ?? "-"}</span>
								</span>
							</div>

							<div className="my-2 h-[2.5rem] border-b-2 pb-3">
								<span>
									{`Inspector's mobile phone/ تلفن همراه بازرس:`}{" "}
									<span>{fields[Ids.inspectorPhone] ?? "-"}</span>
								</span>
							</div>

							<div className="my-2 h-[2.5rem] border-b-2 pb-3">
								<span>
									Inspector type/ نوع بازرس:{" "}
									<span>
										{fields[Ids.inspectortype] === "official"
											? "company’s official inspector/ بازرس رسمی شرکت"
											: "freelance agent    "}
									</span>
								</span>
							</div>

							<div className="my-2 h-[2.5rem] border-b-2 pb-3">
								<span>
									Buyer/خریدار: <span>{fields[Ids.buyerName] ?? "-"}</span>
								</span>
							</div>

							<div className="my-2 h-[2.5rem] border-b-2 pb-3">
								<span>
									Seller/ فروشنده: <span>{fields[Ids.seller] ?? "-"}</span>
								</span>
							</div>

							<div className="my-2 h-[2.5rem] border-b-2 pb-3">
								<span>
									P/I NO./ شماره پروفرما:{" "}
									<span>{fields[Ids.proformaNo] ?? "-"}</span>
								</span>
							</div>

							<div className="my-2 h-[2.5rem] border-b-2 pb-3">
								<span>
									P/I DATE./ تاریخ پروفرما:{" "}
									<span>{fields[Ids.proformaDate] ?? "-"}</span>
								</span>
							</div>

							<div className="my-2 h-[10rem] border-b-2 pb-3">
								<span>
									Description of goods/ شرح کالای بازرسی:{" "}
									{fields[Ids.descriptionOfGoods]?.map(
										(items: any, index: number) => (
											<span key={index}>
												<span>{items}</span>
												{index !== fields[Ids.descriptionOfGoods]?.length - 1 &&
													","}{" "}
											</span>
										),
									)}
								</span>
							</div>

							<div className="my-2 h-[10rem] border-b-2 pb-3">
								<span>
									Scope of inspection/ دامنه بازرسی:{" "}
									<span>{fields[Ids.fieldOfGoods] ?? "-"}</span>
								</span>
							</div>

							<div className="my-2 h-[10rem] border-b-2 pb-3">
								<span>
									Inspection tools (if any)/ ابزارهای بکار رفته (در صورت
									کاربرد): <span>{fields[Ids.inspectionTools] ?? "-"}</span>
								</span>
							</div>

							<div className="my-2 h-[10rem] border-b-2 pb-3">
								<span>
									Information about loading (Including number of containers or
									Cargo Hold)/ اطلاعات مربوط به بارگیری:{" "}
									<span>{fields[Ids.loadingReport] ?? "-"}</span>
								</span>
							</div>

							<div className="my-2 h-[10rem] border-b-2 pb-3">
								{fields[Ids.quantityControl]?.map(
									(items: any, index: number) => (
										<span key={index}>
											<span>
												{items?.name}: <span>{items?.from ?? "-"}</span>{" "}
												<span>از {items?.to ?? "-"}</span>
											</span>
											{index !== fields[Ids.quantityControl]?.length - 1 && ","}{" "}
										</span>
									),
								)}
							</div>

							<div className="my-2 h-[10rem] border-b-2 pb-3">
								<span>
									Description/ سایر توضیحات:{" "}
									<span>{fields[Ids.description] ?? "-"}</span>
								</span>
							</div>

							<Table.Root className="my-4 border-b-2">
								<Table.Head className="bg-gray-100 text-left">
									<Table.Row>
										<Table.Cell as="th">RESULT</Table.Cell>
										<Table.Cell as="th">INSPECTION DETAILS RESULT</Table.Cell>
										<Table.Cell as="th"></Table.Cell>
									</Table.Row>
								</Table.Head>
								<Table.Body className="text-left">
									<Table.Row>
										<Table.Cell as="td">
											{fields[Ids.quantity] === "OKAY"
												? "CONFIRM"
												: fields[Ids.quantity] === "NOTOKAY"
													? "REJECT"
													: "N/A"}
										</Table.Cell>
										<Table.Cell as="td">QUANTITY</Table.Cell>
										<Table.Cell as="td">(1</Table.Cell>
									</Table.Row>

									<Table.Row>
										<Table.Cell as="td">
											{fields[Ids.appearence] === "OKAY"
												? "CONFIRM"
												: fields[Ids.appearence] === "NOTOKAY"
													? "REJECT"
													: "N/A"}
										</Table.Cell>
										<Table.Cell as="td">APPEARANCE</Table.Cell>
										<Table.Cell as="td">(2</Table.Cell>
									</Table.Row>

									<Table.Row>
										<Table.Cell as="td">
											{fields[Ids.marketingLabel] === "OKAY"
												? "CONFIRM"
												: fields[Ids.marketingLabel] === "NOTOKAY"
													? "REJECT"
													: "N/A"}
										</Table.Cell>
										<Table.Cell as="td">MARKING LABEL</Table.Cell>
										<Table.Cell as="td">(3</Table.Cell>
									</Table.Row>

									<Table.Row>
										<Table.Cell as="td">
											{fields[Ids.testing] === "OKAY"
												? "CONFIRM"
												: fields[Ids.testing] === "NOTOKAY"
													? "REJECT"
													: "N/A"}
										</Table.Cell>
										<Table.Cell as="td">TESTING / DATA MEASUREMENT</Table.Cell>
										<Table.Cell as="td">(4</Table.Cell>
									</Table.Row>
								</Table.Body>
							</Table.Root>

							<Table.Root className="my-4 border-b-2">
								<Table.Head className="bg-gray-100">
									<Table.Row>
										<Table.Cell as="th">SPECIAL ATTENTION</Table.Cell>
										<Table.Cell as="th"></Table.Cell>
									</Table.Row>
								</Table.Head>
								<Table.Body className="text-center">
									<Table.Row>
										<Table.Cell as="td">
											{fields[Ids.quantityDes] ?? "-"}
										</Table.Cell>
										<Table.Cell as="td">:QUANTITY</Table.Cell>
									</Table.Row>
									<Table.Row>
										<Table.Cell as="td">
											{fields[Ids.appearenceDes] ?? "-"}
										</Table.Cell>
										<Table.Cell as="td">:APPEARANCE</Table.Cell>
									</Table.Row>
									<Table.Row>
										<Table.Cell as="td">
											{fields[Ids.marketingLabelDes] ?? "-"}
										</Table.Cell>
										<Table.Cell as="td">:MARKING LABEL</Table.Cell>
									</Table.Row>
									<Table.Row>
										<Table.Cell as="td">
											{fields[Ids.testingDes] ?? "-"}
										</Table.Cell>
										<Table.Cell as="td">:TESTING / DATA MEASUREMENT</Table.Cell>
									</Table.Row>
								</Table.Body>
							</Table.Root>

							<Table.Root className="my-4 border-b-2">
								<Table.Head className="bg-gray-100 text-left" dir="ltr">
									<Table.Row>
										<Table.Cell
											as="th"
											className={`text-center font-bold text-black ${
												fields[Ids.inspectionOverall] === "ACCEPTED"
													? "bg-green-600"
													: fields[Ids.inspectionOverall] === "PENDING"
														? "bg-amber-300"
														: fields[Ids.inspectionOverall] === "FAILED"
															? "bg-red-600"
															: ""
											}`}
										>
											{fields[Ids.inspectionOverall] ?? "-"}
										</Table.Cell>
										<Table.Cell as="th" className="max-w-[8rem] pl-[3rem]">
											INSPECTION OVERALL CONCLUSION:
										</Table.Cell>
									</Table.Row>
								</Table.Head>
							</Table.Root>

							<div>
								{loading ? (
									<Loading
										size={"md"}
										verticalPlacement={"center"}
										horizontalPlacement={"center"}
									/>
								) : fields[Ids.latitude] && fields[Ids.longitude] ? (
									<div className="mt-4 block py-4">
										<span className="mx-4 mt-4">موقعیت بازرس:</span>
										<Map
											latitude={+fields[Ids.latitude]}
											longitude={+fields[Ids.longitude]}
										/>
									</div>
								) : (
									"صفحه را مجددا بارگزاری نمایید."
								)}
							</div>

							<div className="mb-5 mt-10 flex flex-wrap justify-center border-y-2 py-5">
								{key === "InspectionValidate" && (
									<div className="mx-10 mt-2">
										<label>امضاء کارشناس:</label>
										{loading ? (
											<Loading />
										) : expertSign ? (
											<>
												<Image
													src={expertSign}
													width={120}
													height={200}
													className="my-4 rounded-md"
													alt="inspectorSignutare"
												/>
												<span>{fields[Ids.inspectionExpertName]}</span>
											</>
										) : (
											"یافت نشد"
										)}
									</div>
								)}

								<div className="mx-4">
									<label>امضاء بازرس:</label>
									{loading ? (
										<Loading />
									) : inspectorSign ? (
										<>
											<Image
												src={inspectorSign}
												width={120}
												height={200}
												className="rounded-md"
												alt="inspectorSignutare"
											/>
											<span>{fields[Ids.inspectorName]}</span>
										</>
									) : (
										"یافت نشد"
									)}
								</div>
							</div>
						</div>
					</div>
				}
				fileName={`DOC`}
			/>
			<PDFGenerator
				button="دانلود تصاویر"
				fileName={`PIC`}
				caseNo={fields[Ids.inspectionCaseNo]}
				dynamicContent={
					<div
						id="ivr"
						className="flex flex-wrap justify-center rounded-md bg-white px-4 py-2"
					>
						{filesId?.map(
							(files: any) =>
								files?.category !== "video" && (
									<ImageCard
										caseNo={fields[Ids.inspectionCaseNo]}
										key={files.id}
										width={300}
										height={225}
										className="mx-10 my-4 mb-[5.5rem] rounded-md"
										data={files}
										setLoading={setLoading}
										loading={loading}
										getData={getFilesId}
										deleteFileOption={true}
									/>
								),
						)}
					</div>
				}
				key={"picpdf"}
			/>
		</>
	);
}
