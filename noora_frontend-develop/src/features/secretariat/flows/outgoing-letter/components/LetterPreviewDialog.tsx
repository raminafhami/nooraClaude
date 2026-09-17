import { useEffect, useState } from "react";
import { Document } from "react-pdf";
import { toast } from "sonner";

import { Card } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { DialogProps } from "@/components/ui/dialog/use-dialogs";
import { Spinner } from "@/components/ui/spinner";
import { getUserSignature } from "@/hrm/contract/flows/personnel-contract/services/getUserSignature";
import { Assignee } from "@/inspection/models/Assignee";
import generateTemplate from "@/template-engine/services/generateTemplate";

import { ids } from "../models/Ids";

type TemplateData = Partial<{
	[ids.letterDate]: string;
	[ids.letterHasAttachments]: boolean;
	[ids.letterTo]: string;
	[ids.letterSubject]: string;
	[ids.letterContent]: string;
	[ids.reviewerPosition]?: string;
	letterNo?: string;
	reviewer?: Assignee;
}>;

type DialogPayload = {
	values: TemplateData;
};

function LetterPreviewDialog({
	payload: { values },
	open,
	onClose,
}: DialogProps<DialogPayload>) {
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [content, setContent] = useState<Blob>();

	useEffect(() => {
		(async () => {
			try {
				setIsLoading(true);

				const signature =
					values.letterNo && values.reviewer?.id
						? await getUserSignature(values.reviewer.id)
						: undefined;

				const data = {
					...values,
					signature,
				};

				const content = await generateTemplate({
					data,
					name: "secretariat/letter.html",
					output: "xxx",
					download: true,
				});
				setContent(content);
			} catch (err) {
				console.error(err);
				toast.error("خطای نامشخصی در هنگام دریافت اطلاعات رخ داد.");
			} finally {
				setIsLoading(false);
			}
		})();
	}, [values]);

	return (
		<Dialog open={open} onOpenChange={() => onClose()}>
			<DialogContent className="max-w-screen-lg">
				<DialogHeader>
					<DialogTitle>خروجی فاکتور</DialogTitle>
				</DialogHeader>
				<div className="space-y-6">
					<Card className="flex min-h-[32rem] w-full items-center justify-center bg-gray-100 px-2">
						<Spinner loading={isLoading}>
							<Document file={content} />
						</Spinner>
					</Card>

					{/* <div className="flex flex-col gap-3 xs:flex-row">
						<Button className="xs:min-w-24" onClick={handlePrintClick}>
							<FaPrint />
							پرینت
						</Button>

						<Button
							className="xs:min-w-24"
							disabled={isPending}
							onClick={handleDownloadClick}
						>
							<Spinner loading={isPending} size="sm">
								<FaDownload />
								دانلود
							</Spinner>
						</Button>
					</div> */}
				</div>
			</DialogContent>
		</Dialog>
	);
}

export { LetterPreviewDialog };
