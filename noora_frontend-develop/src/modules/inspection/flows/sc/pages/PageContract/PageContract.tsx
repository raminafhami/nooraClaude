"use client";

import { memo, useEffect, useState } from "react";

import { AlertDescription } from "@/components/ui/alert";
import { DestructiveAlert } from "@/components/ui/alert/destructive-alert";
import { Button } from "@/components/ui/button";
import docxGenerator from "@/docx/docxGenerator";
import { getInstanceById } from "@/felo/instances/services/getInstanceById";
import { useInspectionContext } from "@/inspection/context/InspectionContext";
import { Head } from "@/ui/Head";
import { Loading } from "@/ui/Loader";
import { toCurrency } from "@/utils/String";
import { toFarsiNum } from "@/utils/string/toFarsiNum";

import { ContractAttachmentStatus } from "../../models/ContractAttachmentStatus";
import { ids } from "../../models/Ids";

const keysAndLabels: { key: string; label?: string }[] = [
	{ key: ids.authorityOrganization },
	{ key: ids.authorityPerson },
	{ key: ids.buyer, label: "خریدار" },
	{ key: ids.caseOperationDescription },
	{ key: ids.caseOperationSummary },
	{ key: ids.contractAttachmentStatus },
	{ key: ids.contractDuration },
	{ key: ids.contractEmployerObligations },
	{ key: ids.contractEndDate },
	{ key: ids.contractInspectorObligations },
	{ key: ids.contractIssueDate },
	{ key: ids.contractIssueNo },
	{ key: ids.contractObligationsFulfillmentArticle },
	{ key: ids.contractObligationsFulfillmentClauses },
	{ key: ids.contractStartDate },
	{ key: ids.contractSubject },
	{ key: ids.contractSubjectArticle },
	{ key: ids.inspectionFeeInRial },
];

export const PageContract = memo(function PageContract(): React.ReactNode {
	const { instance, onInstanceUpdate } = useInspectionContext();

	const [isLoading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<React.ReactNode | null>(null);

	useEffect(() => {
		(async () => {
			let data: any = instance.parameters || {};

			const incompleteData: string[] = [];
			const updateData: any = {};

			try {
				if (
					keysAndLabels.filter((x) => data[x.key] === undefined).length !== 0
				) {
					setLoading(true);
					setError(null);

					data = await getInstanceById(
						instance.id,
						keysAndLabels.map((x) => x.key),
					).then((instance) => instance.parameters || {});

					keysAndLabels.forEach((item) => {
						if (data[item.key] === undefined && item.label) {
							incompleteData.push(item.label);
						} else {
							updateData[item.key] = data[item.key];
						}
					});
				}

				if (Object.keys(updateData).length !== 0) {
					onInstanceUpdate(updateData);
				}

				if (incompleteData.length !== 0) {
					throw new Error(
						`فیلدهای مقابل تکمیل نشده اند: ${incompleteData.join("، ")}`,
					);
				}
			} catch (err: any) {
				console.error(err);
				setError(err.message || "Something went wrong.");
			} finally {
				setLoading(false);
			}
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const downloadWord = () => {
		const contractData = {
			contractIssueDate:
				toFarsiNum(instance.parameters[ids.contractIssueDate]) ?? "-",
			contractIssueNo:
				toFarsiNum(instance.parameters[ids.contractIssueNo]) ?? "-",
			contractAttachmentStatus:
				instance.parameters[ids.contractAttachmentStatus] ===
				ContractAttachmentStatus.Yes
					? "دارد"
					: "ندارد",
			authorityOrganization: toFarsiNum(
				instance.parameters[ids.authorityOrganization],
			),
			authorityPerson: toFarsiNum(instance.parameters[ids.authorityPerson]),
			buyer: toFarsiNum(instance.parameters[ids.buyer].name),
			contractSubject: toFarsiNum(instance.parameters[ids.contractSubject]),
			contractSubjectArticle: toFarsiNum(
				instance.parameters[ids.contractSubjectArticle],
			),
			contractStartDate: toFarsiNum(instance.parameters[ids.contractStartDate]),
			contractEndDate: toFarsiNum(instance.parameters[ids.contractEndDate]),
			contractDuration: toFarsiNum(instance.parameters[ids.contractDuration]),
			caseOperationSummary: toFarsiNum(
				instance.parameters[ids.caseOperationSummary],
			),
			inspectionFeeInRial: toFarsiNum(
				toCurrency(instance.parameters[ids.inspectionFeeInRial]),
			),
			contractEmployerObligations: instance.parameters[
				ids.contractEmployerObligations
			].map((employer: string, index: number) => {
				return {
					index: toFarsiNum(index + 1),
					obligations: toFarsiNum(employer),
				};
			}),
			contractInspectorObligations: instance.parameters[
				ids.contractInspectorObligations
			].map((inspector: string, index: number) => {
				return {
					index: toFarsiNum(index + 1),
					obligations: toFarsiNum(inspector),
				};
			}),
			contractObligationsFulfillmentArticle: toFarsiNum(
				instance.parameters[ids.contractObligationsFulfillmentArticle],
			),
			contractObligationsFulfillmentClauses: instance.parameters[
				ids.contractObligationsFulfillmentClauses
			].map((clauses: string, index: number) => {
				return {
					index: toFarsiNum(index + 1),
					obligations: toFarsiNum(clauses),
				};
			}),
		};

		docxGenerator({
			docxPath: "/docx/inspection/sc/Contract.docx",
			outPutFileName: `${instance.caseNo} Supervision Contract`,
			data: contractData,
		});
	};

	return (
		<>
			{isLoading ? (
				<Loading size="sm">در حال دریافت اطلاعات...</Loading>
			) : error ? (
				<DestructiveAlert>
					<AlertDescription>{error}</AlertDescription>
				</DestructiveAlert>
			) : (
				<div className="shrink-0 space-y-10">
					<Head.Root>
						<Head.Title text="قرارداد" />
					</Head.Root>

					<div className="flex gap-x-2">
						<Button type="button" onClick={downloadWord}>
							دانلود Word
						</Button>
					</div>
				</div>
			)}
		</>
	);
});
