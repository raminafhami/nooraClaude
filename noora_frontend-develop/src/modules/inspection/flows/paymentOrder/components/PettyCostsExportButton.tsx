"use client";

import { useState } from "react";
import { FaDownload } from "react-icons/fa6";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { getPettyCostReport } from "@/financial/petty-cost/services/getPettyCostReport";
import downloadBlob from "@/utils/downloadBlob";

function PettyCostsExportButton({ pettyCostIds }: { pettyCostIds: string[] }) {
	const [isPending, setIsPending] = useState<boolean>(false);

	async function handleExport() {
		try {
			setIsPending(true);

			const blob = await getPettyCostReport({
				filters: { _id: pettyCostIds },
				sort: { createdAt: "desc" },
			});
			await downloadBlob({ blob });
		} catch (err) {
			console.error(err);
			toast.error("خطای نامشخصی در دریافت گزارش هزینه ها رخ داد.");
		} finally {
			setIsPending(false);
		}
	}

	return (
		<Button disabled={isPending} variant="secondary" onClick={handleExport}>
			<Spinner loading={isPending} size="xs">
				<FaDownload />
			</Spinner>
			<span>دریافت گزارش</span>
		</Button>
	);
}

export { PettyCostsExportButton };
