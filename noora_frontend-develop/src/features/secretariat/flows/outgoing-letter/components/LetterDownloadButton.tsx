import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { getUserSignature } from "@/hrm/contract/flows/personnel-contract/services/getUserSignature";
import { Assignee } from "@/inspection/models/Assignee";
import downloadTemplate from "@/template-engine/utils/downloadTemplate";

import { ids } from "../models/Ids";

type TemplateData = Partial<{
	[ids.letterDate]: string;
	[ids.letterHasAttachments]: boolean;
	[ids.letterTo]: string;
	[ids.letterToPosition]: string;
	[ids.letterSubject]: string;
	[ids.letterContent]: string;
	[ids.reviewerPosition]?: string;
	letterNo?: string;
	reviewer?: Assignee;
}>;

type TemplateMode = "with" | "without";

function LetterDownloadButton({ values }: { values: TemplateData }) {
	const [pendingFor, setPendingFor] = useState<TemplateMode>();

	async function handleClick(mode: TemplateMode) {
		try {
			setPendingFor(mode);

			const signature =
				values.letterNo && values.reviewer?.id
					? await getUserSignature(values.reviewer.id)
					: undefined;

			const data = {
				...values,
				signature,
			};

			const templateName = `secretariat/${mode === "with" ? "letter.html" : "letter-without-design.html"}`;

			await downloadTemplate({
				data,
				name: templateName,
				output: "پیش نویس نامه",
			});
		} catch (err: any) {
			console.error(err);
			toast.error("خطای نامشخصی هنگام دانلود رخ داد.");
		} finally {
			setPendingFor(undefined);
		}
	}

	return (
		<div className="flex items-center gap-3">
			<Button
				disabled={!!pendingFor}
				type="button"
				onClick={handleClick.bind(null, "with")}
			>
				<Spinner loading={pendingFor === "with"} size="sm">
					دانلود نامه (با سربرگ)
				</Spinner>
			</Button>

			<Button
				disabled={!!pendingFor}
				type="button"
				onClick={handleClick.bind(null, "without")}
			>
				<Spinner loading={pendingFor === "without"} size="sm">
					دانلود نامه (بدون سربرگ)
				</Spinner>
			</Button>
		</div>
	);
}

export { LetterDownloadButton };
