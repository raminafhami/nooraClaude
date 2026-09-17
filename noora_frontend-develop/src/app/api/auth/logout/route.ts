import { NextResponse } from "next/server";

import { routes } from "@/routes";

export async function GET(request: Request) {
	const response = NextResponse.redirect(new URL("/login", routes.app));
	response.cookies.delete("token");
	response.cookies.delete("refreshToken");

	return response;
}
