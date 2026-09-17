import { Metadata } from "next";

import { Layout } from "@/ui/Layout";

import { InspectionWidget } from "./_module/InspectionWidget";

const metadata: Metadata = {
	title: "Inspection Cases",
};

function InspectionPage() {
	return (
		<Layout.Root>
			<Layout.Head title="گزارش‌ها" />
			<Layout.Content>
				<InspectionWidget />
			</Layout.Content>
		</Layout.Root>
	);
}

export { metadata };
export default InspectionPage;
