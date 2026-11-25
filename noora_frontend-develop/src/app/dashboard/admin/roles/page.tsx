import { Metadata } from "next";
import { Layout } from "@/ui/Layout";

import { RolesWidget } from "./_components";

export const revalidate = 0;

export const metadata: Metadata = {
	title: "Roles",
};

export default function Page() {
	return (
		<Layout.Root>
			<Layout.Head title="نقش ها" />
			<Layout.Content>
				<RolesWidget />
			</Layout.Content>
		</Layout.Root>
	);
}
