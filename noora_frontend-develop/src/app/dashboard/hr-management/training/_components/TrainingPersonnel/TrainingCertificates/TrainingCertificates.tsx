"use client";

import { useCallback, useEffect, useState } from "react";

import { Personnel } from "@/hrm/personnel/models/Personnel";
import { PersonnelExpertise } from "@/hrm/personnel/models/PersonnelExpertise";
import { PersonnelExpertiseStatus } from "@/hrm/personnelExpertise/models/PersonnelExpertiseStatus";
import { Modal } from "@/ui/Modal";

import { ChecklistItem } from "../TrainingTable/PersonnelExpertises";
import { CertificatesContext } from "./CertificatesContext";
import { CertificatesDialog } from "./CertificatesDialog";

interface Props {
	personnel: Personnel | null;
	// one training item: its certificate is uploaded / shown here
	item: ChecklistItem | null;
	show: boolean;
	onClose: () => void;
}

export function TrainingCertificates({ personnel, item, show, onClose }: Props) {
	const [certificates, setCertificates] = useState<PersonnelExpertise[]>([]);

	const handleCertificateAdd = useCallback(
		(personnelId: string, expertise: PersonnelExpertise) => {
			setCertificates((previous) => [...previous, { ...expertise }]);
		},
		[],
	);

	const handleCertificateRemove = useCallback((expertiseId: string) => {
		setCertificates((previous) => previous.filter((x) => x.id !== expertiseId));
	}, []);

	useEffect(() => {
		if (personnel && item) {
			setCertificates(
				personnel.expertises?.filter(
					(x) =>
						item.copyIds.includes(x.id) &&
						x.status === PersonnelExpertiseStatus.Qualified &&
						!!x.certificate?.id,
				) || [],
			);
		}
	}, [personnel, item]);

	return (
		<>
			<CertificatesContext.Provider
				value={{
					personnel,
					item,
					certificates,
					addCertificate: handleCertificateAdd,
					removeCertificate: handleCertificateRemove,
				}}
			>
				<Modal
					content={<CertificatesDialog />}
					name="name"
					title="گواهینامه آموزشی"
					show={show}
					size="7xl"
					onClose={onClose}
				/>
			</CertificatesContext.Provider>
		</>
	);
}
