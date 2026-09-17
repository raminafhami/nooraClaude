"use client";

import React from "react";

import { PettyCashList } from "@/financial/petty-cash/components/PettyCashList";
import { PettyCostList } from "@/financial/petty-cost/components/PettyCostList";
import { Layout } from "@/ui/Layout";

const PettyCashesPage = () => {
	return (
		<div className="w-full">
			<Layout.Root>
				<Layout.Content className="grid grid-cols-12 gap-10">
					<PettyCashList />
					<PettyCostList isAdmin={true} />
				</Layout.Content>
			</Layout.Root>
		</div>
	);
};

export { PettyCashesPage };
