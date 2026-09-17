import { Metadata } from "next";

import { Layout } from "@/ui/Layout";

import { NotificationsList } from "./_components/NotificationsList";

export const revalidate = 0;

export const metadata: Metadata = {
	title: "Notifications",
};

export default function Page() {
	return (
		<Layout.Root>
			<Layout.Head title="اعلانات"></Layout.Head>
			<Layout.Content>
				<NotificationsList />
			</Layout.Content>
		</Layout.Root>
	);
}
