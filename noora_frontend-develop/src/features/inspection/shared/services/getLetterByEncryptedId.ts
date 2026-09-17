import ky from "ky";

import { routes } from "@/routes";

async function getLetterByEncryptedId(encryptedId: string): Promise<Blob> {
	const response = await ky
		.get(`${routes.internalApi}/letter/public/${encryptedId}`, {
			throwHttpErrors: true,
		})
		.blob();

	return response;
}

export { getLetterByEncryptedId };
