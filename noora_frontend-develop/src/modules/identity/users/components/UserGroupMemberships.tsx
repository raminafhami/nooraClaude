"use client";

import { useEffect, useState } from "react";

import { UserGroup } from "@/identity/groups/models/Group";
import { UserGroupType } from "@/identity/groups/models/GroupType";

import { User } from "../models/User";
import getUserById from "../services/getUserById";

function titles(groups: User["groups"] | undefined, type: UserGroupType) {
	return ((groups ?? []) as UserGroup[])
		.filter((item) => typeof item !== "string" && item.type === type)
		.map((item) => item.title);
}

function UserGroupMemberships({ userId }: { userId: string }) {
	const [roles, setRoles] = useState<string[]>([]);
	const [groups, setGroups] = useState<string[]>([]);

	useEffect(() => {
		let active = true;
		getUserById(userId)
			.then((user) => {
				if (!active) return;
				setRoles(titles(user.groups, UserGroupType.Role));
				setGroups(titles(user.groups, UserGroupType.Group));
			})
			.catch(() => undefined);
		return () => {
			active = false;
		};
	}, [userId]);

	return (
		<div className="col-span-full space-y-3">
			<div className="space-y-1">
				<div className="text-muted-foreground">نقش‌ها</div>
				<div>{roles.length ? roles.join("، ") : "-"}</div>
			</div>
			<div className="space-y-1">
				<div className="text-muted-foreground">گروه‌ها</div>
				<div>{groups.length ? groups.join("، ") : "-"}</div>
			</div>
		</div>
	);
}

export { UserGroupMemberships };
