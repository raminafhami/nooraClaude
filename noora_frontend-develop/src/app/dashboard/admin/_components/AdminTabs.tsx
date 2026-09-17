"use client";

import {
	FaBoxArchive,
	FaCity,
	FaCodePullRequest,
	FaHashtag,
	FaLayerGroup,
	FaPeopleGroup,
	FaPersonCircleCheck,
} from "react-icons/fa6";

import { authorizeByGroups, TabsData } from "@/components/ui/tabs/TabsCreator";

import BranchsPage from "../branches/page";
import { ProcessesPage } from "../business-process/_components/ProcessesPage";
import { CompanyDocumentsPage } from "../company-document/CompanyDocumentsPage";
import GroupsPage from "../groups/page";
import { IndicatorsWidget } from "../indicators/IndicatorsWidget";
import { KpiPage } from "../kpi/KpiPage";
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
];
