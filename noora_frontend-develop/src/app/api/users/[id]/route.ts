import { promises as fs } from "fs";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

import apiClient from "@/api/client";

export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } },
) {
	const fallback = request.nextUrl.searchParams.get("fallback");

	try {
		const blob = await apiClient.send({
			method: "get",
			url: `user-files/${params.id}/file`,
			responseType: "blob",
		});

		const buffer = await blob.arrayBuffer();

		return new NextResponse(buffer, {
			status: 200,
			headers: {
				"Content-Type": blob.type,
			},
		});
	} catch (error: any) {
		console.error(error);

		if (fallback) {
			const fallbackPath = path.join(process.cwd(), "public/images/avatar.png");
			const fallbackImage = await fs.readFile(fallbackPath);

			return new NextResponse(fallbackImage, {
				status: 200,
				headers: {
					"Content-Type": "image/png",
				},
			});
		}

		return new NextResponse(
			JSON.stringify({ error: error.message || "Failed to fetch file" }),
			{ status: error.response?.status || 500 },
		);
	}
}
