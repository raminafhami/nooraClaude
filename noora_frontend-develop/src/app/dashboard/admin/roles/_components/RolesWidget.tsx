"use client";

import { FaPlus } from "react-icons/fa";

import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import { buttonVariants } from "@/components/ui/button";
import { DynamicLink } from "@/components/ui/dynamic-link";
import { Panel } from "@/ui/Panel";

import { RolesTable } from "./RolesTable";

export function RolesWidget() {
	const { identity } = useLoggedInUser();
	return (
		<div className="space-y-6">
			{identity?.dashboardAccess?.createRoles && (
				<div className="flex justify-end">
					<DynamicLink className={buttonVariants()} href="/dashboard/admin/roles/add">
						<FaPlus className="mx-1 text-2xs" />
						افزودن نقش
					</DynamicLink>
				</div>
			)}
			<Panel.Root>
				<Panel.Container className="py-0">
					<RolesTable />
				</Panel.Container>
			</Panel.Root>
		</div>
	);
}
