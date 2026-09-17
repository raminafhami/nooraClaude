"use client";

import { useTaskContext } from "@/felo/tasks/hooks/useTaskContext";
import { routes } from "@/routes";

export function PhasePage() {
	const { task } = useTaskContext();

	function getTemplateUrl(download: boolean): string {
		return new URL(
			`/files/${
				task.instanceId
			}/export/vars/Assignees,InvoiceType,Buyer,InspectionFeeInRial,InvoiceTax,InvoiceToll,InvoiceTotal,InvoiceTotalInText,InvoiceDescription?template=inspection/shared/Preinvoice.html&download=${
				download ? "1" : "0"
			}`,
			routes.externalApi,
		).toString();
	}

	return (
		<>
			<div className="grid grid-cols-12 gap-x-10 gap-y-6">
				<div className="col-span-9 w-full rounded-xl border-e-8 border-s-8 border-gray-200">
					<iframe
						className="h-[32rem] w-full overflow-y-auto rounded-xl border border-gray-200"
						src={getTemplateUrl(false)}
					></iframe>
				</div>

				<div className="col-span-full">
					<a
						className="rounded-lg border border-gray-200 px-4 py-1 leading-8"
						href={getTemplateUrl(true)}
						target="_blank"
					>
						دانلود پیش فاکتور
					</a>
				</div>
			</div>
		</>
	);
}
