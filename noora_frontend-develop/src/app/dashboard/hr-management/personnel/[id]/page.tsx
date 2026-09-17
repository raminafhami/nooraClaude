import { Metadata } from "next";

import { Layout } from "@/ui/Layout";

import { PersonnelWidget } from "./_components/PersonnelWidget";

const metadata: Metadata = {
	title: "Personnel Details",
};

function PersonnelPage({
	params: { id },
}: {
	params: {
		id: string;
	};
}) {
	return (
		<Layout.Root>
			<Layout.Head title="اطلاعات پرسنل"></Layout.Head>
			<Layout.Content>
				<PersonnelWidget userId={id} />
			</Layout.Content>
		</Layout.Root>
	);
}

export { metadata };
export default PersonnelPage;
