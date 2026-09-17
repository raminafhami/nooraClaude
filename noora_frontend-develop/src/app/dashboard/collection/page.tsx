import { Layout } from "@/ui/Layout";

import { CollectionList } from "./_module/CollectionList";

function CollectionPage() {
	return (
		<Layout.Root>
			<Layout.Head title="" />
			<Layout.Content>
				<CollectionList />
			</Layout.Content>
		</Layout.Root>
	);
}

export default CollectionPage;
