"use client";

import { useEffect, useState } from "react";

import { Instance } from "@/felo/instances/models/Instance";

import { getLetterQrCode } from "../utils/getLetterQrCode";
import { useLetterPublicUrl } from "./useLetterPublicUrl";

function useLetterQrCode(
	instance: Pick<Instance, "id" | "parameters">,
	args: Partial<{ publicUrl: string | null }> = {},
): string | null {
	const publicUrl = useLetterPublicUrl(instance) || args.publicUrl;

	const [qrCode, setQrCode] = useState<string | null>(null);

	useEffect(() => {
		const fn = async () => {
			if (publicUrl) {
				const qrCode = await getLetterQrCode(publicUrl);
				setQrCode(qrCode);
			} else {
				setQrCode(null);
			}
		};

		fn();
	}, [publicUrl]);

	return qrCode;
}

export { useLetterQrCode };
