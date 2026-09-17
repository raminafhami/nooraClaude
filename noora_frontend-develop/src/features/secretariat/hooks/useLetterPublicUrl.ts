"use client";

import { useEffect, useState } from "react";

import { Instance } from "@/felo/instances/models/Instance";
import { getInstanceEncryptedId } from "@/felo/instances/services/getInstanceEncryptedId";

import { getLetterPublicUrl } from "../utils/getLetterPublicUrl";

function useLetterPublicUrl(
	instance: Pick<Instance, "id" | "parameters">,
): string | null {
	const [publicUrl, setPublicUrl] = useState<string | null>(null);

	useEffect(() => {
		const updatePublicUrl = async () => {
			try {
				if (instance.parameters["LetterReviewStatus"] === "forward") {
					const encryptedId = await getInstanceEncryptedId(instance.id);

					setPublicUrl(getLetterPublicUrl(encryptedId));
				} else {
					setPublicUrl(null);
				}
			} catch {
				setPublicUrl(null);
			}
		};

		updatePublicUrl();
	}, [instance.id, instance.parameters]);

	return publicUrl;
}

export { useLetterPublicUrl };
