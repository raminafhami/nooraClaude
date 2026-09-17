import { Instance } from "@/felo/instances/models/Instance";
import { getInstanceEncryptedId } from "@/felo/instances/services/getInstanceEncryptedId";

import { getLetterPublicUrl } from "./getLetterPublicUrl";
import { getLetterQrCode } from "./getLetterQrCode";

async function tryGetLetterQrCode(
	instance: Pick<Instance, "id" | "parameters">,
): Promise<string | null> {
	if (instance.parameters?.["LetterReviewStatus"] !== "forward") {
		return null;
	}

	try {
		const encryptedId = await getInstanceEncryptedId(instance.id);
		const publicUrl = getLetterPublicUrl(encryptedId);
		const qrCode = await getLetterQrCode(publicUrl);

		return qrCode;
	} catch {
		return null;
	}
}

export { tryGetLetterQrCode };
