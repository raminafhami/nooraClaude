import { memo, useCallback, useEffect, useRef, useState } from "react";

import { AlertDescription } from "@/components/ui/alert";
import { DestructiveAlert } from "@/components/ui/alert/destructive-alert";
import { Button } from "@/components/ui/button";
import docxGenerator from "@/docx/docxGenerator";
import { getTemplateString } from "@/felo/templates/services/getTemplateString";
import { getTemplateUrl } from "@/felo/templates/services/getTemplateUrl";
import { useInspectionContext } from "@/inspection/context/InspectionContext";
import { Head } from "@/ui/Head";
import { toFarsiNum } from "@/utils/string/toFarsiNum";

import { ids } from "../../models/Ids";
import { bankLetterKeys } from "./PageReport";

export const ReportDisplay = memo(function ReportDisplay(): JSX.Element {
	const { instance } = useInspectionContext();

	const [error, setError] = useState<string | null>(null);
	const [isLoading, setLoading] = useState<boolean>(true);
	const [content, setContent] = useState<string>("");

	const iframeRef = useRef<HTMLIFrameElement | null>(null);

	const fetchTemplateContent = useCallback(async () => {
		try {
			setLoading(true);

			const content = await getTemplateString(
				instance.id,
				"inspection/sc/Report.html",
				[...bankLetterKeys],
			);

			if (content) {
				setContent(content);
			}
		} catch (err: any) {
			console.error(err);
			setError(err.message || "Something went wrong.");
		} finally {
			setLoading(false);
		}
	}, [instance.id]);

	useEffect(() => {
		fetchTemplateContent();
	}, [instance, fetchTemplateContent]);

	const downloadWord = () => {
		const ReportData = {
			authorityOrganization: toFarsiNum(
				instance.parameters[ids.authorityOrganization],
			),
			authorityPerson: toFarsiNum(instance.parameters[ids.authorityPerson]),
			buyer: toFarsiNum(instance.parameters[ids.buyer].name),
			reportDescription: toFarsiNum(instance.parameters[ids.reportDescription]),
			reportIssueDate: toFarsiNum(instance.parameters[ids.reportIssueDate]),
			reportIssueNo: toFarsiNum(instance.parameters[ids.reportIssueNo]),
			reportSubject: toFarsiNum(instance.parameters[ids.reportSubject]),
		};

		docxGenerator({
			docxPath: "/docx/inspection/sc/Report.docx",
			outPutFileName: `Report`,
			data: ReportData,
		});
	};

	return (
		<div className="space-y-6">
			<Head.Root>
				<Head.Title text="گزارش" />
			</Head.Root>

			{isLoading ? (
				<div className="w-fit rounded-xl border-e-8 border-s-8 border-gray-200">
					<div className="overflow-hidden border border-gray-200">
						<div className={"h-[32rem] w-a4-portrait overflow-y-auto"}></div>
					</div>
				</div>
			) : error ? (
				<DestructiveAlert>
					<AlertDescription>{error}</AlertDescription>
				</DestructiveAlert>
			) : (
				<div className="space-y-6">
					<div className="w-fit rounded-xl border-e-8 border-s-8 border-gray-200">
						<div className="overflow-hidden border border-gray-200">
							<iframe
								className={"h-[32rem] w-a4-portrait overflow-y-auto"}
								ref={iframeRef}
								srcDoc={content}
							></iframe>
						</div>
					</div>

					<div className="flex gap-x-2">
						<Button
							type="button"
							onClick={() => {
								const link = document.createElement("a");
								link.href = getTemplateUrl(
									instance.id,
									"inspection/sc/Report.html",
									[...bankLetterKeys],
									true,
								);
								link.click();
							}}
						>
							دانلود PDF
						</Button>
						<Button type="button" onClick={downloadWord}>
							دانلود Word
						</Button>

						<Button
							type="button"
							onClick={() => {
								iframeRef.current?.contentWindow?.print();
							}}
						>
							پرینت نامه
						</Button>
					</div>
				</div>
			)}
		</div>
	);
});
