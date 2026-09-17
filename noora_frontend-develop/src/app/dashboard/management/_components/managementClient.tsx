"use client";

import React from "react";

import TabsCreator from "@/components/ui/tabs/TabsCreator";
import { Layout } from "@/ui/Layout";

import { ManagementTabs } from "./managementTabs";

function ManagementClient() {
	return (
		<Layout.Root>
			<Layout.Content>
				<TabsCreator data={ManagementTabs} />
			</Layout.Content>
		</Layout.Root>
	);
}

export default ManagementClient;
