import apiClient from "../client";

export default async function getTicket({ id }: { id: string }) {
	let link = `tickets/${id}`;

	let response = await apiClient.get({
		url: link,
	});

	return response.result;
}
