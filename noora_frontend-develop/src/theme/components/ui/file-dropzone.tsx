"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FaTrash } from "react-icons/fa6";

import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

type FileWithPreview = File & {
	id: number;
	preview: string;
};

export default function FileDropzone({
	disabled,
	onFilesAdded,
	initialFiles = [],
}: {
	disabled?: boolean;
	onFilesAdded: (files: File[]) => void;
	initialFiles?: File[];
}) {
	const counterRef = useRef<number>(0);
	const [files, setFiles] = useState<FileWithPreview[]>([]);

	useEffect(() => {
		if (initialFiles.length > 0 && counterRef.current === 0) {
			const initialFilePreviews = initialFiles.map((file, index) =>
				Object.assign(file, {
					id: counterRef.current + index,
					preview: URL.createObjectURL(file),
				}),
			);
			setFiles(initialFilePreviews);
			counterRef.current += initialFilePreviews.length;
		}
	}, [initialFiles]);

	const onDrop = useCallback(
		(acceptedFiles: File[]) => {
			const newFiles = acceptedFiles.map((file) =>
				Object.assign(file, {
					id: counterRef.current++,
					preview: URL.createObjectURL(file),
				}),
			);

			const nextFiles = [...files, ...newFiles];
			setFiles(nextFiles);
			onFilesAdded(nextFiles);
		},
		[onFilesAdded, files],
	);

	const removeFile = (fileToRemove: FileWithPreview) => {
		const nextFiles = files.filter((file) => file !== fileToRemove);
		setFiles(nextFiles);
		onFilesAdded(nextFiles);

		URL.revokeObjectURL(fileToRemove.preview);
	};

	const { getRootProps, getInputProps } = useDropzone({
		accept: {
			"image/jpeg": [],
			"image/png": [],
			"application/pdf": [],
			"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [], // xlsx
			"application/vnd.ms-excel": [], // xls
			"application/vnd.openxmlformats-officedocument.wordprocessingml.document":
				[], // docx
			"application/msword": [], // doc
			"text/csv": [],
		},
		disabled,
		multiple: true,
		onDrop,
	});

	return (
		<div className="space-y-2">
			<div
				{...getRootProps()}
				className="w-full cursor-pointer rounded-xl border-2 border-dashed bg-white px-4 py-8 text-center"
			>
				<input className="w-full" {...getInputProps()} />
				<p>فایل را بکشید یا انتخاب کنید</p>
			</div>

			{files.length > 0 && (
				<TooltipProvider>
					<div className="flex w-full flex-wrap gap-2 overflow-y-auto rounded-2xl bg-gray-100 p-2">
						{files.map((file) => (
							<FilePreview key={file.id} file={file} onRemove={removeFile} />
						))}
					</div>
				</TooltipProvider>
			)}
		</div>
	);
}

function FilePreview({
	file,
	onRemove,
}: {
	file: FileWithPreview;
	onRemove: (file: FileWithPreview) => void;
}) {
	const [isImage, setIsImage] = useState<boolean>(false);

	useEffect(() => {
		if (!file.preview) return;

		const img = new Image();
		img.onload = () => setIsImage(true);
		img.onerror = () => setIsImage(false);
		img.src = file.preview;

		return () => {
			URL.revokeObjectURL(file.preview);
		};
	}, [file.preview]);

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<div className="relative size-20 rounded-xl border">
					<button
						type="button"
						onClick={(e) => {
							e.stopPropagation();
							onRemove(file);
						}}
						className="absolute -start-1.5 -top-1.5 z-50 flex size-6 items-center justify-center rounded-full bg-red-500 text-xs text-white shadow-sm shadow-black"
					>
						<FaTrash />
					</button>

					{isImage ? (
						// eslint-disable-next-line @next/next/no-img-element
						<img
							alt={file.name}
							className="h-full w-full rounded-xl object-cover"
							src={file.preview}
							onLoad={() => URL.revokeObjectURL(file.preview)}
						/>
					) : (
						<div className="flex size-full items-center justify-center rounded-xl bg-white">
							<div className="flex size-16 items-center justify-center overflow-hidden text-ellipsis text-wrap text-lg uppercase text-gray-500">
								{file.name.split(".").at(-1)}
							</div>
						</div>
					)}
				</div>
			</TooltipTrigger>
			<TooltipContent>{file.name}</TooltipContent>
		</Tooltip>
	);
}
