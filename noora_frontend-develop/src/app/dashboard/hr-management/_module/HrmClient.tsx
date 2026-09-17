"use client";

import {
	FaChalkboardUser,
	FaFileSignature,
	FaGraduationCap,
	FaLightbulb,
	FaPeopleGroup,
	FaPersonCircleCheck,
} from "react-icons/fa6";

import TabsCreator, {
	authorizeByGroups,
	TabsData,
} from "@/components/ui/tabs/TabsCreator";

import { ContractsPage } from "../contract/_module/ContractsPage";
import { CoursesPage } from "../courses/_module/CoursesPage";
import { ExpertisesList } from "../expertises/_module/ExpertisesList";
import JobsPage from "../jobs/page";
import PersonnelsPage from "../personnel/page";
import TrainingPage from "../training/page";

const tabs: TabsData[] = [
	{
		name: "پرسنل",
		color: "",
		icon: FaPeopleGroup,
		value: "personnel",
		element: <PersonnelsPage />,
		authorize: authorizeByGroups(["hr-manager"]),
	},
	{
		name: "سمت های شغلی",
		color: "",
		icon: FaPersonCircleCheck,
		value: "jobs",
		element: <JobsPage />,
		authorize: authorizeByGroups(["hr-manager"]),
	},
	{
		name: "قراردادها",
		color: "",
		icon: FaFileSignature,
		value: "contract",
		element: <ContractsPage />,
		authorize: authorizeByGroups(["hr-manager"]),
	},

	{
		name: "آموزش",
		color: "",
		icon: FaChalkboardUser,
		value: "training",
		element: <TrainingPage />,
		authorize: authorizeByGroups(["hr-manager", "training-manager"]),
	},
	{
		name: "دوره ها",
		color: "",
		icon: FaGraduationCap,
		value: "courses",
		element: <CoursesPage />,
		authorize: authorizeByGroups(["hr-manager", "training-manager"]),
	},
	{
		name: "توانمندی ها",
		color: "",
		icon: FaLightbulb,
		value: "expertises",
		element: <ExpertisesList />,
		authorize: authorizeByGroups(["hr-manager", "training-manager"]),
	},
	// {
	// 	name: "برنامه ریزی شیفت کاری",
	// 	color: "",
	// 	icon: FaCalendarDay,
	// 	value: "schedules",
	// 	element: <Schedules />,
	// 	authorize: authorizeByGroups(["attendances-management"]),
	// },
	// {
	// 	name: "تعریف شیفت کاری",
	// 	color: "",
	// 	icon: FaClock,
	// 	value: "workshifts",
	// 	element: <Workshifts />,
	// 	authorize: authorizeByGroups(["attendances-management"]),
	// },
	// {
	// 	name: "ورود و خروج دستی",
	// 	color: "",
	// 	icon: FaArrowDownUpLock,
	// 	value: "manual",
	// 	element: <AttendanceManualWidget />,
	// 	authorize: authorizeByGroups([
	// 		"attendances-management",
	// 		"attendance-manual-reset",
	// 	]),
	// },
];

function HrmClient() {
	return <TabsCreator data={tabs} />;
}

export { HrmClient };
