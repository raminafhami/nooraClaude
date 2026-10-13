"use client";

import { FaPlus } from "react-icons/fa";
import {
	FaBoxArchive,
	FaCity,
	FaCodePullRequest,
	FaHashtag,
	FaLayerGroup,
	FaPeopleGroup,
	FaPersonCircleCheck,
	FaUsers,
	FaUserShield,
} from "react-icons/fa6";

import { Button } from "@/components/ui/button";
import { authorizeByGroups, TabsData } from "@/components/ui/tabs/TabsCreator";
import { DynamicLink } from "@/components/ui/dynamic-link";

import BranchsPage from "../branches/page";
import { ProcessesPage } from "../business-process/_components/ProcessesPage";
import { CompanyDocumentsPage } from "../company-document/CompanyDocumentsPage";
import GroupsPage from "../groups/page";
import { IndicatorsWidget } from "../indicators/IndicatorsWidget";
import { KpiPage } from "../kpi/KpiPage";
import { RolesWidget } from "../roles/_components";
import { UsersWidget } from "../users/_components/UsersWidget";
import DispatcherCategoryPage from "./DispatcherCategoryPage";

export const AdminTabs: TabsData[] = [
	{
		name: "مدارک شرکت",
		color: "",
		icon: FaBoxArchive,
		value: "company-document",
		element: <CompanyDocumentsPage />,
		authorize: authorizeByGroups(["system-admin"]),
	},
	{
		name: "شعب",
		color: "",
		icon: FaCity,
		value: "branchs",
		element: <BranchsPage />,
		authorize: authorizeByGroups(["system-admin"]),
	},
	{
		name: "گروه ها",
		color: "",
		icon: FaPeopleGroup,
		value: "groups",
		element: <GroupsPage />,
		authorize: authorizeByGroups(["system-admin"]),
	},
	{
		name: "شمارنده ها",
		color: "",
		icon: FaHashtag,
		value: "indicators",
		element: <IndicatorsWidget />,
		authorize: authorizeByGroups(["system-admin"]),
	},
	{
		name: "فرایندها",
		color: "",
		icon: FaCodePullRequest,
		value: "business-process",
		element: <ProcessesPage />,
		authorize: authorizeByGroups(["system-admin"]),
	},
	{
		name: "گروه های کالایی",
		color: "",
		icon: FaLayerGroup,
		value: "dispatcher-category",
		element: <DispatcherCategoryPage />,
		authorize: authorizeByGroups(["system-admin"]),
	},
	{
		name: "شاخص عملکرد",
		color: "",
		icon: FaPersonCircleCheck,
		value: "kpi",
		element: <KpiPage />,
		authorize: authorizeByGroups(["system-admin"]),
	},
	{
		name: "کاربران",
		color: "",
		icon: FaUsers,
		value: "users",
		element: (
			<div className="space-y-6">
				<div className="flex justify-end">
					<DynamicLink
						className="flex rounded-lg px-3 py-1"
						href="/dashboard/admin/users/add"
					>
						<Button className="ms-1">
							<FaPlus className="mx-1 text-2xs" />
							افزودن کاربر جدید
						</Button>
					</DynamicLink>
				</div>
				<UsersWidget />
			</div>
		),
		authorize: authorizeByGroups(["system-admin"]),
	},
	{
		name: "مدیریت نقش ها",
		color: "",
		icon: FaUserShield,
		value: "roles",
		element: (
			<div className="space-y-6">
				<div className="flex justify-end">
					<DynamicLink
						className="flex rounded-lg px-3 py-1"
						href="/dashboard/admin/roles/add"
					>
						<Button className="ms-1">
							<FaPlus className="mx-1 text-2xs" />
							افزودن نقش
						</Button>
					</DynamicLink>
				</div>
				<RolesWidget />
			</div>
		),
		authorize: authorizeByGroups(["system-admin"]),
	},
];
