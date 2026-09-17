"use client";

import { useEffect, useRef, useState } from "react";
import { FaEye, FaPlus, FaTrash } from "react-icons/fa6";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import downloadBlob from "@/utils/downloadBlob";

type FileWithTitle = {
	title: string;
	file: File;
	url?: string;
};

function PropertyFileManager({
	initialFiles = [],
	setUploadFiles,
}: {
	initialFiles?: FileWithTitle[];
	setUploadFiles: (files: FileWithTitle[]) => void;
}) {
	const [files, setFiles] = useState<FileWithTitle[]>([]);
	const [currentTitle, setCurrentTitle] = useState("");
	const [currentFile, setCurrentFile] = useState<File | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files.length > 0) {
			setCurrentFile(e.target.files[0]);
		}
	};

	const handleAddFile = () => {
		if (currentFile && currentTitle.trim()) {
			setFiles((prev) => [...prev, { title: currentTitle, file: currentFile }]);
			setCurrentTitle("");
			setCurrentFile(null);
			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}
		}
	};

	const handleRemoveFile = (index: number) => {
		const newFiles = [...files];
		newFiles.splice(index, 1);
		setFiles(newFiles);
	};

	const handleDownload = (fileWithTitle: FileWithTitle) => {
		downloadBlob({ blob: fileWithTitle.file, openInNewTab: true });
	};

	useEffect(() => {
		if (initialFiles.length) {
			setFiles(initialFiles);
		}
	}, [initialFiles]);

	useEffect(() => {
		setUploadFiles(files.filter((f) => f.file instanceof File));
	}, [files, setUploadFiles]);

	return (
		<div className="col-span-full grid grid-cols-12 gap-5 rounded-2xl border p-4">
			<div className="col-span-5 mb-6 flex flex-col space-y-4">
				<div className="flex items-center gap-3">
					<Input
						type="text"
						placeholder="نوع مدرک"
						value={currentTitle}
						onChange={(e) => setCurrentTitle(e.target.value)}
					/>
					<Button
						type="button"
						variant="primary"
						onClick={handleAddFile}
						disabled={!currentFile || !currentTitle.trim()}
					>
						اضافه کردن
						<FaPlus />
					</Button>
				</div>

				<div className="relative">
					<div dir="rtl" className="space-y-2">
						<label className="block">
							<div className="flex items-center gap-2">
								<button
									type="button"
									onClick={() => fileInputRef.current?.click()}
									className="rounded-md bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100"
								>
									انتخاب فایل
								</button>
								<span className="text-xs text-gray-500">
									{currentFile ? currentFile.name : "هیچ فایلی انتخاب نشده"}
								</span>
								<input
									type="file"
									ref={fileInputRef}
									onChange={handleFileChange}
									className="hidden"
								/>
							</div>
						</label>
					</div>
				</div>
			</div>

			<div className="col-span-7 space-y-3">
				{files.length > 0 ? (
					files.map((fileWithTitle, index) => (
						<div
							key={index}
							className="flex items-center justify-between rounded-md bg-gray-50 p-3"
						>
							<div className="min-w-0 flex-1">
								<p className="truncate text-sm font-medium text-gray-900">
									{fileWithTitle.title}
								</p>
								<p className="truncate text-xs text-gray-500">
									{fileWithTitle.file.name ?? fileWithTitle.url}
								</p>
							</div>
							<div className="flex items-center gap-2">
								<Button
									type="button"
									variant="ghost"
									onClick={() => handleDownload(fileWithTitle)}
								>
									<FaEye />
								</Button>
								<Button
									type="button"
									variant="ghost"
									onClick={() => handleRemoveFile(index)}
								>
									<FaTrash />
								</Button>
							</div>
						</div>
					))
				) : (
					<div className="py-4 text-center text-gray-500">
						هیچ فایلی اضافه نشده
					</div>
				)}
			</div>
		</div>
	);
}

export { PropertyFileManager };
