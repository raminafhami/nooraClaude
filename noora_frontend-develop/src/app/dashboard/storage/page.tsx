import { Metadata } from "next";
import { FaBox, FaWarehouse } from "react-icons/fa6";

import { authorizeByGroups } from "@/auth/utils/authorizeByGroups";
import { extractIdentity } from "@/auth/utils/extractdentity";
import getUniversalSession from "@/auth/utils/getUniversalSession";
import { TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TabsWithUrl } from "@/components/ui/tabs-with-url";
import { TabItemType } from "@/components/ui/tabs.types";
import { getVisibleTabItems } from "@/components/ui/tabs.utils";
import { Layout } from "@/ui/Layout";

import { ProductsPage } from "./_module/products/ProductsPage";
import { PropertiesPage } from "./_module/PropertiesPage";

const items: TabItemType[] = [
	{
		value: "product",
		title: "کالاها",
		icon: FaWarehouse,
		component: <ProductsPage />,
		authorize: authorizeByGroups(["ceo", "storeroom-management"]),
	},
	{
		value: "property",
		title: "اموال",
		icon: FaBox,
		component: <PropertiesPage />,
		authorize: authorizeByGroups(["ceo", "property-manage"]),
	},
];

const metadata: Metadata = {
	title: "Storage",
};

function StoragePage() {
	const { accessToken } = getUniversalSession();
	const identity = extractIdentity(accessToken);

	const visibleItems = getVisibleTabItems(items, { identity });

	if (!visibleItems.length) return;

	return (
		<Layout.Root>
			<Layout.Head title="انبار" />
			<Layout.Content>
				<TabsWithUrl defaultValue={visibleItems[0].value}>
					<TabsList>
						{visibleItems.map((item) => (
							<TabsTrigger
								key={item.value}
								className="gap-1.5"
								value={item.value}
							>
								{item.icon && <item.icon className="text-base" />}
								{item.title}
							</TabsTrigger>
						))}
					</TabsList>

					{visibleItems.map((item) => (
						<TabsContent key={item.value} value={item.value}>
							{item.component}
						</TabsContent>
					))}
				</TabsWithUrl>
			</Layout.Content>
		</Layout.Root>
	);
}

export { metadata };
export default StoragePage;
