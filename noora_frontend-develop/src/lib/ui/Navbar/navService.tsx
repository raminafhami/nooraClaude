"use client";

import Image from "next/image";
import {
	ReactNode,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";
import { BsCollection, BsUiChecks } from "react-icons/bs";
import { FaRegChartBar, FaTasks } from "react-icons/fa";
import { FaCashRegister, FaRegCircleUser } from "react-icons/fa6";
import { FiLogOut } from "react-icons/fi";
import { HiOutlineCircleStack } from "react-icons/hi2";
import { IoMdRefresh } from "react-icons/io";
import { LiaUsersCogSolid } from "react-icons/lia";
import { PiUserListFill, PiUsersThreeFill } from "react-icons/pi";
import { RiAdminFill, RiAdminLine, RiArchiveDrawerLine } from "react-icons/ri";
import { TbReportAnalytics } from "react-icons/tb";

import { Identity } from "@/auth/models/Identity";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { InstanceStatus } from "@/felo/instances/enums/InstanceStatus";
import { getInstances } from "@/felo/instances/services/getInstances";
import { UserType } from "@/identity/users/models/UserType";
import getActiveUser from "@/identity/users/services/getActiveUser";
import { InvoicePaymentStatus } from "@/inspection/models/InvoicePaymentStatus";

import BiActive from "../../../../public/images/navIcons/Group 100.svg";
import BscollectionActive from "../../../../public/images/navIcons/Group 101.svg";
import FinacialActive from "../../../../public/images/navIcons/Group 102.svg";
import PeopleActive from "../../../../public/images/navIcons/Group 103.svg";
import AdminActive from "../../../../public/images/navIcons/Group 104.svg";
import Hr from "../../../../public/images/navIcons/Group 106.svg";
import HrActive from "../../../../public/images/navIcons/Group 107.svg";
import StoreroomActive from "../../../../public/images/navIcons/Group 108.svg";
import ListActive from "../../../../public/images/navIcons/Group 109.svg";
import TaskActive from "../../../../public/images/navIcons/Group 110.svg";
import SecretariatActive from "../../../../public/images/navIcons/Group 111.svg";
import Management from "../../../../public/images/navIcons/Group 113.svg";
import ManagementActive from "../../../../public/images/navIcons/Group 114.svg";
import Inspection from "../../../../public/images/navIcons/Group 116.svg";
import InspectionActive from "../../../../public/images/navIcons/Group 119.svg";
import People from "../../../../public/images/navIcons/Group 68.svg";
import BI from "../../../../public/images/navIcons/Group 72.svg";
import Bscollection from "../../../../public/images/navIcons/Group 88 (1).svg";
import Finacial from "../../../../public/images/navIcons/Group 90.svg";
import Admin from "../../../../public/images/navIcons/Group 91.svg";
import Storeroom from "../../../../public/images/navIcons/Group 93.svg";
import List from "../../../../public/images/navIcons/Group 94.svg";
import Task from "../../../../public/images/navIcons/Group 95.svg";
import Secretariat from "../../../../public/images/navIcons/Group 97.svg";
import ProfileActive from "../../../../public/images/navIcons/Group 99.svg";
import Home from "../../../../public/images/navIcons/h.svg";
import HomeActive from "../../../../public/images/navIcons/home.svg";
import Profile from "../../../../public/images/navIcons/profile.svg";
import { Loading } from "../Loader";
import { ModalSize } from "../Modal";

interface NavItemTemplate {
	type: string;
	label: string;
	groups?: string[];
	classes?: string;
	url?: string;
	icon?: ReactNode;
}

export interface NavItemLinkProps extends NavItemTemplate {
	type: "LINK";
	url: string;
}

export interface NavItemModalProps extends NavItemTemplate {
	type: "MODAL";
	modalKey: any;
	modalSize: ModalSize;
	modalTitle?: string;
	modalContent: ReactNode;
	icon?: ReactNode;
}

export type NavItemProps = NavItemLinkProps | NavItemModalProps;

export function getNavItems(identity: Identity, path: string): NavItemProps[] {
	const items: NavItemProps[] = [
		{
			type: "LINK",
			label: "داشبورد",
			url: "/dashboard",
			groups: [],
			icon: (
				<Image
					src={path?.endsWith("/dashboard") ? HomeActive : Home}
					alt="home"
					width={55}
					height={55}
				/>
			),
		},
		{
			type: "LINK",
			label: "کارتابل من",
			url: "/dashboard/tasks",
			groups: [],
			icon: (
				<Image
					src={path?.endsWith("/dashboard/tasks") ? ProfileActive : Profile}
					alt="profile"
					width={55}
					height={55}
				/>
			),
		},
		{
			type: "LINK",
			label: "گزارش‌ها",
			url: "/dashboard/inspection",
			groups: [],
			icon: (
				<Image
					src={
						path?.includes("/dashboard/inspection")
							? InspectionActive
							: Inspection
					}
					alt="profile"
					width={55}
					height={55}
				/>
			),
		},

		{
			type: "LINK",
			label: "وصول",
			url: "/dashboard/collection",
			groups: [
				"coi-expert",
				"coi-admin",
				"ic-expert",
				"ic-manager",
				"coi-manager",
			],
			icon: (
				<Image
					src={
						path?.includes("/dashboard/collection")
							? BscollectionActive
							: Bscollection
					}
					alt="bscollection"
					width={55}
					height={55}
				/>
			),
		},
		{
			type: "LINK",
			label: "مالی",
			url: "/dashboard/financial",
			groups: [],
			icon: (
				<Image
					src={
						path?.includes("/dashboard/financial") ? FinacialActive : Finacial
					}
					alt="finacial"
					width={55}
					height={55}
				/>
			),
		},
		{
			type: "LINK",
			label: "مخاطبین",
			url: "/dashboard/contacts",
			icon: (
				<Image
					src={path?.includes("/dashboard/contacts") ? PeopleActive : People}
					alt="people"
					width={55}
					height={55}
				/>
			),
			groups: [],
		},

		{
			type: "LINK",
			label: "ادمین",
			url: "/dashboard/admin",
			icon: (
				<Image
					src={path?.includes("/dashboard/admin") ? AdminActive : Admin}
					alt="admin"
					width={55}
					height={55}
				/>
			),
			groups: ["system-admin"],
		},
		{
			type: "LINK",
			label: "منابع انسانی",
			url: "/dashboard/hr-management",
			groups: ["hr-manager", "training-manager"],
			icon: (
				<Image
					src={path?.includes("/dashboard/hr-management") ? HrActive : Hr}
					alt="lists"
					width={55}
					height={55}
				/>
			),
		},

		{
			type: "LINK",
			label: "انبار",
			url: "/dashboard/storage",
			groups: ["system-admin", "storeroom-management", "property-manage"],
			icon: (
				<Image
					src={
						path?.includes("/dashboard/storage") ? StoreroomActive : Storeroom
					}
					alt="storeroom"
					width={55}
					height={55}
				/>
			),
		},
		{
			type: "LINK",
			label: "تضمین کیفیت",
			url: "/dashboard/procedure",
			groups: ["system-admin", "qa-manager"],
			icon: (
				<Image
					src={path?.includes("/dashboard/procedure") ? ListActive : List}
					alt="lists"
					width={55}
					height={55}
				/>
			),
		},
		{
			type: "LINK",
			label: "تسک ها",
			url: "/dashboard/tasks-list",
			groups: [],
			icon: (
				<Image
					src={path?.endsWith("/dashboard/tasks-list") ? TaskActive : Task}
					alt="task"
					width={55}
					height={55}
				/>
			),
		},
		// {
		//   type: "LINK",
		//   label: "مدارک شرکت",
		//   url: "/dashboard/company-documents",
		//   groups: ["system-admin"],
		//   icon: <IoDocumentAttachOutline size={18} className="" style={{color:'#0D1A39'}} />,
		// },

		{
			type: "LINK",
			label: "مدیریت",
			url: "/dashboard/management",
			groups: ["system-admin", "hr-manager", "stakeholders-management"],
			icon: (
				<Image
					src={
						path?.includes("/dashboard/management")
							? ManagementActive
							: Management
					}
					alt="management"
					width={55}
					height={55}
				/>
			),
		},
		{
			type: "LINK",
			label: "دبیرخانه",
			url: "/dashboard/secretariat",
			groups: [],
			icon: (
				<Image
					src={
						path?.includes("/dashboard/secretariat")
							? SecretariatActive
							: Secretariat
					}
					alt="letters"
					width={55}
					height={55}
				/>
			),
		},
		{
			type: "LINK",
			label: "نمودارها",
			url: "/dashboard/charts",
			groups: ["system-admin"],
			icon: (
				<Image
					src={path?.includes("/dashboard/charts") ? BiActive : BI}
					alt="bi"
					width={55}
					height={55}
				/>
			),
		},

		// {
		// 	type: "LINK",
		// 	label: "تنظیمات",
		// 	url: "/dashboard/settings",
		// 	groups: [],
		// 	icon: (
		// 		<Image
		// 			src={Setting}
		// 			alt="letters"
		// 			width={60}
		// 			height={60}
		// 			style={{
		// 				color: `${
		// 					path?.includes("/dashboard/charts") ? "#C6AC6A" : "#0D1A39"
		// 				}`,
		// 			}}
		// 		/>
		// 	),
		// },
		// {
		// 	type: "LINK",
		// 	label: "پروفایل",
		// 	url: "/dashboard/profile",
		// 	groups: [],
		// 	icon: (
		// 		<Image
		// 			src={EditProflie}
		// 			alt="editProfile"
		// 			width={60}
		// 			height={60}
		// 			style={{
		// 				color: `${
		// 					path?.includes("/dashboard/profile") ? "#C6AC6A" : "#0D1A39"
		// 				}`,
		// 			}}
		// 		/>
		// 	),
		// },

		// {
		// 	type: "LINK",
		// 	label: "خروج",
		// 	url: "/api/auth/logout",
		// 	groups: [],
		// 	icon: (
		// 		<FiLogOut
		// 			size={18}
		// 			className=""
		// 			style={{
		// 				color: `${
		// 					path?.includes("/dashboard/logout") ? "#C6AC6A" : "#0D1A39"
		// 				}`,
		// 			}}
		// 		/>
		// 	),
		// },
	];

	if (!identity) {
		return [];
	}

	return items.filter(
		(item) =>
			identity.type === UserType.System ||
			(item.groups &&
				(identity.groups.includes("system-admin") ||
					item.groups.length === 0 ||
					item.groups.filter((x) => identity.groups.includes(x)).length !== 0)),
	);
}
