import { cn } from "@/lib/utils";

import { NavItemLink } from "./NavItemLink";
import { NavItemModal } from "./NavItemModal";
import { NavItemProps } from "./navService";

export function NavItem(props: NavItemProps) {
	const classes = cn("menu-child");

	return (
		<>
			{props.type === "LINK" ? (
				<NavItemLink classes={classes} {...props} />
			) : (
				<NavItemModal classes={classes} {...props} />
			)}
		</>
	);
}
