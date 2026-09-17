import ky from "ky";

import { routes } from "@/routes";

async function getInspectionCertificateByEncryptedId(
	encryptedId: string,
): Promise<Blob> {
	const response = await ky
		.get(`${routes.internalApi}/inspection/public/${encryptedId}/certificate`, {
			throwHttpErrors: true,
		})
		.blob();

	return response;
}

export { getInspectionCertificateByEncryptedId };
