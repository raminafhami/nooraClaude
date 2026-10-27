import apiClient from "@/api/client";

type PersonnelCertificateRecord = {
	id: string;
	expertiseId: string | null;
	// null when the training it was uploaded for has since been deleted
	title: string | null;
	type: string | null;
	organizationName: string;
	certificateDate: string | null;
	mimetype: string;
	filename: string;
};

// Every certificate uploaded for a person, newest first.
async function getPersonnelCertificates(
	userId: string,
): Promise<PersonnelCertificateRecord[]> {
	const response = await apiClient.get<PersonnelCertificateRecord[]>({
		url: "personnel-expertise/certificates",
		searchParams: { userId },
	});

	return response.result ?? [];
}

export { getPersonnelCertificates };
export type { PersonnelCertificateRecord };
