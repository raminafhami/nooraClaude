"use client";

import { PageWidget as CustomsPageWidget } from "@/inspection/flows/customsSampling/pages/PageWidget";

import { PageReport } from "./PageReport";

/** the customs sampling case page with the Qazvin report */
export function PageWidget({ id }: { id: string }) {
	return <CustomsPageWidget id={id} report={<PageReport />} />;
}
