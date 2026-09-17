import { FaClock, FaHistory, FaInfo } from "react-icons/fa";
import { GrStakeholder } from "react-icons/gr";

import { authorizeByGroups, TabsData } from "@/components/ui/tabs/TabsCreator";

import { Reports } from "./attendances/Reports";
import PersonnelStatus from "./managerInformation/PersonnelStatus";
import Requests from "./requests/Requests";
import StakeholderPage from "./stakeholder/page";

export const ManagementTabs: TabsData[] = [
	{
		name: "اطلاعات",
		color: "",
		icon: FaInfo,
		value: "personnelStatus",
		element: <PersonnelStatus />,
		authorize: authorizeByGroups(["hr-manager"]),
	},
	{
		name: "گزارش گیری",
		color: "",
		icon: FaHistory,
		value: "reports",
		element: <Reports />,
		authorize: authorizeByGroups(["hr-manager"]),
	},
	{
		name: "درخواست‌ها",
		color: "",
		icon: FaClock,
		value: "requests",
		element: <Requests />,
		authorize: authorizeByGroups(["hr-manager"]),
	},
	{
		name: "ذینفع ها",
		color: "",
		icon: GrStakeholder,
		value: "stakeholder",
		element: <StakeholderPage />,
		authorize: authorizeByGroups(["stakeholders-management"]),
	},
];
