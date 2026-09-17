type ConvertToContractDataDto = Partial<{
	Assignees: Partial<Record<string, { id: string; name: string } | null>>;
	Buyer: { id: string; name: string };
	ProformaNo: string | null;
}>;

type ConvertToContractDataReturn = Partial<{
	customer: { id: string; name: string };
	buyer: { id: string; name: string };
	proforma: string;
}>;

function convertToContractData(
	data: ConvertToContractDataDto,
): ConvertToContractDataReturn {
	const result: ConvertToContractDataReturn = {};

	if (data["Buyer"]) {
		result.buyer = {
			id: data["Buyer"].id,
			name: data["Buyer"].name,
		};
	}

	if (data["Assignees"]?.customer) {
		result.customer = { ...data["Assignees"].customer };
	}

	if (data["ProformaNo"]) {
		result.proforma = data["ProformaNo"];
	}

	return result;
}

export { convertToContractData };
