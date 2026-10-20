"use client";

import { usePathname, useRouter } from "next/navigation";
import { FaArrowRight } from "react-icons/fa6";

import { Button } from "@/components/ui/button";

// Site-wide rule: every inner page (two or more levels below /dashboard,
// e.g. /dashboard/procedure/forms/<id>) gets a back button. Top-level module
// pages (/dashboard/procedure) do not.
function isInnerPage(pathname: string): boolean {
	const segments = pathname.split("/").filter(Boolean);
	return segments[0] === "dashboard" && segments.length >= 3;
}

function BackButton() {
	const router = useRouter();
	const pathname = usePathname();

	if (!pathname || !isInnerPage(pathname)) return null;

	function handleBack() {
		// Opened directly (new tab / link): there is no in-app history to go
		// back to, so land on the owning module page instead.
		if (window.history.length > 1) {
			router.back();
		} else {
			router.push(`/${pathname.split("/").filter(Boolean).slice(0, 2).join("/")}`);
		}
	}

	return (
		<Button
			type="button"
			variant="outline"
			size="sm"
			className="shrink-0"
			onClick={handleBack}
		>
			<FaArrowRight className="text-2xs" />
			<span className="ms-1">بازگشت</span>
		</Button>
	);
}

export { BackButton };
