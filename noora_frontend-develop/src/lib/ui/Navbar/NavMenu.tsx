"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { IoMdClose } from "react-icons/io";

import { NavItem } from "./NavItem";
import { NavItemProps } from "./navService";

interface Props {
	items: NavItemProps[];
	setIsMenuOpen: (state: boolean) => void;
	isMenuOpen: boolean;
}

const pathPrefix = "/dashboard";

export function NavMenu({ items, isMenuOpen, setIsMenuOpen }: Props) {
	const menuRef = useRef<HTMLDivElement>(null);

	const handleItemClick = () => {
		const isMobile = window.matchMedia("(max-width: 1024px)").matches;
		isMenuOpen && isMobile && setIsMenuOpen(false);
	};

	const pathname = usePathname();

	function setActive(url: string) {
		const urlWithoutPrefix = url.replaceAll(pathPrefix, "");
		const pathWithoutPrefix = pathname.replaceAll(pathPrefix, "");

		let isActive = false;
		if (urlWithoutPrefix === "") {
			return pathWithoutPrefix === urlWithoutPrefix;
		} else {
			return pathWithoutPrefix.startsWith(urlWithoutPrefix);
		}
	}

	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				setIsMenuOpen(false);
			}
		}

		function handleEscapeKey(event: KeyboardEvent) {
			if (event.key === "Escape") {
				setIsMenuOpen(false);
			}
		}

		const isMobile = window.matchMedia("(max-width: 1024px)").matches;

		if (isMenuOpen && isMobile) {
			document.addEventListener("mousedown", handleClickOutside);
			document.addEventListener("keydown", handleEscapeKey);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			document.removeEventListener("keydown", handleEscapeKey);
		};
	}, [isMenuOpen, setIsMenuOpen]);

	return (
		items && (
			<aside
				ref={menuRef}
				id="default-sidebar "
				className={`fixed bottom-0 right-0 top-0 z-40 my-20 h-screen rounded-2xl backdrop-blur-sm transition-all delay-75`}
				aria-label="Sidenav"
			>
				<div className="relative h-full w-max rounded-sm">
					{/* {isMenuOpen && (
            <IoMdClose
              onClick={() => setIsMenuOpen(false)}
              className="absolute left-3 top-3 cursor-pointer hover:text-red-500"
              size={20}
            />
          )} */}

					{items.map((item, index) => (
						<div
							key={index}
							className={`menu-parent group !my-4 !w-[53px] transition-all delay-100 hover:!w-[234px] ${
								setActive(item.url as string)
									? "grayscale-0"
									: "grayscale hover:grayscale-0"
							}`}
							onClick={handleItemClick}
						>
							<span className="menu-child-container">
								<NavItem key={item.label} {...item} />
							</span>
							{
								<span
									className={`absolute right-16 ms-2 select-none text-nowrap opacity-0 transition-all delay-75 group-hover:opacity-100`}
								>
									{item.label}
								</span>
							}
						</div>
					))}
				</div>
				{/* <div className="hidden flex-wrap absolute bottom-0 left-0 justify-center items-center p-4 space-x-4 w-full lg:flex bg-gray-100 dark:bg-gray-800 z-20 border-r border-gray-200 dark:border-gray-700">
            <a
              href="#"
              className="m-0 inline-flex justify-center p-2 text-gray-500 rounded cursor-pointer dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-600"
            >
              <svg
                aria-hidden="true"
                className="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z"></path>
              </svg>
            </a>
            <a
              href="#"
              data-tooltip-target="tooltip-settings"
              className="!m-0 inline-flex justify-center p-2 text-gray-500 rounded cursor-pointer dark:text-gray-400 dark:hover:text-white hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-600"
            >
              <svg
                aria-hidden="true"
                className="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill-rule="evenodd"
                  d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                  clip-rule="evenodd"
                ></path>
              </svg>
            </a>
          </div> */}
			</aside>
		)
	);
}
