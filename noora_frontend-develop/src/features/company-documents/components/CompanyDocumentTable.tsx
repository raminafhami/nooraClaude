"use client";

import moment from "jalali-moment";
import dynamic from "next/dynamic";
import { useCallback } from "react";
import { FaDownload, FaPenToSquare, FaTrash } from "react-icons/fa6";
import { toast } from "sonner";

import { CompanyDocument } from "@/company-documents/models/CompanyDocument";
import { deleteCompanyDocumentFile } from "@/company-documents/services/deleteCompanyDocumentFile";
import { getCompanyDocumentFile } from "@/company-documents/services/getCompanyDocumentFile";
import { Button } from "@/components/ui/button";
import { DeleteDialog } from "@/components/ui/dialog/delete-dialog";
import { useDialogs } from "@/components/ui/dialog/use-dialogs";
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
import downloadBlob from "@/utils/downloadBlob";

const CompanyDocumentUpdateDialog = dynamic(
	() => import("./modal/CompanyDocumentUpdateDialog"),
);

const CompanyDocumentTable = ({
	documents,
	loading,
	offset,
	pagination,
	refetch,
}: {
	documents: CompanyDocument[];
	loading: boolean;
	offset: number;
	pagination: React.ReactNode;
	refetch: () => void;
}) => {
	const dialogs = useDialogs();

	const handleDocumentEditDialog = useCallback(
		async (document: CompanyDocument) => {
			const result = await dialogs.open(CompanyDocumentUpdateDialog, {
				document,
			});

			if (result) {
				refetch();
			}
		},
		[dialogs, refetch],
	);

	const handleDocumentDeleteDialog = useCallback(
		async (document: CompanyDocument) => {
			const result = await dialogs.open(DeleteDialog, {
				title: document.title,
				onSubmit: async () => {
					await deleteCompanyDocumentFile(document.id);
					toast.success("مدرک با موفقیت حذف شد.");
				},
				onError: () => {
					toast.error("خطای نامشخصی در هنگام حذف مدرک رخ داد.");
				},
			});

			if (result) {
				refetch();
			}
		},
		[dialogs, refetch],
	);

	const handleDocumentDownloadClick = async (document: CompanyDocument) => {
		try {
			const blob = await getCompanyDocumentFile(document.id);

			await downloadBlob({
				blob,
				filename: document.fileName,
				openInNewTab: true,
			});
		} catch {
			toast.error("خطای نامشخصی در هنگام دریافت فایل رخ داد.");
		}
	};

	return (
		<Table
			loading={loading}
			pagination={pagination}
			slotProps={{
				root: { className: "rounded-none border-x-0" },
			}}
		>
			<TableHeader>
				<TableRow>
					<TableHead className="w-12">#</TableHead>
					<TableHead className="w-96">عنوان</TableHead>
					<TableHead className="w-36">تاریخ</TableHead>
					<TableHead>توضیحات</TableHead>
					<TableHead className="w-36">عملیات</TableHead>
				</TableRow>
			</TableHeader>

			<TableBody>
				{documents?.map((item, index) => (
					<TableRow key={item.id}>
						<TableCell>{offset + index + 1}</TableCell>

						<TableCell>
							<div className="min-w-28">{item.title}</div>
						</TableCell>

						<TableCell>{moment(item.date).format("jYYYY/jMM/jDD")}</TableCell>

						<TableCell>
							<div className="min-w-36">{item.description}</div>
						</TableCell>

						<TableCell>
							<TooltipProvider>
								<TableActions>
									<TableAction>
										<Tooltip>
											<TooltipTrigger asChild>
												<Button
													size="icon"
													variant="ghost"
													onClick={() => {
														handleDocumentDownloadClick(item);
													}}
												>
													<FaDownload />
												</Button>
											</TooltipTrigger>
											<TooltipContent>دانلود مدرک</TooltipContent>
										</Tooltip>
									</TableAction>

									<TableAction>
										<Tooltip>
											<TooltipTrigger asChild>
												<Button
													className="size-full"
													size="icon"
													variant="link"
													onClick={() => {
														handleDocumentEditDialog(item);
													}}
												>
													<FaPenToSquare />
												</Button>
											</TooltipTrigger>
											<TooltipContent>ویرایش</TooltipContent>
										</Tooltip>
									</TableAction>
									<TableAction>
										<Tooltip>
											<TooltipTrigger asChild>
												<Button
													className="size-full"
													size="icon"
													variant="link"
													onClick={() => {
														handleDocumentDeleteDialog(item);
													}}
												>
													<FaTrash />
												</Button>
											</TooltipTrigger>
											<TooltipContent>حذف</TooltipContent>
										</Tooltip>
									</TableAction>
								</TableActions>
							</TooltipProvider>
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
};

export { CompanyDocumentTable };
