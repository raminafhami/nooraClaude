"use client";

import {
	FaHandHoldingDollar,
	FaPersonCircleCheck,
	FaSackDollar,
	FaUsersViewfinder,
} from "react-icons/fa6";

import TabsCreator, { TabsData } from "@/components/ui/tabs/TabsCreator";
import { Layout } from "@/ui/Layout";

import { CrmDashboard } from "./crm/CrmDashboard";
import { FinancialsDashboard } from "./financials/FinancialsDashboard";
import { HrDashboard } from "./hr/HrDashboard";
import { SalesDashboard } from "./sales/SalesDashboard";

const tabs: TabsData[] = [
	{
		name: "CRM",
		color: "",
		icon: FaUsersViewfinder,
		value: "crm",
		element: <CrmDashboard />,
	},
	{
		name: "مالی",
		color: "",
		icon: FaHandHoldingDollar,
		value: "financial-chart",
		element: <FinancialsDashboard />,
	},
	{
		name: "منابع انسانی",
		color: "",
		icon: FaPersonCircleCheck,
		value: "inspection-chart",
		element: <HrDashboard />,
	},
	{
		name: "فروش",
		color: "",
		icon: FaSackDollar,
		value: "sales",
		element: <SalesDashboard />,
	},
];

function ChartsClient() {
	return (
		<Layout.Root>
			<Layout.Head title="نمودارها" />
			<Layout.Content>
				<TabsCreator data={tabs} />
			</Layout.Content>
		</Layout.Root>
	);
}

export { ChartsClient };
