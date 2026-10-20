import apiClient from "@/api/client";

// The confirmed signature from the user's personnel documents - the same one
// the server attaches on final submission (null when none is on file).
async function getMySignature(): Promise<string | null> {
	const response = await apiClient.get<{ signatureBase64: string | null }>({
		url: "form-builder/me/signature",
	});

	return response.result.signatureBase64;
}

export { getMySignature };
