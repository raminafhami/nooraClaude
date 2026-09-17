"use client";

import { useInspectionContext } from "@/inspection/context/InspectionContext";

import { InspectionInvoiceList } from "./InspectionInvoiceList";
import { InspectionInvoicePaymentList } from "./InspectionInvoicePaymentList";

function InspectionInvoicesPage() {
	const { instance } = useInspectionContext();

	return (
		<div className="grid grid-cols-12 gap-6">
			<div className="col-span-full xs:col-span-9">
				<InspectionInvoiceList instanceId={instance.id} />
			</div>

			<div className="col-span-full">
				<InspectionInvoicePaymentList caseNo={instance.caseNo} />
			</div>
		</div>
	);
}

export { InspectionInvoicesPage };
