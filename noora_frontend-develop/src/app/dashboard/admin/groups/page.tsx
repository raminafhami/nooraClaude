import { Layout } from "@/ui/Layout";

import { GroupsWidget } from "./_components/GroupsWidget";

export const revalidate = 0;

export default function GroupsPage() {
	return (
		<Layout.Root>
			<Layout.Content>
				<GroupsWidget />
			</Layout.Content>
		</Layout.Root>
	);
}
