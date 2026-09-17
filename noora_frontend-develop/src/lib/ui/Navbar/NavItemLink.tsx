"use client";

import { usePathname } from "next/navigation";
import { twMerge } from "tailwind-merge";

import { DynamicLink } from "@/components/ui/dynamic-link";

import { NavItemLinkProps } from "./navService";

const pathPrefix = "/dashboard";

export function NavItemLink({ classes, label, url, icon }: NavItemLinkProps) {
	const pathname = usePathname();

	const urlWithoutPrefix = url.replaceAll(pathPrefix, "");
	const pathWithoutPrefix = pathname.replaceAll(pathPrefix, "");

	let isActive = false;
	if (urlWithoutPrefix === "") {
		isActive = pathWithoutPrefix === urlWithoutPrefix;
	} else {
		isActive = pathWithoutPrefix.startsWith(urlWithoutPrefix);
	}

	const linkClasses = twMerge(classes);

	return (
		<DynamicLink className={linkClasses} href={url}>
			{icon}
		</DynamicLink>
	);
}
