"use client";

import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { useTaskContext } from "@/felo/tasks/hooks/useTaskContext";
import { getTemplateString } from "@/felo/templates/services/getTemplateString";
import { getTemplateUrl } from "@/felo/templates/services/getTemplateUrl";
import { Seperator } from "@/ui/Seperator";

const TEMPLATE_PATH = "inspection/bank-coi/Certificate.html";
const TEMPLATE_KEYS =
	"caseNo,BillOfLadingDate,BillOfLadingNo,CertificateConclusion,CertificateIssueDate,CertificateIssueNo,Consignee,CountryOfOrigin,Goods,GrossWeight,Exporter,InspectionDateEnd,InspectionDateStart,InspectionPlace,Importer,PortOfEntry,ProformaNo,ProformaDate,RegistrationOrderNo,SamplingDate,Shipper,TestDateEnd,TestDateStart".split(
		",",
	);

export function PhasePage() {
	const { task, hooks } = useTaskContext();

	const [content, setContent] = useState<string>("");
	const iframeRef = useRef<HTMLIFrameElement | null>(null);

	useEffect(() => {
		(async () => {
			try {
				const content = await getTemplateString(
					task.instanceId,
					"inspection/bank-coi/Certificate.html",
					"caseNo,BillOfLadingDate,BillOfLadingNo,Brand,CertificateConclusion,CertificateIssueDate,CertificateIssueNo,Consignee,CountryOfOrigin,Goods,GrossWeight,Exporter,InspectionDateEnd,InspectionDateStart,InspectionPlace,Importer,Manufacturer,PortOfEntry,ProformaNo,ProformaDate,RegistrationOrderNo,SamplingDate,Shipper,TestDateEnd,TestDateStart".split(
						",",
					),
				);

				if (content) {
					setContent(content);
				}
			} catch (err: any) {
				console.error(err);
			}
		})();
	}, [task.instanceId]);

	useEffect(() => {
		if (hooks.get().length === 0) {
		}
	}, [hooks]);

	return (
		<div className="grid grid-cols-12 gap-x-10 gap-y-6">
			<div className="col-span-full basis-48">
				<div className="w-fit rounded-xl border-e-8 border-s-8 border-gray-200">
					<div className="overflow-hidden border border-gray-200">
						<iframe
							className="h-[32rem] w-a4-portrait overflow-y-auto"
							ref={iframeRef}
							srcDoc={content}
						></iframe>
					</div>
				</div>
			</div>

			<div className="col-span-full col-start-1 flex gap-x-3">
				<Button
					className="min-w-28"
					type="button"
					onClick={() => {
						iframeRef.current?.contentWindow?.print();
					}}
				>
					پرینت
				</Button>

				<Button
					className="min-w-28"
					type="button"
					onClick={async () => {
						const link = document.createElement("a");
						link.href = getTemplateUrl(
							task.instanceId,
							TEMPLATE_PATH,
							TEMPLATE_KEYS,
							true,
						);

						link.click();
					}}
				>
					دانلود
				</Button>
			</div>

			<Seperator className="mt-5" />
		</div>
	);
}
