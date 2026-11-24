"use client";

import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

function RootLayoutBody(props: React.PropsWithChildren) {
	const pathname = usePathname();

	return (
		<body
			className={cn(
				"text-xsm",
				pathname === "/dashboard"
					? "bg-[linear-gradient(180deg,#f7f8fa_0%,#e8eef4_100%)]"
					: "bg-white",
			)}
			{...props}
		/>
	);
}

export default RootLayoutBody;
