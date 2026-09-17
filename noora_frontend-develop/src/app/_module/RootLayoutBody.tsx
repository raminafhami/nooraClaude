"use client";

import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

function RootLayoutBody(props: React.PropsWithChildren) {
	const pathname = usePathname();

	return (
		<body
			className={cn(
				"text-xsm",
				pathname === "/dashboard" ? "bg-gray-100" : "bg-white",
			)}
			{...props}
		/>
	);
}

export default RootLayoutBody;
