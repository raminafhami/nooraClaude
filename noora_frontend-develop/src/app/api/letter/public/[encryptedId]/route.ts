import ky from "ky";
import { NextRequest, NextResponse } from "next/server";

import { ApiPageResponse, ApiSuccessResponse } from "@/api/models/ApiResponse";
import { InstanceApi } from "@/felo/instances/models/InstanceApi";
import { parseInstance } from "@/felo/instances/utils/parseInstance";
import { UserDocument } from "@/identity/userDocuments/models/UserDocument";
import { routes } from "@/routes";
import { getLetterPublicUrl } from "@/secretariat/utils/getLetterPublicUrl";
import { getLetterQrCode } from "@/secretariat/utils/getLetterQrCode";

const LETTER_KEYS = [
	"Assignees",
	"LetterDate",
	"LetterHasAttachments",
	"LetterTo",
	"LetterSubject",
	"LetterContent",
	"ReviewerPosition",
	"LetterReviewStatus",
];
const LETTER_TEMPLATE = "secretariat/letter.html";

const GET = async (
	request: NextRequest,
	{ params }: { params: { encryptedId: string } },
) => {
	try {
		const instanceWithData = await ky
			.get(
				`${routes.externalApi}/process-instances/${params.encryptedId}/public`,
				{
					searchParams: {
						filters: JSON.stringify({
							processDefinitionKey: { $in: ["Secretariat_Letter_Outgoing"] },
						}),
						props: LETTER_KEYS.join(","),
					},
					throwHttpErrors: true,
				},
			)
			.json<ApiSuccessResponse<InstanceApi>>()
			.then((response) => parseInstance(response.result))
			.catch();

		if (!instanceWithData) {
			return NextResponse.json(
				{
					success: false,
					statusCode: 404,
					message: "Instance was not found.",
				},
				{ status: 404 },
			);
		}

		const publicUrl = getLetterPublicUrl(params.encryptedId);
		const qrCode = await getLetterQrCode(publicUrl);

		const signature = await getUserSignature(
			instanceWithData.parameters!["Assignees"]!.reviewer!.id,
		);

		if (!signature) {
			throw new Error("Signature not found");
		}

		const data: Record<string, any> = {
			caseNo: instanceWithData.caseNo,
			...LETTER_KEYS.reduce<Record<string, any>>(
				(obj, curr) => ({
					...obj,
					[curr]: instanceWithData.parameters?.[curr],
				}),
				{},
			),
			qrCode,
			signature,
			reviewr:
				instanceWithData.parameters["Assignees"].reviewer.name ?? "نامشخص",
			letterNo: instanceWithData.caseNo,
			withDesign: true,
		};

		const blob = await ky
			.post(`${routes.externalApi}/template/generate`, {
				json: {
					templateName: LETTER_TEMPLATE,
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

async function getUserSignature(userId: string): Promise<string | undefined> {
	const userFiles = await ky
		.get(`${routes.externalApi}/user-files`, {
			searchParams: {
				filters: JSON.stringify({
					userId,
					key: "signature",
				}),
			},
			throwHttpErrors: true,
		})
		.json<ApiPageResponse<UserDocument>>()
		.then((response) => response.result.data);

	if (!userFiles || userFiles.length === 0) {
		return;
	}

	const signatureFile = await ky
		.get(`${routes.externalApi}/user-files/${userFiles[0].id}/file`, {
			throwHttpErrors: true,
		})
		.blob();

	if (!signatureFile) {
		return;
	}

	const fileStr: string = await new Promise((resolve, _) => {
		const reader = new FileReader();
		reader.onloadend = () => resolve(reader.result as string);
		reader.readAsDataURL(signatureFile);
	});

	return fileStr;
}

export { GET };
