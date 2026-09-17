"use client";

import { memo, useEffect, useRef, useState } from "react";

import { AlertDescription } from "@/components/ui/alert";
import { DestructiveAlert } from "@/components/ui/alert/destructive-alert";
import { Button } from "@/components/ui/button";
import docxGenerator from "@/docx/docxGenerator";
import { getInstanceById } from "@/felo/instances/services/getInstanceById";
import { getTemplateString } from "@/felo/templates/services/getTemplateString";
import { getTemplateUrl } from "@/felo/templates/services/getTemplateUrl";
import { useInspectionContext } from "@/inspection/context/InspectionContext";
import { Head } from "@/ui/Head";
import { Loading } from "@/ui/Loader";

import { Goods } from "../../models/Goods";
import { ids } from "../../models/Ids";

const keysAndLabels: { key: string; label?: string }[] = [
	{ key: ids.billOfLadingDate, label: "تاریخ بارنامه" },
	{ key: ids.billOfLadingNo, label: "شماره بارنامه" },
	{ key: ids.brand, label: "برند" },
	{ key: ids.certificateConclusion },
	{ key: ids.certificateIssueDate },
	{ key: ids.certificateIssueNo },
	{ key: ids.consignee, label: "گیرنده" },
	{ key: ids.countryOfOrigin, label: "کشور مبدأ" },
	{ key: ids.exporter, label: "صادر کننده" },
	{ key: ids.goods, label: "کالاها" },
	{ key: ids.goodsSerialNos, label: "شماره سریال/کد کالاها" },
	{ key: ids.grossWeight, label: "وزن ناخالص" },
	{ key: ids.importer, label: "وارد کننده" },
	{ key: ids.inspectionDateEnd, label: "تاریخ پایان بازرسی" },
	{ key: ids.inspectionDateStart, label: "تاریخ شروع بازرسی" },
	{ key: ids.inspectionPlace, label: "محل بازرسی" },
	{ key: ids.inspectorName, label: "نام بازرس" },
	{ key: ids.insuredBy },
	{ key: ids.labName, label: "نام آزمایشگاه" },
	{ key: ids.lcNo, label: "شماره L/C" },
	{ key: ids.loadingDate, label: "تاریخ بارگیری" },
	{ key: ids.manufacturer, label: "تولید کننده" },
	{ key: ids.netWeight, label: "وزن خالص" },
	{ key: ids.packing },
	{ key: ids.portOfEntry, label: "بندر ورودی" },
	{ key: ids.proformaDate, label: "تاریخ پروفرما" },
	{ key: ids.proformaNo, label: "شماره پروفرما" },
	{ key: ids.quantityShipped, label: "مقدار ارسال شده" },
	{ key: ids.quantityTested, label: "مقدار آزمون شده" },
	{ key: ids.samplingDate, label: "تاریخ نمونه گیری" },
	{ key: ids.seller },
	{ key: ids.shipper, label: "ارسال کننده" },
	{ key: ids.testDateEnd, label: "تاریخ پایان آزمون" },
	{ key: ids.testDateStart, label: "تاریخ شروع آزمون" },
	{ key: ids.testingPlace, label: "مکان آزمون" },
	{ key: ids.testIssuanceDate, label: "تاریخ صدور آزمون" },
];

