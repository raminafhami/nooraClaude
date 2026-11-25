"use client";

import {
	FaChartColumn,
	FaHandHoldingDollar,
	FaPersonCircleCheck,
	FaSackDollar,
	FaUsersViewfinder,
} from "react-icons/fa6";

import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import TabsCreator, {
	authorizeByGroups,
	TabsData,
} from "@/components/ui/tabs/TabsCreator";
import { Layout } from "@/ui/Layout";

import { CrmDashboard } from "./crm/CrmDashboard";
import { FinancialsDashboard } from "./financials/FinancialsDashboard";
import { HrDashboard } from "./hr/HrDashboard";
import { PerformanceTab } from "./performance/PerformanceTab";
import { SalesDashboard } from "./sales/SalesDashboard";

const staffOnly = authorizeByGroups(["system-admin"]);

const tabs: TabsData[] = [
	{
		name: "CRM",
		color: "",
		icon: FaUsersViewfinder,
		value: "crm",
		element: <CrmDashboard />,
		authorize: staffOnly,
	},
	{
		name: "مالی",
		color: "",
		icon: FaHandHoldingDollar,
		value: "financial-chart",
		element: <FinancialsDashboard />,
		authorize: staffOnly,
	},
	{
		name: "منابع انسانی",
		color: "",
		icon: FaPersonCircleCheck,
		value: "inspection-chart",
		element: <HrDashboard />,
		authorize: staffOnly,
	},
	{
		name: "فروش",
		color: "",
		icon: FaSackDollar,
		value: "sales",
		element: <SalesDashboard />,
		authorize: staffOnly,
	},
	{
		name: "عملکرد",
		color: "",
		icon: FaChartColumn,
		value: "performance",
		element: <PerformanceTab />,
	},
];

function ChartsClient() {
	const { identity } = useLoggedInUser();
	const visibleTabs = tabs.filter((tab) => tab.value !== "performance" || identity?.dashboardAccess?.viewPerformanceReport);
	return (
		<Layout.Root>
			<Layout.Head title="نمودارها" />
			<Layout.Content>
				<TabsCreator data={visibleTabs} />
			</Layout.Content>
		</Layout.Root>
	);
}

export { ChartsClient };
