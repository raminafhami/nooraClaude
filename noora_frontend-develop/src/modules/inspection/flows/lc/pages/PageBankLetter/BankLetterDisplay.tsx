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
import { bankLetterKeys } from "./PageBankLetter";

export const BankLetterDisplay = memo(
	function BankLetterDisplay(): JSX.Element {
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
					"inspection/lc/BankLetter.html",
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

		const downloadWord = () => {
			const wordBankLetterData = {
				date: toFarsiNum(new Date().toLocaleDateString("fa-IR")),
				caseNo: toFarsiNum(instance.caseNo),
				buyer: instance.parameters[ids.buyer].name,
				creditOpeningBankBranch: toFarsiNum(
					instance.parameters[ids.creditOpeningBankBranch],
				),
				creditOpeningBankName: instance.parameters[ids.creditOpeningBankName],
				goodsDescriptions: instance.parameters[ids.goodsDescriptions],
				proformaDate: toFarsiNum(instance.parameters[ids.proformaDate]),
				proformaNo: toFarsiNum(instance.parameters[ids.proformaNo]),
			};

			docxGenerator({
				docxPath: "/docx/inspection/lc/BankLetter.docx",
				outPutFileName: "BankLetter",
				data: wordBankLetterData,
			});
		};
		useEffect(() => {
			fetchTemplateContent();
		}, [instance, fetchTemplateContent]);

		return (
			<div className="space-y-6">
				<Head.Root>
					<Head.Title text="نامه پذیرش بانک" />
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
										"inspection/lc/BankLetter.html",
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
	},
);
