"use client";

import moment from "jalali-moment";
import { useEffect, useRef, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import docxGenerator from "@/docx/docxGenerator";
import { setStageOfInstance } from "@/felo/instances/services/setStageOfInstance";
import { useTaskContext } from "@/felo/tasks/hooks/useTaskContext";
import { getTemplateString } from "@/felo/templates/services/getTemplateString";
import { FieldError } from "@/form/FieldError";
import { getIndicatorCounterByKey } from "@/indicator/services/getIndicatorCounterByKey";
import { checkCoordinatorAndCustomerBalance } from "@/inspection/services/checkCoordinatorAndCustomerBalance";
import { messages } from "@/messages";
import Select from "@/ui/Select/Select";
import { Seperator } from "@/ui/Seperator";

import { assigneesTemplate, AssigneeType } from "../../models/Assignee";
import { certificateTemplateStatusOptions } from "../../models/CertificateTemplateStatus";
import { Goods } from "../../models/Goods";
import { ids } from "../../models/Ids";
import { schema } from "./PhaseSchema";

type FormData = z.infer<typeof schema>;

const TEMPLATE_PATH = "inspection/coi/Certificate.html";
const TEMPLATE_KEYS =
	"BillOfLadingDate,BillOfLadingNo,Brand,CertificateConclusion,CertificateIssueDate,CertificateIssueNo,Consignee,CountryOfOrigin,Exporter,Goods,GoodsSerialNos,GrossWeight,Importer,InspectionDateEnd,InspectionDateStart,InspectionPlace,InspectorName,InsuredBy,LabName,LcNo,LoadingDate,Manufacturer,NetWeight,Packing,PortOfEntry,ProformaDate,ProformaNo,QuantityShipped,QuantityTested,SamplingDate,Seller,Shipper,TestDateEnd,TestDateStart,TestingPlace,TestIssuanceDate".split(
		",",
	);

export function PhasePage() {
	const { task, hooks } = useTaskContext();

	const { control, register } = useFormContext<FormData>();

	const [content, setContent] = useState<string>("");
	const iframeRef = useRef<HTMLIFrameElement | null>(null);

	useEffect(() => {
		register(ids.certificateIssueDate);
		register(ids.certificateIssueNo);
	}, [register]);

	useEffect(() => {
		(async () => {
			try {
				const content = await getTemplateString(
					task.instanceId,
					TEMPLATE_PATH,
					TEMPLATE_KEYS,
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
			hooks.registerHook("pre-submit", async ({ task, data }) => {
				if (data[ids.certificateTemplateStatus] === "confirm") {
					await checkCoordinatorAndCustomerBalance(task);

					if (!data[ids.certificateIssueDate]) {
						data[ids.certificateIssueDate] = moment().format("YYYY-MM-DD");
					}

					data[ids.certificateIssueNo] =
						await getIndicatorCounterByKey("coi-certificate");

					// set previous task
					data[ids.previousTask] = {
						taskKey: task.key,
						assigneeKey: AssigneeType.TechnicalManager,
						assigneeTitle: assigneesTemplate[AssigneeType.TechnicalManager],
						noteContent: task.data[ids.informationFinalReviewNote],
					};
				}
			});

			hooks.registerHook("submit", async ({ task, data }) => {
				if (data[ids.certificateTemplateStatus] === "confirm") {
					await setStageOfInstance(task.instanceId, "certificate-issued");
				}
			});
		}
	}, [hooks]);

	const downloadWord = () => {
		const data = {
			caseNo: task.caseNo,
			BillOfLadingDate:
				task.data[ids.billOfLadingDate].replaceAll("/", "-") || "-",
			BillOfLadingNo: task.data[ids.billOfLadingNo],
			Brand: task.data[ids.brand],
			CertificateConclusion: task.data[ids.certificateConclusion],
			CertificateIssueDate:
				task.data[ids.certificateIssueDate]?.replaceAll("/", "-") || "-",
			CertificateIssueNo: task.data[ids.certificateIssueNo] ?? "-",
			Consignee: task.data[ids.consignee],
			CountryOfOrigin: task.data[ids.countryOfOrigin],
			Exporter: task.data[ids.exporter],
			Goods: (task.data[ids.goods] as Goods).map((x, i) => ({
				i: i + 1,
				q: x.qty,
				pu: x.packingOrUnit,
				nw: x.netWeight,
				gw: x.grossWeight,
				d: x.description,
				c: x.customTariffNoOrHsCode,
				do: x.document,
			})),
			GoodsSerialNos: task.data[ids.goodsSerialNos],
			GrossWeight: task.data[ids.grossWeight],
			Importer: task.data[ids.importer],
			InspectionDateEnd:
				task.data[ids.inspectionDateEnd].replaceAll("/", "-") || "-",
			InspectionDateStart:
				task.data[ids.inspectionDateStart].replaceAll("/", "-") || "-",
			InspectionPlace: task.data[ids.inspectionPlace],
			InspectorName: task.data[ids.inspectorName],
			InsuredBy: task.data[ids.insuredBy],
			LabName: task.data[ids.labName],
			LcNo: task.data[ids.lcNo],
			LoadingDate: task.data[ids.loadingDate].replaceAll("/", "-") || "-",
			Manufacturer: task.data[ids.manufacturer],
			NetWeight: task.data[ids.netWeight],
			Packing: task.data[ids.packing],
			PortOfEntry: task.data[ids.portOfEntry],
			ProformaDate: task.data[ids.proformaDate].replaceAll("/", "-") || "-",
			ProformaNo: task.data[ids.proformaNo],
			QuantityShipped: task.data[ids.quantityShipped],
			QuantityTested: task.data[ids.quantityTested],
			SamplingDate: task.data[ids.samplingDate].replaceAll("/", "-") || "-",
			Seller: task.data[ids.seller] || undefined,
			Shipper: task.data[ids.shipper],
			TestDateEnd: task.data[ids.testDateEnd].replaceAll("/", "-") || "-",
			TestDateStart: task.data[ids.testDateStart].replaceAll("/", "-") || "-",
			TestingPlace: task.data[ids.testingPlace],
			TestIssuanceDate:
				task.data[ids.testIssuanceDate].replaceAll("/", "-") || "-",
		};

		docxGenerator({
			docxPath: "/docx/inspection/coi/Certificate.docx",
			outPutFileName: `${task.caseNo} Certificate${
				task.data[ids.certificateIssueNo] ? "" : ` (Draft)`
			}`,
			data,
		});
	};

	return (
		<div className="grid grid-cols-12 gap-x-4 gap-y-6 md:gap-x-10">
			<div className="col-span-full">
				<div className="max-w-[51rem] rounded-xl border-e-8 border-s-8 border-gray-200">
					<div className="overflow-hidden border border-gray-200">
						<iframe
							className="h-[32rem] w-full overflow-auto lg:w-a4-portrait"
							ref={iframeRef}
							srcDoc={content}
						></iframe>
					</div>
				</div>
			</div>

			<div className="col-span-full col-start-1 flex gap-x-3">
				{/* <Button
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
              true
            );

            link.click();
          }}
        >
          دانلود PDF
        </Button> */}

				<Button className="min-w-28" type="button" onClick={downloadWord}>
					دانلود WORD
				</Button>
			</div>

			<Seperator className="mt-5" />

			<div className="col-span-full !col-start-1 space-y-2 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
				<label htmlFor={ids.certificateTemplateStatus}>نتیجه بررسی:</label>
				<Controller
					control={control}
					name={ids.certificateTemplateStatus}
					render={({ field, fieldState }) => (
						<>
							<Select items={certificateTemplateStatusOptions} {...field} />
							<FieldError error={fieldState.error} />
						</>
					)}
					rules={{
						required: messages.validation.required,
					}}
				/>
			</div>
		</div>
	);
}
