"use client";

import { useMemo } from "react";
import {
	FaClock,
	FaEllipsis,
	FaLayerGroup,
	FaPenToSquare,
} from "react-icons/fa6";
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
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Process } from "@/felo/processes/models";
import { ProcessStage } from "@/felo/processes/models/ProcessStage";
import { updateProcessStage } from "@/felo/processes/services/updateProcessStage";

import { DeadlineDialog } from "./DeadlineDialog";
import { formatTime } from "./formatTime";

const ProcessStages = ({
	process,
	fetchProcessData,
}: {
	process: Process;
	fetchProcessData: () => void;
}) => {
	const dialogs = useDialogs();

	const stages = useMemo(
		() =>
			process.stages.filter(
				(stage: ProcessStage) =>
					stage.type === "activity" &&
					stage.subType === "user-task" &&
					!stage.name.includes("فیلد"),
			),
		[process],
	);

	// deadline dialog
	async function handleDeadlineDialogOpen(stage: ProcessStage) {
		async function handleSubmit(deadline: string) {
			await updateProcessStage(process.id, stage!.id, { dueDate: deadline });
			toast.success("مهلت انجام مرحله با موفقیت بروزرسانی شد.");
		}

		async function handleRemove() {
			await updateProcessStage(process.id, stage!.id, { dueDate: null });
			toast.success("مهلت انجام مرحله با موفقیت پاک شد.");
		}

		const result = await dialogs.open(DeadlineDialog, {
			name: stage.name ?? "",
			deadline: stage.dueDate ?? undefined,
			onSubmit: handleSubmit,
			onRemove: handleRemove,
		});

		if (result) fetchProcessData();
	}

	return (
		<div className="col-span-full xl:col-span-8">
			<Card>
				<CardContent className="px-0">
					<CardHeader>
						<CardTitle>
							<CardIcon>
								<FaLayerGroup />
							</CardIcon>
							مراحل فرایند
						</CardTitle>
					</CardHeader>
					<Table slotProps={{ root: { className: "border-x-0 rounded-none" } }}>
						<TableHeader>
							<TableRow className="whitespace-nowrap">
								<TableHead className="w-24">ردیف</TableHead>
								<TableHead>عنوان</TableHead>
								<TableHead className="w-64">مهلت انجام</TableHead>
								<TableHead className="w-28">عملیات</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{stages.length > 0 ? (
								stages.map((stage, index) => (
									<TableRow key={stage.id} className="whitespace-nowrap">
										<TableCell>{index + 1}</TableCell>
										<TableCell>{stage.name}</TableCell>
										<TableCell>{formatTime(stage.dueDate) || "-"}</TableCell>
										<TableCell>
											<TooltipProvider>
												<TableActions>
													<TableAction>
														<Tooltip>
															<TooltipTrigger asChild>
																<Button
																	className="size-full"
																	size="icon"
																	variant="link"
																	onClick={handleDeadlineDialogOpen.bind(
																		null,
																		stage,
																	)}
																>
																	<FaClock />
																</Button>
															</TooltipTrigger>
															<TooltipContent>ویرایش مهلت انجام</TooltipContent>
														</Tooltip>
													</TableAction>

													{/* <TableAction>
														<DropdownMenu>
															<DropdownMenuTrigger className="flex size-full items-center justify-center">
																<FaEllipsis />
															</DropdownMenuTrigger>
															<DropdownMenuContent className="min-w-32">
																<DropdownMenuItem
																	className="flex items-center gap-2"
																	onSelect={() => {
																		setStage(stage);
																		openDeadlineDialog();
																	}}
																>
																	<FaPenToSquare />
																	<span>ویرایش مهلت انجام</span>
																</DropdownMenuItem>
															</DropdownMenuContent>
														</DropdownMenu>
													</TableAction> */}
												</TableActions>
											</TooltipProvider>
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
				</CardContent>
			</Card>
		</div>
	);
};

export { ProcessStages };
