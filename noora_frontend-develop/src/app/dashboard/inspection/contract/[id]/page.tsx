import { Metadata } from "next";

import { ContractPage as ContractClientPage } from "./_module/ContractPage";

const metadata: Metadata = {
	title: "Contract Details",
};

function ContractPage({
	params: { id },
}: {
	params: {
		id: string;
	};
}) {
	return <ContractClientPage id={id} />;
}

export { metadata };
export default ContractPage;
