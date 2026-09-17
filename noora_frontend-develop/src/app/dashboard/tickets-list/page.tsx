import { Metadata } from "next";

import { TicketsWidget } from "./_components/TicketsWidget";

const metadata: Metadata = {
	title: "Tickets",
};

function TicketsPage() {
	return (
		<>
			<TicketsWidget />
		</>
	);
}

export { metadata };
export default TicketsPage;
