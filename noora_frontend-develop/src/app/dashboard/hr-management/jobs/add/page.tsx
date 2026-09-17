import { Metadata } from "next";

import { Layout } from "@/ui/Layout";

import { PageEntry, PageNavigation } from "./_components";

export const revalidate = 0;

export const metadata: Metadata = {
	title: "Add Job",
};

export default async function Page() {
	return (
		<Layout.Root>
			<Layout.Head title="افزودن شرح شغل">
				<PageNavigation />
			</Layout.Head>
			<Layout.Content>
				<PageEntry />
			</Layout.Content>
		</Layout.Root>
	);
}
