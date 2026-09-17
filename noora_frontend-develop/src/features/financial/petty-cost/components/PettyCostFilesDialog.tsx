"use client";

import { useCallback, useEffect, useState } from "react";
import { FaDownload, FaTrash } from "react-icons/fa6";
import { toast } from "sonner";

import { downloadProjectTaskFile } from "@/api/tasks-manager/downloadProjectTaskFile";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { DialogProps } from "@/components/ui/dialog/use-dialogs";
import FileDropzone from "@/components/ui/file-dropzone";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { deletePettyCostFile } from "@/financial/petty-cost/services/deletePettyCostFile";
import { getPettyCost } from "@/financial/petty-cost/services/getPettyCosts";
import uploadPettyCostFile from "@/financial/petty-cost/services/uploadPettyCostFile";
import downloadBlob from "@/utils/downloadBlob";

function PettyCostFilesDialog({
	payload,
	open,
	onClose,
}: DialogProps<
	{ costId: string; mode?: "manage" | "view" },
	boolean | undefined
>) {
	const { costId } = payload;
	const mode = payload.mode || "manage";

	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [files, setFiles] = useState<string[]>();

	const fetchData = useCallback(async () => {
		try {
			setIsLoading(true);

			const cost = await getPettyCost({ filters: { _id: costId } }).then(
				(result) => result.at(0),
			);

			setFiles(cost?.files);
		} catch (err) {
			console.error(err);
			toast.error("خطا در دریافت پیوست ها");
		} finally {
			setIsLoading(false);
		}
	}, [costId]);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	const onFileDelete = useCallback((file: string) => {
		setFiles((files) => files?.filter((x) => x !== file));
	}, []);

	return (
		<Dialog open={open} onOpenChange={() => onClose()}>
			<DialogContent className="max-w-screen-xs">
				<DialogHeader>
					<DialogTitle>پیوست های هزینه</DialogTitle>
				</DialogHeader>

				<Spinner loading={isLoading}>
					<div className="space-y-6">
						<FileList
							costId={costId}
							files={files}
							onFileDelete={mode === "manage" ? onFileDelete : undefined}
						/>

						{mode === "manage" && (
							<>
								<Separator className="h-0.5" />

								<FileAddForm costId={costId} onSubmit={fetchData} />
							</>
						)}
					</div>
				</Spinner>
			</DialogContent>
		</Dialog>
	);
}

const FileList = ({
	costId,
	files,
	onFileDelete,
}: {
	costId: string;
	files: string[] | undefined;
	onFileDelete?: (file: string) => void;
}) => {
	if (!files?.length) {
		return <div>هیچ پیوستی یافت نشد.</div>;
	}

	return (
		<>
			{!!files?.length && (
				<div className="space-y-2">
					{files.map((file) => (
						<FileItem
							key={file}
							costId={costId}
							file={file}
							onDelete={onFileDelete}
						/>
					))}
				</div>
			)}
		</>
	);
};

const FileItem = ({
	costId,
	file,
	onDelete,
}: {
	costId: string;
	file: string;
	onDelete?: (file: string) => void;
}) => {
	const [isPending, setIsPending] = useState<boolean>(false);
	const [mode, setMode] = useState<"download" | "delete">();

	const filename = file.split("/").pop();

	async function handleDownload() {
		try {
			setIsPending(true);
			setMode("download");

			const blob = await downloadProjectTaskFile({
				filePath: file,
			});

			downloadBlob({ blob, openInNewTab: true });
		} catch {
			toast.error("خطای نامشخصی در هنگام دانلود پیوست رخ داد.");
		} finally {
			setMode(undefined);
			setIsPending(false);
		}
	}

	async function handleDelete() {
		try {
			setIsPending(true);
			setMode("delete");

			await deletePettyCostFile(costId, file);
			onDelete?.(file);
		} catch {
			toast.error("خطای نامشخصی در هنگام حذف پیوست رخ داد.");
		} finally {
			setMode(undefined);
			setIsPending(false);
		}
	}

	return (
		<div className="flex w-full items-center gap-2 rounded-2xl bg-gray-100">
			<div className="grow py-2 pe-2 ps-4">
				<span dir="ltr">{filename}</span>
			</div>

			<div className="flex h-9 items-center gap-1 pe-4 ps-2">
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								className="size-6"
								disabled={isPending}
								size="icon"
								variant="link"
								type="button"
								onClick={handleDownload}
							>
								<Spinner loading={mode === "download"} size="xs">
									<FaDownload />
								</Spinner>
							</Button>
						</TooltipTrigger>
						<TooltipContent>دانلود پیوست</TooltipContent>
					</Tooltip>

					{!!onDelete && (
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									className="size-6"
									disabled={isPending}
									size="icon"
									variant="link"
									type="button"
									onClick={handleDelete}
								>
									<Spinner loading={mode === "delete"} size="xs">
										<FaTrash />
									</Spinner>
								</Button>
							</TooltipTrigger>
							<TooltipContent>حذف پیوست</TooltipContent>
						</Tooltip>
					)}
				</TooltipProvider>
			</div>
		</div>
	);
};

const FileAddForm = ({
	costId,
	onSubmit,
}: {
	costId: string;
	onSubmit?: () => void;
}) => {
	const [isPending, setIsPending] = useState<boolean>(false);
	const [attachments, setAttachments] = useState<File[]>([]);

	return (
		<div className="space-y-4">
			<FileDropzone onFilesAdded={setAttachments} />

			<div className="flex flex-col gap-3 xs:flex-row-reverse">
				<Button
					className="min-w-24"
					disabled={!attachments.length || isPending}
					type="button"
					variant="primary"
					onClick={async () => {
						try {
							setIsPending(true);

							await uploadPettyCostFile({
								attachments,
								costId,
							});

							setAttachments([]);
							onSubmit?.();
						} catch {
							toast.error("خطای نامشخصی در هنگام بارگذاری پیوست ها رخ داد.");
						} finally {
							setIsPending(false);
						}
					}}
				>
					افزودن
				</Button>
			</div>
		</div>
	);
};

export { PettyCostFilesDialog };
