import apiClient from "../client";

interface GetAllTicketsProps {
	page: number;
	size: number;
	id?: string;
	user?: any;
	reference?: string;
	referenceType?: string;
}

export default async function GetAllTickets({
	page,
	size,
	id,
	user,
	reference,
	referenceType,
}: GetAllTicketsProps) {
	let response;
	const filter: Record<string, any> = {};
	const sort = { modifiedAt: "desc" };
	if (reference && referenceType) {
		filter.reference = reference;
		filter.referenceType = referenceType;
	}

	const $orFilter: Record<string, any>[] = [];

	if (user) {
		if (user.id) {
			$orFilter.push({ createdBy: user.id }, { assignee: user.id });
		}

		if (user.groups) {
			$orFilter.push({
				$or: [{ assignee: null }, { assignee: { $exists: false } }],
				group: { $in: user.groups || [] },
			});
		}
	}

	if ($orFilter.length) {
		filter.$or = [...$orFilter];
	}

	let link = `tickets${
		id ? `/${id}` : ""
	}?page=${page}&size=${size}&sort=${JSON.stringify(sort)}${
		user || (reference && referenceType)
			? `&filters=${JSON.stringify(filter)}`
			: ""
	}`;

	response = await apiClient.get({
		url: link,
	});

	return response;
}
