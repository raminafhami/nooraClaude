"use client";

import React from "react";

import TabsCreator from "@/components/ui/tabs/TabsCreator";
import { Layout } from "@/ui/Layout";

import { AdminTabs } from "./AdminTabs";

function AdminClient() {
	return (
		<Layout.Root>
			<Layout.Head title="ادمین" />
			<Layout.Content>
				<TabsCreator data={AdminTabs} />
			</Layout.Content>
		</Layout.Root>
	);
}

export default AdminClient;
