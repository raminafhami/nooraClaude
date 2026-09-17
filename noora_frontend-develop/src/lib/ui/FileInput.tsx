import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { FaCamera, FaFileDownload, FaUpload } from "react-icons/fa";
import { IoIosClose } from "react-icons/io";
import { Tooltip } from "react-tooltip";

import { Input } from "./Form/Input";
import { Loading } from "./Loader";

interface Props {
	setFile: (v: File | FileList) => void;
	onRemove?: () => void;
	file?: File | Blob;
	className?: string;
	loading?: boolean;
	capture?: "environment" | boolean | "user" | undefined;
	multiple?: boolean;
	design?: "personnelDocument" | "inspection";
	disabled?: boolean;
	accept?: string;
	tooltip?: string;
	placeholderIcon?: JSX.Element;
}

function FileInput({
	setFile,
	file,
	onRemove,
	className,
	loading,
	capture,
	multiple,
	design = "personnelDocument",
	disabled,
	accept,
	tooltip,
	placeholderIcon,
	...props
}: Props) {
	const [preview, setPreview] = useState<string | null>(null);
	const [showModal, setShowModal] = useState(false);
	const [key, setKey] = useState(Date.now().toString());
	const inputRef = useRef<HTMLInputElement | null>(null);

	useEffect(() => {
		if (file) {
			const files = new File([file], file.name || "", { type: file.type });
			const reader = new FileReader();
			reader.onloadend = () => {
				setPreview(reader.result as string);
			};
			reader.readAsDataURL(files);
		}
	}, [file]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFile: File | FileList | any = multiple
			? e.target.files
			: e.target.files?.[0];
		setKey(Date.now().toString());
		if (selectedFile) {
			setFile(selectedFile);
			const reader = new FileReader();
			reader.onloadend = () => {
				setPreview(reader.result as string);
			};
			!multiple && reader.readAsDataURL(selectedFile);
		}
	};

	const handlePreviewClick = () => {
		if (file?.type.startsWith("image/")) {
			setShowModal(true);
		} else if (file) {
			window.open(URL.createObjectURL(file), "_blank");
		}
	};

	return design === "personnelDocument" ? (
		<div className="relative inline-flex flex-col items-center justify-center rounded-md border border-b-0 border-gray-200">
			<div className="relative my-2 flex h-[40px] w-[80px] items-center justify-center py-2">
				{loading ? (
					<Loading horizontalPlacement={"center"} size={"md"} />
				) : file && !file?.type?.startsWith("image/") ? (
					<div className="flex flex-col items-center justify-center gap-y-2">
						<FaFileDownload
							size={"1.6rem"}
							className="cursor-pointer text-green-600 outline-none"
							onClick={handlePreviewClick}
							data-tooltip-id="downloadFile"
						/>
					</div>
				) : preview && file?.type?.startsWith("image/") ? (
					<div className="cursor-zoom-in" onClick={handlePreviewClick}>
						<Image
							className="rounded-sm object-contain"
							fill
							src={preview}
							alt="Preview"
						/>
					</div>
				) : (
					<FaUpload
						size={"1.2rem"}
						className="cursor-pointer text-gray-500 outline-none hover:text-blue-500"
						onClick={() => inputRef.current?.click()}
						data-tooltip-id="uploadFile"
					/>
				)}
			</div>
			{onRemove && file !== undefined && file?.name !== "" && !loading && (
				<IoIosClose
					className={`absolute right-0 top-0 min-h-[20px] min-w-[20px] cursor-pointer rounded-bl-md border border-r-0 border-t-0 p-0 outline-none transition-all delay-75 hover:bg-red-50 hover:text-red-600`}
					size={"1.4rem"}
					onClick={() => {
						setPreview(null);
						setShowModal(false);
						onRemove();
					}}
					data-tooltip-id="removeFile"
				/>
			)}

			<input
				readOnly
				id="nationalCard"
				onClick={() => inputRef.current?.click()}
				value={file?.name ? file?.name : ""}
				disabled={loading || (file !== undefined && file?.name !== "")}
				dir="ltr"
				className={`focus:placeholder-gray group relative h-10 cursor-pointer text-ellipsis rounded-md border border-gray-200 px-2 py-2 text-right focus:text-black focus:outline-0 ${className}`}
				placeholder={"پیوست"}
				capture={capture}
				multiple={multiple}
			/>
			<Input
				style={{ display: "none" }}
				type="file"
				key={key}
				onChange={handleChange}
				disabled={loading || (file !== undefined && file?.name !== "")}
				ref={inputRef}
				{...props}
				capture={capture}
				multiple={multiple}
				accept={accept}
			/>

			{showModal && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80"
					onClick={() => setShowModal(false)}
				>
					<div className="h-4/5 w-4/5 rounded-2xl p-5">
						<div className="relative h-full w-full rounded-2xl bg-transparent p-5">
							{preview && (
								<Image
									className="rounded-2xl"
									fill
									objectFit="contain"
									src={preview}
									alt="Preview"
								/>
							)}
						</div>
					</div>
				</div>
			)}
			<Tooltip id="downloadFile">دانلود فایل</Tooltip>
			<Tooltip id="uploadFile">آپلود فایل</Tooltip>
			<Tooltip id="removeFile">حذف فایل</Tooltip>
		</div>
	) : (
		<div className="relative inline-flex flex-col items-center justify-center rounded-md border border-gray-200">
			<div
				onClick={() => !loading && inputRef.current?.click()}
				className="relative my-2 flex h-[40px] w-[80px] items-center justify-center py-2"
			>
				{loading ? (
					<Loading horizontalPlacement={"center"} size={"md"} />
				) : placeholderIcon ? (
					placeholderIcon
				) : (
					<FaCamera
						size={"1.2rem"}
						className="cursor-pointer text-gray-500 outline-none hover:text-blue-500"
						data-tooltip-id="uploadFile"
					/>
				)}
			</div>
			<Input
				style={{ display: "none" }}
				type="file"
				key={key}
				onChange={handleChange}
				disabled={
					loading || (file !== undefined && file?.name !== "") || disabled
				}
				ref={inputRef}
				{...props}
				capture={capture}
				accept={accept}
				multiple={multiple}
			/>

			<Tooltip id="uploadFile">{tooltip ? tooltip : "گرفتن عکس"}</Tooltip>
		</div>
	);
}

export default FileInput;
