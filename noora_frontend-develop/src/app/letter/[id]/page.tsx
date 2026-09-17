import ky from "ky";
import { Metadata } from "next";
import { notFound } from "next/navigation";

import { ApiSuccessResponse } from "@/api/models/ApiResponse";
import { Instance } from "@/felo/instances/models/Instance";
import { InstanceApi } from "@/felo/instances/models/InstanceApi";
import { parseInstance } from "@/felo/instances/utils/parseInstance";
import { routes } from "@/routes";

import { LetterWidget } from "./_module/LetterWidget";

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
					processDefinitionKey: { $in: ["Secretariat_Letter_Outgoing"] },
				}),
				props: ["Assignees", "LetterDate", "LetterReviewStatus"].join(","),
			},
			throwHttpErrors: true,
		})
		.json<ApiSuccessResponse<InstanceApi>>()
		.then((response) => parseInstance(response.result))
		.catch();

	if (!instance || instance.parameters["LetterReviewStatus"] !== "forward") {
		notFound();
	}

	return <LetterWidget instance={instance} encryptedId={id} />;
}

export { metadata };
export default InspectionPage;
