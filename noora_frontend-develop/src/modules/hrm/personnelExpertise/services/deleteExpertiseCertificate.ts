import apiClient from "@/api/client";

// Removes an uploaded certificate (record + file); the checklist row goes back
// to "ندارد".
async function deleteExpertiseCertificate(
	personnelExpertiseId: string,
): Promise<boolean> {
	await apiClient.delete({
		url: `personnel-expertise/${personnelExpertiseId}/certificate`,
	});

	return true;
}

export { deleteExpertiseCertificate };