function CertificateWidget() {
	const { instance, onInstanceUpdate } = useInspectionContext();

	const [isLoading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<React.ReactNode | null>(null);

	const [content, setContent] = useState<string>("");
	const iframeRef = useRef<HTMLIFrameElement | null>(null);

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

				const content = await getTemplateString(
					instance.id,
					"inspection/coi/Certificate.html",
					[...keysAndLabels.map((x) => x.key)],
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
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const downloadWord = () => {
		const data = {
			caseNo: instance.caseNo,
			BillOfLadingDate:
				instance.parameters[ids.billOfLadingDate].replaceAll("/", "-") || "-",
			BillOfLadingNo: instance.parameters[ids.billOfLadingNo],
			Brand: instance.parameters[ids.brand],
			CertificateConclusion: instance.parameters[ids.certificateConclusion],
			CertificateIssueDate:
				instance.parameters[ids.certificateIssueDate]?.replaceAll("/", "-") ||
				"-",
			CertificateIssueNo: instance.parameters[ids.certificateIssueNo]
				? `NAIT${instance.parameters[ids.certificateIssueNo]}`
				: "-",
			Consignee: instance.parameters[ids.consignee],
			CountryOfOrigin: instance.parameters[ids.countryOfOrigin],
			Exporter: instance.parameters[ids.exporter],
			Goods: (instance.parameters[ids.goods] as Goods).map((x, i) => ({
				i: i + 1,
				q: x.qty,
				pu: x.packingOrUnit,
				nw: x.netWeight,
				gw: x.grossWeight,
				d: x.description,
				c: x.customTariffNoOrHsCode,
				do: x.document,
			})),
			GoodsSerialNos: instance.parameters[ids.goodsSerialNos],
			GrossWeight: instance.parameters[ids.grossWeight],
			Importer: instance.parameters[ids.importer],
			InspectionDateEnd:
				instance.parameters[ids.inspectionDateEnd].replaceAll("/", "-") || "-",
			InspectionDateStart:
				instance.parameters[ids.inspectionDateStart].replaceAll("/", "-") ||
				"-",
			InspectionPlace: instance.parameters[ids.inspectionPlace],
			InspectorName: instance.parameters[ids.inspectorName],
			InsuredBy: instance.parameters[ids.insuredBy] ?? "-",
			LabName: instance.parameters[ids.labName],
			LcNo: instance.parameters[ids.lcNo],
			LoadingDate:
				instance.parameters[ids.loadingDate].replaceAll("/", "-") || "-",
			Manufacturer: instance.parameters[ids.manufacturer],
			NetWeight: instance.parameters[ids.netWeight],
			Packing: instance.parameters[ids.packing],
			PortOfEntry: instance.parameters[ids.portOfEntry],
			ProformaDate:
				instance.parameters[ids.proformaDate].replaceAll("/", "-") || "-",
			ProformaNo: instance.parameters[ids.proformaNo],
			QuantityShipped: instance.parameters[ids.quantityShipped],
			QuantityTested: instance.parameters[ids.quantityTested],
			SamplingDate:
				instance.parameters[ids.samplingDate].replaceAll("/", "-") || "-",
			Seller: instance.parameters[ids.seller] || undefined,
			Shipper: instance.parameters[ids.shipper],
			TestDateEnd:
				instance.parameters[ids.testDateEnd].replaceAll("/", "-") || "-",
			TestDateStart:
				instance.parameters[ids.testDateStart].replaceAll("/", "-") || "-",
			TestingPlace: instance.parameters[ids.testingPlace],
			TestIssuanceDate:
				instance.parameters[ids.testIssuanceDate].replaceAll("/", "-") || "-",
		};

		docxGenerator({
			docxPath: "/docx/inspection/coi/Certificate.docx",
			outPutFileName: `${instance.caseNo} Certificate${
				instance.parameters[ids.certificateIssueNo] ? "" : ` (Draft)`
			}`,
			data,
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
						<Head.Title
							text={
								instance.parameters[ids.certificateIssueNo]
									? "گواهی"
									: "پیش نویش گواهی"
							}
						/>
					</Head.Root>

					<div className="w-fit rounded-xl border-e-8 border-s-8 border-gray-200">
						<div className="overflow-hidden border border-gray-200">
							<iframe
								className="h-[32rem] w-a4-portrait overflow-y-auto"
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
									"inspection/coi/Certificate.html",
									[...keysAndLabels.map((x) => x.key)],
									true,
								);
								link.click();
							}}
						>
							دانلود PDF (بدون سربرگ)
						</Button>

						<Button className="min-w-28" type="button" onClick={downloadWord}>
							دانلود Word (بدون سربرگ)
						</Button>

						<Button
							type="button"
							onClick={() => {
								iframeRef.current?.contentWindow?.print();
							}}
						>
							پرینت
						</Button>
					</div>
				</div>
			)}
		</>
	);
}

export default memo(CertificateWidget);
