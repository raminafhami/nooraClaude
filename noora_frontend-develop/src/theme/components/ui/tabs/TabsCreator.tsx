"use client";

import { parseAsString, useQueryState } from "nuqs";
import React, { createElement, ReactNode, useMemo } from "react";
import { IconType } from "react-icons";

import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import { Identity } from "@/auth/models/Identity";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserType } from "@/identity/users/models/UserType";

export interface TabsData<T = any> {
	name: string;
	total?: number;
	color?: string;
	icon: IconType;
	value: string;
	element: ReactNode;
	authorize?: (identity: Identity | undefined, context?: T) => boolean;
}

export function authorizeByGroups(groupNames: string | string[]) {
	return (identity: Identity | undefined) => {
		if (!identity) {
			return false;
		}

		if (identity.type === UserType.System) {
			return true;
		}

		const hasGroup = (
			Array.isArray(groupNames) ? groupNames : [groupNames]
		).some((x) => identity.groups.includes(x));

		return hasGroup;
	};
}

interface Props<T = any> {
	data: TabsData<T>[];
	context?: T;
}

function TabsCreator<T = any>({ data, context }: Props<T>) {
	const { identity } = useLoggedInUser();

	const visibleTabs = useMemo<TabsData<T>[]>(() => {
		return identity?.type === "system" ||
			identity?.groups.includes("system-admin")
			? data
			: (data?.filter((x) => !x.authorize || x.authorize(identity, context)) ??
					[]);
	}, [context, data, identity]);

	const [value, setValue] = useQueryState(
		"tab",
		parseAsString.withDefault(visibleTabs[0]?.value),
	);

	if (visibleTabs.length === 0) {
		return;
	}

	return (
		<Tabs className="w-full" value={value} onValueChange={setValue}>
			<TabsList className="w-full flex-row-reverse justify-start overflow-x-auto">
				{visibleTabs.map((tab) => (
					<TabsTrigger key={tab.value} value={tab.value}>
						{createElement(tab.icon, {
							size: 17,
						})}
						{typeof tab.total !== "undefined" && (
							<div className="absolute start-[3.25rem] top-[4.75rem] h-4 w-10 rounded-bl-3xl rounded-tr-3xl bg-[#ef9b20] px-2 text-white">
								{tab.total}
							</div>
						)}
						{tab.name}
					</TabsTrigger>
				))}
			</TabsList>
			{visibleTabs.map((tab) => (
				<TabsContent key={tab.value} value={tab.value} dir="rtl">
					{tab.element}
				</TabsContent>
			))}
		</Tabs>
	);
}

export default TabsCreator;
