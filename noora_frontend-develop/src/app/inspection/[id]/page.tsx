import ky from "ky";
import { Metadata } from "next";
import { notFound } from "next/navigation";

import { ApiSuccessResponse } from "@/api/models/ApiResponse";
import { Instance } from "@/felo/instances/models/Instance";
import { InstanceApi } from "@/felo/instances/models/InstanceApi";
import { parseInstance } from "@/felo/instances/utils/parseInstance";
import { routes } from "@/routes";

import { InspectionWidget } from "./_module/InspectionWidget";

const metadata: Metadata = {
	title: "Inspection",
};

async function InspectionPage({
	params: { id },
}: {
	params: {
		id: string;
	};
}) {
	const instance: Instance | undefined = await ky
		.get(`${routes.externalApi}/process-instances/${id}/public`, {
			searchParams: {
				filters: JSON.stringify({
					processDefinitionKey: {
						$in: [
							"Inspection_Case_IC",
							"Inspection_Case_LC",
							"Inspection_Case_Bank_COI",
						],
					},
				}),
				props: ["CertificateIssueNo", "CertificateIssueDate"].join(","),
			},
			throwHttpErrors: true,
		})
		.json<ApiSuccessResponse<InstanceApi>>()
		.then((response) => parseInstance(response.result))
		.catch();

	if (!instance) {
		notFound();
	}

	return <InspectionWidget instance={instance} encryptedId={id} />;
}

export { metadata };
export default InspectionPage;
