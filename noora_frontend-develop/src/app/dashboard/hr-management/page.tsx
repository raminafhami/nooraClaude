import { Metadata } from "next";

import { Layout } from "@/ui/Layout";

import { HrmClient } from "./_module/HrmClient";

const metadata: Metadata = {
	title: "Human Resources",
};

function HrmPage() {
	return (
		<Layout.Root>
			<Layout.Head title="منابع انسانی" />
			<Layout.Content>
				<HrmClient />
			</Layout.Content>
		</Layout.Root>
	);
}

export { metadata };
export default HrmPage;
