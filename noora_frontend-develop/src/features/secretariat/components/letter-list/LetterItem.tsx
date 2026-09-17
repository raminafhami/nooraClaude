"use client";

import { useState } from "react";
import { FaDownload, FaEllipsis, FaPaperclip } from "react-icons/fa6";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { DateTime } from "@/components/ui/datetime";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import {
	TableAction,
	TableActions,
	TableCell,
	TableRow,
} from "@/components/ui/table";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { Instance } from "@/felo/instances/models/Instance";
import { getInstanceById } from "@/felo/instances/services/getInstanceById";
import { getUserSignature } from "@/hrm/contract/flows/personnel-contract/services/getUserSignature";
import { useLetterContext } from "@/secretariat/hooks/useLetterContext";
import { tryGetLetterQrCode } from "@/secretariat/utils/tryGetLetterQrCode";
import downloadTemplate from "@/template-engine/utils/downloadTemplate";

function LetterItem({
	instance,
	index,
}: {
	instance: Instance;
	index: number;
}) {
	const { openAttachmentsDialog } = useLetterContext();

	const isConfirmed = instance.parameters["LetterReviewStatus"] === "forward";

	const [isPending, setIsPending] = useState<"with" | "without">();

	async function downloadLetter(mode: "with" | "without") {
		try {
			setIsPending(mode);

			const qrCode = await tryGetLetterQrCode(instance);

			const parameters = await getInstanceById(instance.id, [
				"Assignees",
				"LetterDate",
				"LetterHasAttachments",
				"LetterTo",
				"LetterToPosition",
				"LetterSubject",
				"LetterContent",
				"LetterTranscriptions",
				"ReviewerPosition",
				"LetterReviewStatus",
			]).then((instance) => instance.parameters ?? {});

			const letterNo = isConfirmed ? instance.caseNo : undefined;
			const reviewer = isConfirmed
				? parameters["Assignees"].reviewer
				: undefined;
			const signature =
				isConfirmed && parameters["Assignees"].reviewer?.id
					? await getUserSignature(parameters["Assignees"].reviewer.id)
					: undefined;

			const data = {
				LetterDate: parameters["LetterDate"],
				LetterHasAttachments: parameters["LetterHasAttachments"],
				LetterTo: parameters["LetterTo"],
				LetterToPosition: parameters["LetterToPosition"],
				LetterSubject: parameters["LetterSubject"],
				LetterContent: parameters["LetterContent"],
				LetterTranscriptions: parameters["LetterTranscriptions"],
				ReviewerPosition: parameters["ReviewerPosition"],

				letterNo,
				reviewer,
				signature,
				qrCode,
			};

			const templateName = `secretariat/${mode === "with" ? "letter.html" : "letter-without-design.html"}`;

			await downloadTemplate({
				data,
				name: templateName,
				output: isConfirmed ? `نامه ${instance.caseNo}` : "پیش نویس نامه",
			});
		} catch (err) {
			console.error(err);
			toast.error("خطای نامشخصی در هنگام دانلود نامه رخ داد.");
		} finally {
			setIsPending(undefined);
		}
	}

	return (
		<TableRow>
			<TableCell>{index + 1}</TableCell>
			<TableCell>{isConfirmed ? instance.caseNo : "-"}</TableCell>
			<TableCell>{instance.parameters.LetterSubject || "بدون موضوع"}</TableCell>
			<TableCell>
				{instance.parameters["Assignees"]?.creator?.name || "نامشخص"}
			</TableCell>
			<TableCell>
				{isConfirmed
					? instance.parameters["Assignees"].reviewer.name
					: "نامشخص"}
			</TableCell>
			<TableCell>
				{instance.parameters.RelatedInspectionCaseNo || "-"}
			</TableCell>
			<TableCell>{instance.parameters.LetterFollowingOfs || "-"}</TableCell>
			<TableCell>
				<DateTime date={instance.createAt} />
			</TableCell>
			<TableCell>
				<DateTime date={instance.updateAt} />
			</TableCell>
			<TableCell>
				<TableActions>
					<TooltipProvider>
						<TableAction>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										className="size-full"
										disabled={!!isPending}
										size="icon"
										variant="link"
										type="button"
										onClick={downloadLetter.bind(null, "with")}
									>
										<Spinner loading={isPending === "with"} size="xs">
											<FaDownload />
										</Spinner>
									</Button>
								</TooltipTrigger>
								<TooltipContent>دانلود نامه (با سربرگ)</TooltipContent>
							</Tooltip>
						</TableAction>

						<TableAction>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button
										className="size-full"
										size="icon"
										variant="link"
										type="button"
										onClick={openAttachmentsDialog.bind(null, instance)}
									>
										<FaPaperclip />
									</Button>
								</TooltipTrigger>
								<TooltipContent>پیوست های نامه</TooltipContent>
							</Tooltip>
						</TableAction>

						<TableAction>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										className="size-full"
										size="icon"
										variant="link"
										type="button"
									>
										<FaEllipsis />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent className="min-w-32">
									<DropdownMenuItem
										disabled={!!isPending}
										onSelect={(event) => {
											event.preventDefault();
											downloadLetter("without");
										}}
									>
										<button className="flex size-full grow items-center gap-2">
											<Spinner loading={isPending === "without"} size="xs">
												<FaDownload />
											</Spinner>
											<span>دانلود نامه (بدون سربرگ)</span>
										</button>
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</TableAction>
					</TooltipProvider>
				</TableActions>
			</TableCell>
		</TableRow>
	);
}

export { LetterItem };
