"use client";

import { useCallback, useEffect, useState } from "react";
import { FaDownload, FaTrash } from "react-icons/fa6";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { DeleteDialog } from "@/components/ui/dialog/delete-dialog";
import { DialogProps, useDialogs } from "@/components/ui/dialog/use-dialogs";
import { TableAction, TableActions } from "@/components/ui/table";
import {
	Tooltip,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import deletePropertyFile from "@/property/services/deletePropertyFile";
import { downloadPropertyFile } from "@/property/services/downloadPropertyFile";
import { getProperty } from "@/property/services/getProperty";
import uploadPropertyFile from "@/property/services/uploadPropertyFile";
import downloadBlob from "@/utils/downloadBlob";

import { PropertyFileManager } from "./PropertyFileManager";

type File = {
	title: string;
	id: string;
};

const PropertyFilesDialog = ({
	payload,
	open,
	onClose,
}: DialogProps<{ id: string }, string | boolean>) => {
	const dialog = useDialogs();
	const [files, setFiles] = useState<File[]>([]);
	const [uploadFiles, setUploadFiles] = useState<any[]>([]);

	const fetchData = useCallback(async () => {
		let res;
		try {
			res = await getProperty({
				filters: { _id: payload.id },
				populate: ["filesList"],
			});
		} catch (e) {
			console.log(e);
			toast.error("خطا در دریافت فایل ها");
		}
		if (res) {
			setFiles(res[0].files);
		}
	}, [payload.id]);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	const handleDownload = async (id: string) => {
		try {
			const blob = await downloadPropertyFile({
				id,
			});
			downloadBlob({ blob, openInNewTab: true });
		} catch (e) {
			toast.error("خطا در دریافت فایل");
			console.log(e);
			return;
		}
		toast.success("فایل با موفقیت دریافت شد");
	};

	const handleDeleteFileDialog = useCallback(
		async (id: string) => {
			const result = await dialog.open(DeleteDialog, {
				title: "این فایل",
				onSubmit: async () => {
					await deletePropertyFile({ id });
					toast.success("کالا با موفقیت حذف شد");
				},
				onError: () => {
					toast.error("خطا در حذف کالا");
				},
			});

			if (result) {
				fetchData();
			}
		},
		[dialog, fetchData],
	);

	const handleAddFile = async () => {
		uploadFiles.forEach(async (file) => {
			try {
				await uploadPropertyFile({
					id: payload.id,
					title: file.title,
					file: file.file,
				});
				toast.success("فایل با موفقیت اضافه شد");
				fetchData();
				setUploadFiles([]);
			} catch (e) {
				toast.error("خطا در اضافه کردن فایل");
				console.error("خطا در اضافه کردن فایل", e);
			}
		});
	};

	return (
		<Dialog open={open} onOpenChange={onClose.bind(null, undefined)}>
			<DialogContent className="max-w-screen-md">
				<DialogHeader>
					<DialogTitle>فایل ها</DialogTitle>
				</DialogHeader>
				<div className="flex flex-wrap items-center justify-start gap-5">
					{files.map((file, index) => (
						<div
							key={index}
							className="flex w-auto justify-between gap-2 rounded-2xl bg-gray-200 p-4"
						>
							<div>{file.title}</div>
							<TooltipProvider delayDuration={0}>
								<TableActions>
									<TableAction className="gap-2">
										<Tooltip>
											<TooltipTrigger asChild>
												<Button
													onClick={() => {
														handleDownload(file.id);
													}}
													size="icon"
													variant="ghost"
												>
													<FaDownload />
												</Button>
											</TooltipTrigger>
										</Tooltip>
										<Tooltip>
											<TooltipTrigger asChild>
												<Button
													onClick={() => {
														handleDeleteFileDialog(file.id);
													}}
													size="icon"
													variant="ghost"
												>
													<FaTrash />
												</Button>
											</TooltipTrigger>
										</Tooltip>
									</TableAction>
								</TableActions>
							</TooltipProvider>
						</div>
					))}
				</div>
				<div className="">
					<PropertyFileManager setUploadFiles={setUploadFiles} />
				</div>
				<Button
					onClick={handleAddFile}
					variant="primary"
					className="ms-auto w-1/6"
				>
					اضافه کردن فایل
				</Button>
			</DialogContent>
		</Dialog>
	);
};

export default PropertyFilesDialog;
