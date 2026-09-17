"use client";

import { Panel } from "@/ui/Panel";

import { RolesTable } from "./RolesTable";

export function RolesWidget() {
	return (
		<>
			<Panel.Root>
				<Panel.Container className="py-0">
					<RolesTable />
				</Panel.Container>
			</Panel.Root>
		</>
	);
}
