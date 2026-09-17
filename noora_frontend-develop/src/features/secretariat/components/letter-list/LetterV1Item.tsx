"use client";

import { useState } from "react";
import { FaDownload, FaPaperclip } from "react-icons/fa6";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { DateTime } from "@/components/ui/datetime";
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
import { downloadInstanceTemplate } from "@/felo/instances/services/downloadInstanceTemplate";
import { useLetterContext } from "@/secretariat/hooks/useLetterContext";

function LetterV1Item({
	instance,
	index,
}: {
	instance: Instance;
	index: number;
}) {
	const { openAttachmentsDialog } = useLetterContext();

	const isConfirmed =
		instance.parameters["LetterReviewByManagerStatus"] === "approved";

	const [isPending, setIsPending] = useState<boolean>(false);

	async function downloadLetter() {
		try {
			setIsPending(true);

			await downloadInstanceTemplate({
				instanceId: instance.id,
				templateName: "sec-letter.preview.html",
				variables: ["LetterPages"],
				output: isConfirmed ? `نامه ${instance.caseNo}` : "پیش نویس نامه",
			});
		} catch (err) {
			console.error(err);
			toast.error("خطای نامشخصی در هنگام دانلود نامه رخ داد.");
		} finally {
			setIsPending(false);
		}
	}

	return (
		<TableRow>
			<TableCell>{index + 1}</TableCell>
			<TableCell>{isConfirmed ? instance.caseNo : "-"}</TableCell>
			<TableCell>{instance.parameters.LetterSubject || "بدون موضوع"}</TableCell>
			<TableCell>
				{instance.parameters["Assignees"]?.Author?.name || "نامشخص"}
			</TableCell>
			<TableCell>
				{isConfirmed
					? instance.parameters["Assignees"]?.Manager?.name
					: "نامشخص"}
			</TableCell>
			<TableCell>
				{instance.parameters?.RelatedInspectionCaseNo || "-"}
			</TableCell>
			<TableCell>{instance.parameters?.LetterFollowingOfs || "-"}</TableCell>
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
										onClick={downloadLetter}
									>
										<Spinner loading={isPending} size="xs">
											<FaDownload />
										</Spinner>
									</Button>
								</TooltipTrigger>
								<TooltipContent>دانلود نامه (بدون سربرگ)</TooltipContent>
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
					</TooltipProvider>
				</TableActions>
			</TableCell>
		</TableRow>
	);
}

export { LetterV1Item };
