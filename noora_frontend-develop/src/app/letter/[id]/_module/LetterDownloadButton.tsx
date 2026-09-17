"use client";

import { useCallback, useState } from "react";
import { FaDownload } from "react-icons/fa6";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Instance } from "@/felo/instances/models/Instance";
import { getLetterByEncryptedId } from "@/inspection/shared/services/getLetterByEncryptedId";
import downloadBlob from "@/utils/downloadBlob";

function LetterDownloadButton({
	instance,
	encryptedId,
}: {
	instance: Instance;
	encryptedId: string;
}) {
	const [isPending, setIsPending] = useState<boolean>(false);

	const handleClick = useCallback(async () => {
		try {
			setIsPending(true);

			const blob = await getLetterByEncryptedId(encryptedId);

			const filename = `${instance.caseNo} Letter`;

			await downloadBlob({
				blob,
				filename,
			});
		} catch (err) {
			toast.error("خطای نامشخصی در هنگام دریافت اطلاعات رخ داد.");
		} finally {
			setIsPending(false);
		}
	}, [encryptedId, instance.caseNo]);

	return (
		<Button
			className="min-w-full xs:min-w-24"
			disabled={isPending}
			onClick={handleClick}
		>
			<Spinner loading={isPending} size="xs">
				<FaDownload />
			</Spinner>
			<span>دانلود نامه</span>
		</Button>
	);
}

export { LetterDownloadButton };
