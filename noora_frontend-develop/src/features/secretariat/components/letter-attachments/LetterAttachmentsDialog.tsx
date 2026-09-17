"use client";

import { useEffect, useState } from "react";
import { FaDownload } from "react-icons/fa6";

import { Button } from "@/components/ui/button";
import { Conditional } from "@/components/ui/conditional";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { DialogProps } from "@/components/ui/dialog/use-dialogs";
import {
	Table,
	TableAction,
	TableActions,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { FileApi } from "@/felo/files/models/File";
import { getInstanceFile } from "@/felo/files/services/getFile";
import { getInstanceRawFiles } from "@/felo/files/services/getRawFiles";
import downloadBlob from "@/utils/downloadBlob";

import { LetterAttachmentsPayload } from "./LetterAttachmentsTypes";

function LetterAttachmentsDialog({
	open,
	onClose,
	payload,
}: DialogProps<LetterAttachmentsPayload>) {
	return (
		<Dialog open={open} onOpenChange={onClose.bind(null, undefined)}>
			<Conditional mount={open} delay>
				<LetterAttachmentsTable {...payload} onClose={onClose} />
			</Conditional>
		</Dialog>
	);
}

function LetterAttachmentsTable({
	caseNo,
	instanceId,
}: {
	instanceId: string;
	caseNo: string;
	onClose: () => void;
}) {
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [attachments, setAttachments] = useState<FileApi[]>();

	useEffect(() => {
		const fetchAttachments = async () => {
			try {
				setIsLoading(true);

				const attachments = await getInstanceRawFiles({
					instanceId,
					types: ["attachment"],
				});
				setAttachments(attachments);
			} catch (err) {
				console.error(err);
			} finally {
				setIsLoading(false);
			}
		};

		fetchAttachments();
	}, [instanceId]);

	const handleAttachmentDownload = async (attachment: FileApi) => {
		const blob = await getInstanceFile(attachment.id);
		downloadBlob({ blob, filename: attachment.filename });
	};

	return (
		<>
			<DialogContent className="max-w-screen-sm">
				<DialogHeader>
					<DialogTitle>پیوست های شماره درخواست {caseNo}</DialogTitle>
				</DialogHeader>

				<Table
					loading={isLoading}
					slotProps={{
						wrapper: { className: "-mx-6" },
						root: { className: "rounded-none border-x-0" },
					}}
				>
					<TableHeader>
						<TableRow className="whitespace-nowrap">
							<TableHead>نام پیوست</TableHead>
							<TableHead className="w-32">فرمت پیوست</TableHead>
							<TableHead className="w-32">عملیات</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{attachments?.length ? (
							attachments.map((attachment, index) => (
								<TableRow key={index}>
									<TableCell>
										{attachment.filename.split(".").slice(0, -1).join(".")}
									</TableCell>
									<TableCell>{attachment.filename.split(".").pop()}</TableCell>
									<TableCell>
										<TableActions>
											<TooltipProvider>
												<TableAction>
													<Tooltip>
														<TooltipTrigger asChild>
															<Button
																className="size-full"
																size="icon"
																variant="link"
																onClick={() =>
																	handleAttachmentDownload(attachment)
																}
															>
																<FaDownload />
															</Button>
														</TooltipTrigger>
														<TooltipContent>دانلود پیوست</TooltipContent>
													</Tooltip>
												</TableAction>
											</TooltipProvider>
										</TableActions>
									</TableCell>
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell colSpan={100}>هیچ موردی یافت نشد.</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</DialogContent>
		</>
	);
}
export { LetterAttachmentsDialog };
