import ky from "ky";
import { NextRequest, NextResponse } from "next/server";

import { ApiSuccessResponse } from "@/api/models/ApiResponse";
import { Instance } from "@/felo/instances/models/Instance";
import { InstanceApi } from "@/felo/instances/models/InstanceApi";
import { parseInstance } from "@/felo/instances/utils/parseInstance";
import {
	BANK_COI_CERTIFICATE_KEYS,
	BANK_COI_CERTIFICATE_TEMPLATE,
} from "@/inspection/flows/bank-coi/consts";
import {
	IC_CERTIFICATE_KEYS,
	IC_CERTIFICATE_TEMPLATE,
} from "@/inspection/flows/ic/consts";
import { LC_CERTIFICATE_KEYS } from "@/inspection/flows/lc/consts";
import { getCertificateTemplate as getLcCertificateTemplate } from "@/inspection/flows/lc/utils/getCertificateTemplate";
import { getInspectionPublicUrl } from "@/inspection/shared/utils/getInspectionPublicUrl";
import { getInspectionQrCode } from "@/inspection/shared/utils/getInspectionQrCode";
import { routes } from "@/routes";

const CERTIFICATE_GENERATOR_REGISTRY: Record<
	string,
	{ keys: string[]; template: string | ((instance: Instance) => string) }
> = {
	Inspection_Case_IC: {
		keys: IC_CERTIFICATE_KEYS,
		template: IC_CERTIFICATE_TEMPLATE,
	},
	Inspection_Case_LC: {
		keys: LC_CERTIFICATE_KEYS,
		template: getLcCertificateTemplate,
	},
	Inspection_Case_Bank_COI: {
		keys: BANK_COI_CERTIFICATE_KEYS,
		template: BANK_COI_CERTIFICATE_TEMPLATE,
	},
};

const GET = async (
	request: NextRequest,
	{ params }: { params: { encryptedId: string } },
) => {
	const instance: Instance | undefined = await ky
		.get(
			`${routes.externalApi}/process-instances/${params.encryptedId}/public`,
			{
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
				},
				throwHttpErrors: true,
			},
		)
		.json<ApiSuccessResponse<InstanceApi>>()
		.then((response) => parseInstance(response.result))
		.catch();

	if (!instance) {
		return NextResponse.json(
			{
				success: false,
				statusCode: 404,
				message: "Instance was not found.",
			},
			{ status: 404 },
		);
	}

	const generatorData = CERTIFICATE_GENERATOR_REGISTRY[instance.processKey];

	if (!generatorData) {
		return NextResponse.json(
			{
				success: false,
				statusCode: 500,
				message: "Something went wrong.",
			},
			{ status: 500 },
		);
	}

	try {
		const certificateKeys = generatorData.keys;

		const instanceWithData = await ky
			.get(
				`${routes.externalApi}/process-instances/${params.encryptedId}/public`,
				{
					searchParams: {
						props: certificateKeys.join(","),
					},
					throwHttpErrors: true,
				},
			)
			.json<ApiSuccessResponse<InstanceApi>>()
			.then((response) => parseInstance(response.result));

		const publicUrl = getInspectionPublicUrl(params.encryptedId);
		const qrCode = await getInspectionQrCode(publicUrl);

		const data: Record<string, any> = {
			caseNo: instanceWithData.caseNo,
			...certificateKeys.reduce<Record<string, any>>(
				(obj, curr) => ({
					...obj,
					[curr]: instanceWithData.parameters?.[curr],
				}),
				{},
			),
			qrCode,
			withDesign: true,
			withSignature: true,
		};

		const blob = await ky
			.post(`${routes.externalApi}/template/generate`, {
				json: {
					templateName:
						typeof generatorData.template === "function"
							? generatorData.template(instance)
							: generatorData.template,
					outputFileName: "file",
					data,
					download: true,
				},
				throwHttpErrors: true,
			})
			.blob();

		const headers = new Headers();
		headers.set("Content-Type", blob.type);

		return new NextResponse(blob, {
			status: 200,
			headers: headers,
		});
	} catch {
		return NextResponse.json(
			{
				success: false,
				statusCode: 500,
				message: "An unknown error has occurred.",
			},
			{ status: 500 },
		);
	}
};

export { GET };
