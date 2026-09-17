import { NextRequest } from "next/server";

import getUniversalSession from "@/auth/utils/getUniversalSession";
import { routes } from "@/routes";

export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } },
) {
	const { accessToken } = getUniversalSession();

	const headers = new Headers();
	headers.append("Authorization", `Bearer ${accessToken}`);

	return await fetch(new URL(`/files/${params.id}`, routes.externalApi), {
		method: "get",
		headers: headers,
	});
}
