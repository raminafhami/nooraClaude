"use client";

import moment from "jalali-moment";
import { FaInfo, FaPenToSquare } from "react-icons/fa6";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardIcon,
	CardTitle,
} from "@/components/ui/card";
import { useDialogs } from "@/components/ui/dialog/use-dialogs";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { Process } from "@/felo/processes/models";
import { updateProcess } from "@/felo/processes/services/updateProcess";

import { DeadlineDialog } from "./DeadlineDialog";
import { formatTime } from "./formatTime";

function ProcessInfo({
	process,
	fetchProcessData,
}: {
	process: Process;
	fetchProcessData: () => void;
}) {
	const dialogs = useDialogs();

	// deadline dialog
	async function handleDeadlineDialogOpen(process: Process) {
		async function handleSubmit(deadline: string) {
			await updateProcess(process.id, { maxPossibleDuration: deadline });
			toast.success("مهلت انجام فرایند با موفقیت بروزرسانی شد.");
		}

		async function handleRemove() {
			await updateProcess(process.id, { maxPossibleDuration: null });
			toast.success("مهلت انجام فرایند با موفقیت پاک شد.");
		}

		const result = await dialogs.open(DeadlineDialog, {
			name: process.name ?? "",
			deadline: process.maxPossibleDuration ?? undefined,
			onSubmit: handleSubmit,
			onRemove: handleRemove,
		});

		if (result) fetchProcessData();
	}

	return (
		<div className="col-span-full xl:col-span-4">
			<Card>
				<CardHeader orientation="horizontal">
					<CardTitle>
						<CardIcon>
							<FaInfo />
						</CardIcon>
						اطلاعات فرایند
					</CardTitle>
				</CardHeader>
				<CardContent className="w-full">
					<div className="flex flex-col space-y-3">
						<div className="flex flex-col space-y-2">
							<div className="text-muted-foreground">عنوان:</div>
							<div>{process.name}</div>
						</div>

						<div className="flex flex-col space-y-2">
							<div className="pt-2 text-muted-foreground">تاریخ ایجاد:</div>
							<div> {moment(process.createdAt).format("jYYYY/jMM/jDD")}</div>
						</div>
						<div className="flex flex-col space-y-2">
							<div className="pt-2 text-muted-foreground">نسخه:</div>
							<div> {process.version}</div>
						</div>

						<div className="flex flex-col space-y-2">
							<div className="pt-2 text-muted-foreground">
								<span> مهلت انجام:</span>
							</div>
							<div className="flex items-center gap-1">
								<span>{formatTime(process.maxPossibleDuration) || "-"}</span>
								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger asChild>
											<Button
												size="icon"
												variant="link"
												onClick={handleDeadlineDialogOpen.bind(null, process)}
											>
												<FaPenToSquare />
											</Button>
										</TooltipTrigger>
										<TooltipContent>ویرایش مهلت انجام</TooltipContent>
									</Tooltip>
								</TooltipProvider>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

export { ProcessInfo };
