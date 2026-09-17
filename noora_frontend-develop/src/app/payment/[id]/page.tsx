import { Metadata } from "next";

import { PaymentWidget } from "./_module/PaymentWidget";

const metadata: Metadata = {
	title: "Payment",
};

function PaymentPage({
	params: { id },
}: {
	params: {
		id: string;
	};
}) {
	return <PaymentWidget id={decodeURIComponent(id)} />;
}

export { metadata };
export default PaymentPage;
