"use client";

import moment from "moment-jalaali";
import { memo, useContext } from "react";
import { FaTimes } from "react-icons/fa";
import { FaCheck, FaEye, FaPencil, FaTrash } from "react-icons/fa6";
import { toast } from "sonner";

import { useDialogs } from "@/components/ui/dialog/use-dialogs";
import { PersonnelExpertise } from "@/hrm/personnel/models/PersonnelExpertise";
import { getCertificateFile } from "@/hrm/personnelExpertise/services/getCertificateFile";
import { Head } from "@/ui/Head";
import { Panel } from "@/ui/Panel";
import { Table } from "@/ui/Table";
import downloadBlob from "@/utils/downloadBlob";

import { TrainingContext } from "../TrainingContext";
import { CertificateDeleteDialog } from "./CertificateDeleteDialog";
import { CertificatesContext } from "./CertificatesContext";

const CERTIFICATE_EXTENSIONS: Record<string, string> = {
	"application/pdf": "pdf",
	"image/jpeg": "jpg",
	"image/png": "png",
	"image/heic": "heic",
	"application/zip": "zip",
	"application/vnd.ms-excel": "xls",
	"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
	"text/csv": "csv",
	"application/msword": "doc",
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document":
		"docx",
	"video/mp4": "mp4",
};

function getCertificateExtension(mimeType: string): string {
	return CERTIFICATE_EXTENSIONS[mimeType] || mimeType.split("/")[1] || "bin";
}

export const CertificatesTable = memo(function CertificatesTable() {
	const { personnel, certificates, removeCertificate } =
		useContext(CertificatesContext);
	const { updateExpertise } = useContext(TrainingContext);
	const dialogs = useDialogs();

	async function handleDownload(expertise: PersonnelExpertise) {
		if (!expertise.certificate?.id) {
			return;
		}

		try {
			const blob = await getCertificateFile(expertise.certificate.id);
			const extension = getCertificateExtension(blob.type);

			downloadBlob({
				blob,
				filename: `${personnel?.fullname} - ${expertise.title}.${extension}`,
			});
		} catch (err) {
			console.error(err);
			toast.error("خطایی هنگام دانلود فایل گواهینامه رخ داد.");
		}
	}

	async function handleDelete(expertise: PersonnelExpertise) {
		const result = await dialogs.open(CertificateDeleteDialog, expertise);

		if (result) {
			removeCertificate(expertise.id);

			if (personnel) {
				updateExpertise(personnel.id, result);
			}
		}
	}

	return (
		<div className="col-span-8 col-start-5 space-y-6">
			<Head.Root>
				<Head.Title text="لیست گواهی های آموزشی" />
			</Head.Root>
			<Panel.Root>
				<Table.Root>
					<Table.Head>
						<Table.Row className="bg-gray-100 text-right">
							<Table.Cell as="th" className="w-12"></Table.Cell>
							<Table.Cell as="th" className="w-12">
								ردیف
							</Table.Cell>
							<Table.Cell as="th">عنوان</Table.Cell>
							<Table.Cell as="th">سازمان گواهی دهنده</Table.Cell>
							<Table.Cell as="th">تاریخ گواهی</Table.Cell>
						</Table.Row>
					</Table.Head>
					<Table.Body>
						{certificates.length ? (
							certificates.map((expertise, index) => {
								return (
									<Table.Row key={expertise.id}>
										<Table.Cell>
											<Table.Actions>
												{expertise.type !== "certificate" ? (
													expertise.status === "qualified" ? (
														<Table.Action>
															<FaTimes />
														</Table.Action>
													) : (
														<Table.Action>
															<FaCheck />
														</Table.Action>
													)
												) : expertise.status === "unqualified" ? (
													<Table.Action>
														<FaPencil />
													</Table.Action>
												) : (
													<>
														<Table.Action
															onClick={() => handleDownload(expertise)}
														>
															<FaEye />
														</Table.Action>
														<Table.Action
															onClick={() => handleDelete(expertise)}
														>
															<FaTrash />
														</Table.Action>
													</>
												)}
											</Table.Actions>
										</Table.Cell>
										<Table.Cell>{index + 1}</Table.Cell>
										<Table.Cell>{expertise.title}</Table.Cell>
										<Table.Cell>
											{expertise.certificate?.organizationName}
										</Table.Cell>
										<Table.Cell>
											{moment(
												expertise.certificate?.certificateDate || "",
											).format("jYYYY/jMM/jDD")}
										</Table.Cell>
									</Table.Row>
								);
							})
						) : (
							<Table.Row key="empty">
								<Table.Cell></Table.Cell>
								<Table.Cell colSpan={100}>توانمندی ای یافت نشد.</Table.Cell>
							</Table.Row>
						)}
					</Table.Body>
				</Table.Root>
			</Panel.Root>
		</div>
	);
});
