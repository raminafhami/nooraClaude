"use client";

import { memo, useCallback, useEffect, useState } from "react";
import { BsCameraReelsFill } from "react-icons/bs";
import { IoChevronUp } from "react-icons/io5";
import { MdOutlineImageNotSupported } from "react-icons/md";
import { toast } from "sonner";

import GetInspectionFile from "@/api/inspection/getInspectionFile";
import PostInspectionFile from "@/api/inspection/postInspectionFile";
import { Instance } from "@/felo/instances/models/Instance";
import ImageCard from "@/inspection/flows/inspectionReport/modules/ImagesCard";
import FileInput from "@/ui/FileInput";
import { Loading } from "@/ui/Loader";
import { Seperator } from "@/ui/Seperator";
import { Disclosure } from "@headlessui/react";

import { DocumentTypes } from "../../inspectionReport/data/DocumentTypes";
import VideoCard from "./VidoeCard";

interface Props {
	instanceData: Instance;
}

export const InspectionPic = memo(function InspectionPic({
	instanceData,
}: Props): React.ReactNode {
	const [fileId, setFileId] = useState<any>();
	const [loading, setLoading] = useState<boolean>(true);
	const [file, setFile] = useState<any>();
	const getFilesId = useCallback(async () => {
		setLoading(true);
		try {
			let res = await GetInspectionFile({
				processInstanceId: instanceData?.parameters?.InspectionInstanceId,
			});
			if (res) {
				setFileId(res.result.files);
				setLoading(false);
			}
		} catch {
			setLoading(false);
			toast.error("خطایی در دریافت عکس ها رخ داد!");
		}
	}, [instanceData?.parameters?.InspectionInstanceId]);

	async function postFile(file: any, category?: string, description?: string) {
		setLoading(true);
		const filesArray = Object.values(file).map((key) => key);
		try {
			let res = await PostInspectionFile({
				files: filesArray,
				processInstanceId: instanceData?.parameters?.InspectionInstanceId,
				category,
				description,
			});
			if (res) {
				setTimeout(() => {
					toast.success("با موفقیت اضافه شد!");
					setLoading(false);
				}, 100);
				getFilesId();
			}
		} catch (error) {
			setLoading(false);
			toast.error("خطایی رخ داد!");
			console.error(error);
		}
	}

	useEffect(() => {
		getFilesId();
	}, [getFilesId]);

	return (
		<div>
			<div className="my-2 rounded-2xl bg-gray-100 p-2">
				{DocumentTypes.map((item, index) => (
					<Disclosure defaultOpen key={index}>
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
									<div className="my-5 flex items-center justify-center">
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
													`editedAt=${new Date().getTime()}`,
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
													`editedAt=${new Date().getTime()}`,
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
									</div>
									<div
										className={`my-4 flex flex-wrap ${
											!loading && fileId && "bg-white"
										} rounded-2xl`}
									>
										{fileId ? (
											fileId?.map((files: any) =>
												files?.category?.split(":")[1] === "video" &&
												files?.category?.split(":")[0] === item?.value ? (
													<VideoCard
														caseNo={instanceData?.caseNo}
														key={files.id}
														width={300}
														height={225}
														className="mx-10 my-4 aspect-square rounded-md"
														data={files}
														setLoading={setLoading}
														loading={loading}
														getData={getFilesId}
														deleteFileOption={true}
													/>
												) : files?.category?.split(":")[1] !== "video" &&
												  files?.category?.split(":")[0] === item?.value ? (
													<ImageCard
														caseNo={instanceData?.caseNo}
														key={files.id}
														width={300}
														height={225}
														className="mx-10 my-4 aspect-square rounded-md"
														data={files}
														setLoading={setLoading}
														loading={loading}
														getData={getFilesId}
														deleteFileOption={true}
													/>
												) : null,
											)
										) : loading ? (
											<Loading />
										) : (
											<div className="rounded-2xl bg-gray-50">
												<p className="p-4 text-red-700">
													اطلاعاتی برای نمایش وجود ندارد!
													<MdOutlineImageNotSupported
														size={20}
														className="mx-2 inline text-red-700"
													/>
												</p>
											</div>
										)}
									</div>
								</Disclosure.Panel>
							</>
						)}
					</Disclosure>
				))}
			</div>
		</div>
	);
});
