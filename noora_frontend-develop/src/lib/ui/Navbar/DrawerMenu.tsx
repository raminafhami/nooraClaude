"use client";

import { memo, useState } from "react";
import { FaX } from "react-icons/fa6";
import { TfiMenu } from "react-icons/tfi";

import { DynamicLink } from "@/components/ui/dynamic-link";
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTrigger,
} from "@/components/ui/sheet";

import { NavItemProps } from "./navService";

const DrawerMenu = ({ items }: { items: NavItemProps[] }) => {
	const [isOpen, setIsOpen] = useState<boolean>(false);

	return (
		<Sheet onOpenChange={setIsOpen} open={isOpen}>
			<SheetTrigger className="drawer-menu !lg:hidden absolute right-3 top-2 mx-3 max-lg:block sm:mx-5 md:mx-8 lg:mx-10">
				<TfiMenu size={20} />
			</SheetTrigger>
			<SheetContent
				className="overflow-y-auto border-none bg-[#0A263B] pt-8 text-white"
				hideClose
			>
				<SheetHeader>
					<SheetClose className="ms-auto flex size-8 items-center justify-center">
						<FaX />
					</SheetClose>

					<SheetDescription>
						<div className="space-y-2">
							{items.map((item) => (
								<DynamicLink
									key={item.label}
									className="dock-item group flex items-center gap-2"
									href={item.type === "LINK" ? item.url : ""}
									style={{ transition: "all ease .2s" }}
									onClick={() => setIsOpen(false)}
								>
									<span className="size-10">{item.icon}</span>
									<span className="text-white">{item.label}</span>
								</DynamicLink>
							))}
						</div>
					</SheetDescription>
				</SheetHeader>
			</SheetContent>
		</Sheet>
	);
};

export default memo(DrawerMenu);
