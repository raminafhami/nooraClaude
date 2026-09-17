"use client";

import { AiOutlineForm } from "react-icons/ai";
import { FaFileContract, FaInfo, FaLock } from "react-icons/fa";
import { FaGear } from "react-icons/fa6";
import { IoDocumentText } from "react-icons/io5";

import TabsCreator, { TabsData } from "@/components/ui/tabs/TabsCreator";

import AuditProfile from "./AuditProfile";
import { ProfileDocuments } from "./documents/ProfileDocuments";
import { LoginSettingsPage } from "./login-settings/LoginSettingsPage";
import { ProfileContracts } from "./ProfileContracts/ProfileContracts";
import { ProfileInformation } from "./ProfileInformation";
import SettingsPage from "./settings/SettingsPage";

function ProfilePage() {
	const ProfileTabs: TabsData[] = [
		{
			icon: FaInfo,
			value: "information",
			name: "اطلاعات",
			element: <ProfileInformation />,
		},
		// {
		// 	icon: FaClock,
		// 	value: "attendance",
		// 	name: "ورود و خروج",
		// 	element: <ProfileAttendance />,
		// },
		// {
		// 	icon: FaHistory,
		// 	value: "entriesHistory",
		// 	name: "گزارش گیری",
		// 	element: <EntriesHistoryWidget />,
		// },
		// {
		// 	icon: FaClock,
		// 	value: "request",
		// 	name: "درخواست‌ها",
		// 	element: <ProfileAttendanceRequests />,
		// },
		{
			icon: IoDocumentText,
			value: "documents",
			name: "مدارک",
			element: <ProfileDocuments />,
		},
		{
			icon: FaFileContract,
			value: "contracts",
			name: "قرارداد پرسنلی",
			element: <ProfileContracts />,
		},
		// {
		// 	icon: AiOutlineForm,
		// 	value: "myForms",
		// 	name: "ارزیابی",
		// 	element: <MyForms />,
		// },
		{
			icon: FaLock,
			value: "login",
			name: "تنظیمات ورود",
			element: <LoginSettingsPage />,
		},
		{
			icon: FaGear,
			value: "settings",
			name: "تنظیمات",
			element: <SettingsPage />,
		},
		{
			icon: AiOutlineForm,
			value: "audit",
			name: "روش های اجرایی و دستورالعملها",
			element: <AuditProfile />,
		},
	];

	return <TabsCreator data={ProfileTabs} />;
}

export { ProfilePage };
