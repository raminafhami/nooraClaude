"use client";

import React from "react";

import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import TabsCreator from "@/components/ui/tabs/TabsCreator";
import { Layout } from "@/ui/Layout";

import { AdminTabs } from "./AdminTabs";

function AdminClient() {
	const { identity } = useLoggedInUser();
	const tabs = AdminTabs.filter((tab) => tab.value !== "roles" || identity?.dashboardAccess?.viewRoles);
	return (
		<Layout.Root>
			<Layout.Head title="ادمین" />
			<Layout.Content>
				<TabsCreator data={tabs} />
			</Layout.Content>
		</Layout.Root>
	);
}

export default AdminClient;
