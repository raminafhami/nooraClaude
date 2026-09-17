"use client";

import { parseAsString, useQueryState } from "nuqs";
import * as React from "react";

import { Tabs } from "@/components/ui/tabs";

const TabsWithUrl = React.forwardRef<
	React.ComponentRef<typeof Tabs>,
	Omit<
		React.ComponentPropsWithoutRef<typeof Tabs>,
		"defaultValue" | "value" | "onValueChange"
	> & {
		defaultValue: string;
		urlParam?: string;
	}
>(({ children, defaultValue, urlParam = "tab", ...props }, ref) => {
	const [value, setValue] = useQueryState(
		urlParam,
		parseAsString.withDefault(defaultValue),
	);

	return (
		<Tabs ref={ref} value={value} onValueChange={setValue} {...props}>
			{children}
		</Tabs>
	);
});
TabsWithUrl.displayName = "TabsWithUrl";

export { TabsWithUrl };
