"use client";

import { FaBuildingUser, FaGauge, FaPeopleArrows } from "react-icons/fa6";

import TabsCreator, { TabsData } from "@/components/ui/tabs/TabsCreator";
import { Layout } from "@/ui/Layout";

import { BuyersPage } from "../buyers/_module/BuyersPage";
import { CustomersPage } from "../customers/_module/CustomersPage";
import { ContactsContextType, useContactsContext } from "./ContactsContext";
import { ContactsDashboard } from "./ContactsDashboard";

const ContactsTabs: TabsData<ContactsContextType>[] = [
	{
		name: "پیشخوان",
		color: "",
		icon: FaGauge,
		value: "dashboard",
		element: <ContactsDashboard />,
		authorize: (_, context) => !!context?.project,
	},
	{
		name: "خریدارها",
		color: "",
		icon: FaBuildingUser,
		value: "buyers",
		element: <BuyersPage />,
	},
	{
		name: "مشتریان",
		color: "",
		icon: FaPeopleArrows,
		value: "customers",
		element: <CustomersPage />,
	},
];

function ContactsClient() {
	const context = useContactsContext();

	return (
		<Layout.Root>
			<Layout.Head title="مخاطبین" />
			<Layout.Content>
				<TabsCreator context={context} data={ContactsTabs} />
			</Layout.Content>
		</Layout.Root>
	);
}

export { ContactsClient };
