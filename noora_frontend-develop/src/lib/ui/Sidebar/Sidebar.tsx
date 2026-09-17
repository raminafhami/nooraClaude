"use client";
import { usePathname } from "next/navigation";
import { useContext, useEffect } from "react";

import DashboardContext from "@/app/dashboard/_module/DashboardContext";
import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";

import { getNavItems, NavMenu } from "../Navbar";
import DrawerMenu from "../Navbar/DrawerMenu";
import MacMenu from "../Navbar/MacMenu";
import UpMenu from "../Navbar/UpMenu";

interface SidebarProps {
	isMenuOpen: boolean;
	setIsMenuOpen: (b: boolean) => void;
	loading: boolean;
}
export function SidebarPage({
	isMenuOpen,
	setIsMenuOpen,
	loading,
}: SidebarProps) {
	const path = usePathname();

	const { identity } = useLoggedInUser();
	const navItems = getNavItems(identity!, path);
	const { userSettings } = useContext(DashboardContext);

	useEffect(() => {
		const storedIsMenuOpen = localStorage?.getItem("isMenuOpen");
		storedIsMenuOpen ? setIsMenuOpen(JSON.parse(storedIsMenuOpen)) : false;
	}, []);

	useEffect(() => {
		localStorage.setItem("isMenuOpen", JSON.stringify(isMenuOpen));
	}, [isMenuOpen]);

	return (
		<div className={`rounded-lg`} id="app-nav">
			{/* {userSettings?.menuStyle === "first" || !userSettings?.menuStyle ? (
				<MacMenu items={navItems} />
			) : userSettings?.menuStyle === "second" ? (
				<NavMenu
					items={navItems}
					isMenuOpen={isMenuOpen}
					setIsMenuOpen={setIsMenuOpen}
				/>
			) : userSettings?.menuStyle === "third" ? (
				<DrawerMenu items={navItems} />
			) : (
				""
			)} */}

			<DrawerMenu items={navItems} />

			{/* <FiMenu
        id="FiMenu"
        onClick={() => !loading && setIsMenuOpen(true)}
        className={`fixed sm:absolute top-3 right-3 md:top-5 ${
          loading ? "cursor-wait" : "cursor-pointer hover:text-blue-500"
        } text-white z-20`}
        size={20}
      /> */}
		</div>
	);
}
