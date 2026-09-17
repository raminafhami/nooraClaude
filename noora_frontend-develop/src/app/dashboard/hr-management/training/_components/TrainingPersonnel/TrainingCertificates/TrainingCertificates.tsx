"use client";

import { useCallback, useEffect, useState } from "react";

import { Personnel } from "@/hrm/personnel/models/Personnel";
import { PersonnelExpertise } from "@/hrm/personnel/models/PersonnelExpertise";
import { PersonnelExpertiseStatus } from "@/hrm/personnelExpertise/models/PersonnelExpertiseStatus";
import { Modal } from "@/ui/Modal";

import { CertificatesContext } from "./CertificatesContext";
import { CertificatesDialog } from "./CertificatesDialog";

interface Props {
	personnel: Personnel | null;
	show: boolean;
	onClose: () => void;
}

export function TrainingCertificates({ personnel, show, onClose }: Props) {
	const [certificates, setCertificates] = useState<PersonnelExpertise[]>([]);

	const handleCertificateAdd = useCallback(
		(personnelId: string, expertise: PersonnelExpertise) => {
			setCertificates((previous) => [...previous, { ...expertise }]);
		},
		[],
	);

	useEffect(() => {
		if (personnel) {
			setCertificates(
				personnel.expertises?.filter(
					(x) =>
						x.type === "certificate" &&
						x.status === PersonnelExpertiseStatus.Qualified,
				) || [],
			);
		}
	}, [personnel]);

	return (
		<>
			<CertificatesContext.Provider
				value={{
					personnel,
					certificates,
					addCertificate: handleCertificateAdd,
				}}
			>
				<Modal
					content={<CertificatesDialog />}
					name="name"
					title="گواهینامه های آموزشی"
					show={show}
					size="7xl"
					onClose={onClose}
				/>
			</CertificatesContext.Provider>
		</>
	);
}
