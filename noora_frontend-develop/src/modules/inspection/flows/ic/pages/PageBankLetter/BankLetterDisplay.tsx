import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { AlertDescription } from "@/components/ui/alert";
import { DestructiveAlert } from "@/components/ui/alert/destructive-alert";
import { Button } from "@/components/ui/button";
import docxGenerator from "@/docx/docxGenerator";
import { getTemplateString } from "@/felo/templates/services/getTemplateString";
import { getTemplateUrl } from "@/felo/templates/services/getTemplateUrl";
import { Select } from "@/form/select";
import { useInspectionContext } from "@/inspection/context/InspectionContext";
import { Head } from "@/ui/Head";
import { toFarsiNum } from "@/utils/string/toFarsiNum";

import { BankLetterType, bankLetterTypes } from "../../models/BankLetterType";
import { ids } from "../../models/Ids";
import { EditBankLetter } from "./EditBankLetter";
import { bankLetterKeys } from "./PageBankLetter";

export const BankLetterDisplay = memo(
	function BankLetterDisplay(): JSX.Element {
		const { instance } = useInspectionContext();
		const { [ids.inspectionMethod]: inspectionMethod } = instance.parameters;

		const [error, setError] = useState<string | null>(null);
		const [isLoading, setLoading] = useState<boolean>(true);
		const [letterType, setLetterType] = useState<BankLetterType | null>(
			inspectionMethod
				? inspectionMethod === "source"
					? BankLetterType.Source
					: inspectionMethod === "destination"
						? BankLetterType.Destination
						: null
				: null,
		);
		const [content, setContent] = useState<string>("");

		const letterUrl = useMemo(() => {
			return `inspection/ic/BankLetter${
				letterType === BankLetterType.Source ? "Source" : "Destination"
			}.html`;
		}, [letterType]);

		const iframeRef = useRef<HTMLIFrameElement | null>(null);

		const fetchTemplateContent = useCallback(async () => {
			try {
				setLoading(true);

				const content = await getTemplateString(instance.id, letterUrl, [
					...bankLetterKeys,
				]);

				if (content) {
					setContent(content);
				}
			} catch (err: any) {
				console.error(err);
				setError(err.message || "Something went wrong.");
			} finally {
				setLoading(false);
			}
		}, [instance.id, letterUrl]);

		const downloadWord = () => {
			const outputFilename = `${instance.caseNo} Bank Letter`;

			const wordBankLetterData = {
				date: toFarsiNum(new Date().toLocaleDateString("fa-IR")),
				caseNo: `${toFarsiNum(instance.caseNo)}/۱`,
				bankName: instance.parameters[ids.bankName],
				bankBranch: toFarsiNum(instance.parameters[ids.bankBranch]),
				goodsDescriptions: instance.parameters[ids.goodsDescriptions]
					.split(",")
					.join("، "),
				goodsCustomTariffNos: instance.parameters[ids.goodsCustomTariffNos]
					.split(",")
					.join("، "),
				goodsLength:
					instance.parameters[ids.goodsDescriptions].split(",").length > 1
						? " های"
						: "",
				buyer: instance.parameters[ids.buyer].name,
				proformaDate: instance.parameters[ids.proformaDate],
				proformaNo: instance.parameters[ids.proformaNo],
				registrationOrderNo: instance.parameters[ids.registrationOrderNo],
				registrationOrderDate: instance.parameters[ids.registrationOrderDate],
			};

			if (letterType === "source") {
				docxGenerator({
					docxPath: "/docx/inspection/ic/BankLetterSource.docx",
					outPutFileName: outputFilename,
					data: wordBankLetterData,
				});
			}
			if (letterType === "destination") {
				docxGenerator({
					docxPath: "/docx/inspection/ic/BankLetterDestination.docx",
					outPutFileName: outputFilename,
					data: wordBankLetterData,
				});
			}
		};

		useEffect(() => {
			if (letterType) {
				fetchTemplateContent();
			}
		}, [instance, letterType, fetchTemplateContent]);

		return (
			<>
				<div className="space-y-6">
					<Head.Root>
						<Head.Title text="نامه پذیرش بانک" />
					</Head.Root>

					<div className="flex items-center gap-x-3">
						<label htmlFor="letterType">نوع نامه:</label>
						<div className="sh basis-48">
							<Select<BankLetterType>
								id="letterType"
								value={letterType || undefined}
								items={bankLetterTypes}
								onMutate={(v) => setLetterType(v || null)}
							/>
						</div>
					</div>
					{isLoading ? (
						<div className="w-fit rounded-xl border-e-8 border-s-8 border-gray-200">
							<div className="overflow-hidden border border-gray-200">
								<div
									className={"h-[32rem] w-a4-portrait overflow-y-auto"}
								></div>
							</div>
						</div>
					) : error ? (
						<DestructiveAlert>
							<AlertDescription>{error}</AlertDescription>
						</DestructiveAlert>
					) : (
						letterType && (
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
												letterUrl,
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
						)
					)}
				</div>
				<EditBankLetter onUpdate={fetchTemplateContent} />
			</>
		);
	},
);
