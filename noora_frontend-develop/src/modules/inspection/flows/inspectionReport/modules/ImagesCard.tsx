import Image from "next/image";
import { useEffect, useState } from "react";
import { FaDownload } from "react-icons/fa";
import { TiDelete } from "react-icons/ti";
import { toast } from "sonner";

import DeleteInspectionFile from "@/api/inspection/deleteInspectionFile";
import GetInspectionFileById from "@/api/inspection/getInspectionFileById";
import { Loading } from "@/ui/Loader";

import DeleteModal from "../../_module/inspection-pic/DeleteModal";

interface ImageCardProps {
	data: any;
	setLoading: (state: boolean) => void;
	loading: boolean;
	className?: string;
	width: number;
	height: number;
	getData: () => void;
	caseNo: number | string;
	deleteFileOption?: boolean;
}

export default function ImageCard({
	data,
	setLoading,
	className,
	height,
	width,
	loading,
	getData,
	caseNo,
	deleteFileOption,
}: ImageCardProps) {
	const [file, setFile] = useState<any>();
	const [open, setOpen] = useState(false);

	async function getFile() {
		setLoading(true);
		try {
			let res = await GetInspectionFileById({ fileId: data?.id });
			if (res) {
				setTimeout(() => {
					const files = new File([res], res.name || "", { type: res.type });
					const reader = new FileReader();
					reader.onloadend = () => {
						setFile(reader.result as string);
					};
					reader.readAsDataURL(files);
					setLoading(false);
				}, 100);
			}
		} catch {
			setLoading(false);
			toast.error("خطایی در دریافت عکس ها رخ داد!");
		}
	}

	async function deleteFile(id: string) {
		setLoading(true);
		try {
			let res = await DeleteInspectionFile({ id });
			if (res) {
				setTimeout(() => {
					toast.success("با موفقیت حذف شد!");
					getData();
					setLoading(false);
				}, 100);
			}
		} catch {
			setLoading(false);
			toast.error("خطایی رخ داد!");
		}
	}

	const downloadImage = () => {
		const link = document.createElement("a");
		link.href = file;
		link.download = `${data.category}-${caseNo}.png`;
		link.click();
	};

	useEffect(() => {
		getFile();
	}, []);

	return (
		<>
			<div className={className}>
				{loading || !data || !file ? (
					<div
						className={`relative rounded-md w-[${width}px] bg-white/50 backdrop-blur-sm`}
						style={{ height: `${height}px` }}
					>
						<Loading
							className={`rounded-md`}
							horizontalPlacement={"center"}
							verticalPlacement={"center"}
						/>
						<div
							className={`absolute bottom-0 mt-2 w-full rounded-sm pt-2 text-center`}
						>
							<p className="bg-white/50 py-2 backdrop-blur-sm">
								{data?.category?.split(":")[0]?.toUpperCase()}
							</p>
						</div>
					</div>
				) : (
					<div className="relative">
						<FaDownload
							onClick={downloadImage}
							className="absolute bottom-1 left-1 z-10 cursor-pointer text-blue-500 hover:text-blue-600"
							size={20}
						/>
						{deleteFileOption && (
							<TiDelete
								onClick={() => setOpen(true)}
								className="absolute left-1 top-1 cursor-pointer break-inside-avoid text-red-500 hover:text-red-600"
								size={30}
							/>
						)}
						<Image
							className="h-[250px] w-[300px] select-none rounded-md"
							src={file}
							alt={data?.category?.split(":")[0]?.toUpperCase()}
							width={width}
							height={height}
							loading="eager"
							placeholder="blur"
							blurDataURL="/images/avatar.png"
							draggable={false}
						/>
						<div
							className={`absolute bottom-0 mt-2 w-full rounded-sm pt-2 text-center`}
						>
							<p className="bg-white/50 py-2 backdrop-blur-sm">
								{data?.category?.split(":")[0]?.toUpperCase()}
							</p>
						</div>
					</div>
				)}
			</div>
			<DeleteModal
				setOpen={setOpen}
				open={open}
				submit={() => deleteFile(data.id)}
				loading={loading}
				title="پیشخوان"
			/>
		</>
	);
}
