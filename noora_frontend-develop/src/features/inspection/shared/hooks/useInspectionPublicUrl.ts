"use client";

import { useEffect, useState } from "react";

import { Instance } from "@/felo/instances/models/Instance";
import { getInstanceEncryptedId } from "@/felo/instances/services/getInstanceEncryptedId";

import { getInspectionPublicUrl } from "../utils/getInspectionPublicUrl";

function useInspectionPublicUrl(
	instance: Pick<Instance, "id" | "parameters">,
): string | null {
	const [publicUrl, setPublicUrl] = useState<string | null>(null);

	useEffect(() => {
		const updatePublicUrl = async () => {
			try {
				if (
					instance.parameters?.["CertificateIssueNo"] &&
					instance.parameters?.["CertificateIssueDate"]
				) {
					const encryptedId = await getInstanceEncryptedId(instance.id);

					setPublicUrl(getInspectionPublicUrl(encryptedId));
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

export { useInspectionPublicUrl };
