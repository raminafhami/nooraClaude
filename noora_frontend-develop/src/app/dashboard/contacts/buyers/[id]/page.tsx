import { Metadata } from "next";
import { redirect } from "next/navigation";

import { extractIdentity } from "@/auth/utils/extractdentity";
import getUniversalSession from "@/auth/utils/getUniversalSession";
import { isAuthorized } from "@/auth/utils/isAuthorized";

import { BuyerClient } from "./_module/BuyerClient";

const metadata: Metadata = {
	title: "Manage Buyer",
};

function BuyerDetailsPage({
	params: { id },
}: {
	params: {
		id: string;
	};
}) {
	const { accessToken } = getUniversalSession();
	const identity = extractIdentity(accessToken)!;

	const isUserAuthorized =
		!!identity.branchId ||
		isAuthorized(identity, {
			groups: ["ceo", "buyers-manage", "buyers-view"],
		});

	if (!isUserAuthorized) {
		redirect("/dashboard/contacts?tab=buyers");
	}

	return <BuyerClient id={id} />;
}

export { metadata };
export default BuyerDetailsPage;
