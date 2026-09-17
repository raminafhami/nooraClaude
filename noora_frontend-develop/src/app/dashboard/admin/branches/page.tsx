import { Layout } from "@/ui/Layout";

import { BranchesWidget } from "./_components/BranchesWidget";

export const revalidate = 0;

export default function BranchsPage() {
	return (
		<Layout.Root>
			<Layout.Content>
				<BranchesWidget />
			</Layout.Content>
		</Layout.Root>
	);
}
