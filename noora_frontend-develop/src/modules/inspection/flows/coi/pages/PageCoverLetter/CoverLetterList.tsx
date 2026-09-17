import moment from "jalali-moment";
import { useMemo } from "react";
import { FaFileWord } from "react-icons/fa6";

import { Button } from "@/components/ui/button";
import { customs } from "@/data/customs";
import docxGenerator from "@/docx/docxGenerator";
import { useInspectionContext } from "@/inspection/context/InspectionContext";
import { GenericObject } from "@/ts/GenericObject";

import { ids } from "../../models/Ids";

const DOT_PLACEHOLDER = "..........";

function replaceUndefined(data: GenericObject) {
	Object.keys(data).map((k) => {
		data[k] === undefined && (data[k] = DOT_PLACEHOLDER);
	});
}

function CoverLetterList() {
	const { instance } = useInspectionContext();

	const commonData = useMemo(
		() => ({
			CaseNo: instance.caseNo,
			BuyerName: instance.parameters[ids.buyer]?.nameEn,
			CertificateIssueDate: instance.parameters[
				ids.certificateIssueDate
			]?.replaceAll("/", "-"),
			CertificateIssueNo: instance.parameters[ids.certificateIssueNo]
				? `NAIT${instance.parameters[ids.certificateIssueNo]}`
				: undefined,
			CustomName: customs.find(
				(x) => x.value === instance.parameters[ids.customName],
			)?.label,
			LetterIssueDate: instance.parameters[ids.certificateIssueDate]
				? moment(instance.parameters[ids.certificateIssueDate]).format(
						"jYYYY/jMM/jDD",
					)
				: undefined,
			LetterIssueNo: `${instance.caseNo}/2`,
			ProformaDate: instance.parameters[ids.proformaDate]?.replaceAll("/", "-"),
			ProformaNo: instance.parameters[ids.proformaNo],
		}),
		[instance.caseNo, instance.parameters],
	);

	return (
		<div className="max-w-96 divide-y rounded-2xl border">
			<div className="flex items-center px-4 py-3">
				<span>نامه کاور مبدأ (تولید کننده)</span>
				<div className="ms-auto flex gap-2">
					<Button
						className="flex size-8 rounded-full"
						size="icon"
						onClick={() => {
							const data = {
								...commonData,
								Manufacturer: instance.parameters[ids.manufacturer],
							};

							replaceUndefined(data);

							docxGenerator({
								docxPath:
									"/docx/inspection/coi/CoverLetterSourceManufacturer.docx",
								outPutFileName: `${instance.caseNo} Cover Letter Source (Manufacturer)`,
								data,
							});
						}}
					>
						<FaFileWord size={16} />
					</Button>
				</div>
			</div>

			<div className="flex items-center px-4 py-3">
				<span>نامه کاور مبدأ (آزمایشگاه)</span>
				<div className="ms-auto flex gap-2">
					<Button
						className="flex size-8 rounded-full"
						size="icon"
						onClick={() => {
							const data = {
								...commonData,
								LabName: instance.parameters[ids.labName],
							};

							replaceUndefined(data);

							docxGenerator({
								docxPath: "/docx/inspection/coi/CoverLetterSourceLab.docx",
								outPutFileName: `${instance.caseNo} Cover Letter Source (Lab)`,
								data,
							});
						}}
					>
						<FaFileWord size={16} />
					</Button>
				</div>
			</div>

			<div className="flex items-center px-4 py-3">
				<span>نامه کاور مقصد</span>
				<div className="ms-auto flex gap-2">
					<Button
						className="flex size-8 rounded-full"
						size="icon"
						onClick={() => {
							const data = {
								...commonData,
							};

							replaceUndefined(data);

							docxGenerator({
								docxPath: "/docx/inspection/coi/CoverLetterDestination.docx",
								outPutFileName: `${instance.caseNo} Cover Letter Destination`,
								data,
							});
						}}
					>
						<FaFileWord size={16} />
					</Button>
				</div>
			</div>

			<div className="flex items-center px-4 py-3">
				<span>نامه کاور مشخصات فنی</span>
				<div className="ms-auto flex gap-2">
					<Button
						className="flex size-8 rounded-full"
						size="icon"
						onClick={() => {
							const data = {
								...commonData,
								Manufacturer: instance.parameters[ids.manufacturer],
							};

							replaceUndefined(data);

							docxGenerator({
								docxPath: "/docx/inspection/coi/CoverLetterTechnicalSpec.docx",
								outPutFileName: `${instance.caseNo} Cover Letter Technical Spec`,
								data,
							});
						}}
					>
						<FaFileWord size={16} />
					</Button>
				</div>
			</div>

			<div className="flex items-center px-4 py-3">
				<span>نامه کاور اسنادی</span>
				<div className="ms-auto flex gap-2">
					<Button
						className="flex size-8 rounded-full"
						size="icon"
						onClick={() => {
							const data = {
								...commonData,
								BuyerNameFa: instance.parameters[ids.buyer]?.name,
							};

							replaceUndefined(data);

							docxGenerator({
								docxPath: "/docx/inspection/coi/CoverLetterDocs.docx",
								outPutFileName: `${instance.caseNo} Cover Letter Docs`,
								data,
							});
						}}
					>
						<FaFileWord size={16} />
					</Button>
				</div>
			</div>
		</div>
	);
}

export { CoverLetterList };
