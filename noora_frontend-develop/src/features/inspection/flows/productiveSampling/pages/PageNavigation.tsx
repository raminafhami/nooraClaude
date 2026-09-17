"use client";

import { ReactNode } from "react";
import {
  FaFileInvoice,
  FaFilePrescription,
  FaFolderOpen,
  FaMoneyBillTransfer,
  FaTicket,
} from "react-icons/fa6";
import { RiArchiveDrawerLine } from "react-icons/ri";
import { twMerge } from "tailwind-merge";

import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import { Identity } from "@/auth/models/Identity";
import { UserType } from "@/identity/users/models/UserType";
import { useInspectionContext } from "@/inspection/context/InspectionContext";

import { PageSection } from "./PageWidget";

interface Props {
	section: PageSection | null;
	onChange: (section: PageSection) => void;
}

interface ItemProps {
	icon: ReactNode;
	name: PageSection;
	text: ReactNode;
	groups?: string[];
	authorize?: (identity: Identity, data: any) => boolean;
}

const items: ItemProps[] = [
	{
		icon: <FaFilePrescription className="text-base" />,
		name: "report",
		text: "گزارش",
		groups: [],
	},
	{
		icon: <FaMoneyBillTransfer className="text-base" />,
		name: "financials",
		text: "مالی",
		groups: ["branch-manager", "financial-expert", "financial-assistant"],
	},
	{
		icon: <FaFileInvoice className="text-base" />,
		name: "invoice",
		text: "فاکتورها",
		authorize: (identity: Identity) =>
			["branch-manager", "financial-expert", "financial-assistant"].some(
				(group) => identity.groups.includes(group),
			),
	},
	{
		icon: <FaTicket className="text-base" />,
		name: "ticket",
		text: "تیکت",
		groups: [],
	},
	{
		icon: <RiArchiveDrawerLine className="text-base" />,
		name: "secretariat",
		text: "نامه ها",
		groups: [],
	},
	{
		icon: <FaFolderOpen className="text-base" />,
		name: "documents",
		text: "مدارک",
		groups: [],
	},
];

export function PageNavigation({ section, onChange }: Props) {
	const { identity } = useLoggedInUser();

	const { instance } = useInspectionContext();

	const filteredItems = items.filter((item) => {
		if (identity.type === UserType.System || identity.groups.includes("ceo")) {
			return true;
		}

		if (item.groups) {
			if (item.groups.length === 0) {
				return true;
			}

			return (
				item.groups.filter((x) => identity.groups.includes(x)).length !== 0
			);
		} else {
			return (
				instance.owner === identity.id ||
				instance.watchers?.find((x) => x === identity.id) ||
				item.authorize?.(identity, instance)
			);
		}
	});

	return (
		<>
			<div>
				<ul className="flex min-h-[6.25rem] gap-x-4 rounded-xl border-t-4 border-t-gray-200 bg-gray-100 px-4 py-2">
					{filteredItems.map((item) => {
						const { icon, name, text } = item;

						return (
							<li
								className={twMerge(
									"group relative flex h-20 w-24 cursor-pointer flex-col items-center justify-center gap-y-2 rounded-xl bg-gray-200 px-2 py-1 text-center transition-all duration-300",
									section === name && "top-2 rounded-b-none bg-white",
								)}
								key={name}
								onClick={() => {
									onChange(name);
								}}
							>
								{icon}
								<div>{text}</div>
							</li>
						);
					})}
				</ul>
			</div>
		</>
	);
}
