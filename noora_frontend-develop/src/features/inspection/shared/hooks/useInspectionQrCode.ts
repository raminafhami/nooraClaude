"use client";

import { useEffect, useState } from "react";

import { Instance } from "@/felo/instances/models/Instance";

import { getInspectionQrCode } from "../utils/getInspectionQrCode";
import { useInspectionPublicUrl } from "./useInspectionPublicUrl";

function useInspectionQrCode(
	instance: Pick<Instance, "id" | "parameters">,
	args: Partial<{ publicUrl: string | null }> = {},
): string | null {
	const publicUrl = useInspectionPublicUrl(instance) || args.publicUrl;

	const [qrCode, setQrCode] = useState<string | null>(null);

	useEffect(() => {
		const fn = async () => {
			if (publicUrl) {
				const qrCode = await getInspectionQrCode(publicUrl);

				setQrCode(qrCode);
			} else {
				setQrCode(null);
			}
		};

		fn();
	}, [publicUrl]);

	return qrCode;
}

export { useInspectionQrCode };
