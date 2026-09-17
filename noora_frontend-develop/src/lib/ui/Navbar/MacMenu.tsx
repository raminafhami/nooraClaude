import { usePathname } from "next/navigation";
import { memo, MutableRefObject, useRef } from "react";

import { DynamicLink } from "@/components/ui/dynamic-link";

import { NavItemProps } from "./navService";

interface Props {
	items: NavItemProps[];
}
const MacMenu = ({ items }: Props) => {
	const path = usePathname();

	const dockButtonsWrapper =
		useRef<HTMLDivElement>() as MutableRefObject<HTMLDivElement>;

	const handleItemsMouseEnter = (itemIndex: number) => {
		const expandSize = 12;

		const buttonElements = dockButtonsWrapper.current
			.children as HTMLCollectionOf<HTMLDivElement>;

		buttonElements[itemIndex].style.width = `${expandSize}rem`;

		if (itemIndex > 0 && buttonElements[itemIndex - 1]) {
			buttonElements[itemIndex - 1].style.width = `${expandSize - 1.5}rem`;
		}

		if (itemIndex > 0 && buttonElements[itemIndex - 2]) {
			buttonElements[itemIndex - 2].style.width = `${expandSize - 2.5}rem`;
		}

		if (buttonElements[itemIndex + 1]) {
			buttonElements[itemIndex + 1].style.width = `${expandSize - 1.5}rem`;
		}

		if (buttonElements[itemIndex + 2]) {
			buttonElements[itemIndex + 2].style.width = `${expandSize - 2.5}rem`;
		}
	};

	const handleItemsMouseLeave = (itemIndex: number) => {
		const unexpandSize = 3.1;

		const buttonElements = dockButtonsWrapper.current
			.children as HTMLCollectionOf<HTMLDivElement>;

		buttonElements[itemIndex].style.width = `${unexpandSize}em`;

		if (itemIndex > 0 && buttonElements[itemIndex - 1]) {
			buttonElements[itemIndex - 1].style.width = `${unexpandSize}em`;
		}

		if (itemIndex > 0 && buttonElements[itemIndex - 2]) {
			buttonElements[itemIndex - 2].style.width = `${unexpandSize}em`;
		}

		if (buttonElements[itemIndex + 1]) {
			buttonElements[itemIndex + 1].style.width = `${unexpandSize}em`;
		}

		if (buttonElements[itemIndex + 2]) {
			buttonElements[itemIndex + 2].style.width = `${unexpandSize}em`;
		}
	};

	return (
		<div
			dir="ltr"
			className="fixed bottom-0 right-0 top-[80px] z-50 m-auto w-fit overflow-y-auto overflow-x-hidden rounded-xl bg-white bg-opacity-10 px-2"
		>
			<div
				className="flex flex-col items-start"
				dir="rtl"
				ref={dockButtonsWrapper}
			>
				{items.map((item, i: number) => (
					<DynamicLink
						href={item.type === "LINK" ? item.url : ""}
						key={item.label}
						className="dock-item menu-parent group !my-2 block align-bottom"
						style={{ transition: "all ease .2s" }}
						onMouseEnter={() => handleItemsMouseEnter(i)}
						onMouseLeave={() => handleItemsMouseLeave(i)}
					>
						<div
							className={`group !mx-0 !my-4 !w-[53px] transition-all delay-100 ${
								item?.url && path.includes(item?.url) ? "" : "menu-parent"
							}`}
							style={{ backgroundImage: "none" }}
						>
							<span
								className={`menu-child-container group ${
									item?.url && path.includes(item?.url) ? "" : ""
								}`}
							>
								<span
									className={`menu-child ${
										item?.url && path.includes(item?.url) ? "" : ""
									}`}
								>
									{item.icon}
								</span>
								<span
									className={`invisible absolute right-20 ms-2 select-none text-nowrap opacity-0 transition-all group-hover:visible group-hover:opacity-100`}
									style={{
										color: "#fff",
									}}
								>
									{item.label}
								</span>
							</span>
						</div>
					</DynamicLink>
				))}
			</div>
		</div>
	);
};

export default memo(MacMenu);
