"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Permission } from "@/identity/permissions/models/Permission";
import { getPermissions } from "@/identity/permissions/services/getPermissions";
import { Loading } from "@/ui/Loader";

import { ACTION_ORDER } from "./permissionActions";
import { PageGroup, PermissionTree, SubjectGroup } from "./PermissionTree";
import { ROLE_PERMISSION_PAGES } from "./rolePermissionPages";

interface RolePermissionsFieldProps {
	value: string[];
	onChange: (permissions: string[]) => void;
	onReady: (ready: boolean) => void;
}

function subjectLabelOf(permission: Permission): string {
	const [label] = permission.description?.split(" - ") ?? [];
	return label || permission.subject;
}

export function RolePermissionsField({
	value,
	onChange,
	onReady,
}: RolePermissionsFieldProps) {
	const [permissions, setPermissions] = useState<Permission[]>();
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState(false);
	const [attempt, setAttempt] = useState(0);

	useEffect(() => {
		let active = true;
		setLoading(true);
		setError(false);
		onReady(false);
		(async () => {
			try {
				const catalog = await getPermissions();
				if (!active) return;
				setPermissions(catalog);
				onReady(true);
			} catch {
				if (active) setError(true);
			} finally {
				if (active) setLoading(false);
			}
		})();
		return () => { active = false; };
	}, [attempt, onReady]);

	const subjectGroupsBySubject = useMemo(() => {
		const map = new Map<string, SubjectGroup>();
		for (const permission of permissions ?? []) {
			const existing = map.get(permission.subject);
			if (existing) {
				existing.permissions.push(permission);
			} else {
				map.set(permission.subject, {
					subject: permission.subject,
					label: subjectLabelOf(permission),
					permissions: [permission],
				});
			}
		}
		for (const group of map.values()) {
			group.permissions.sort(
				(a, b) =>
					ACTION_ORDER.indexOf(a.actions[0]) - ACTION_ORDER.indexOf(b.actions[0]),
			);
		}
		return map;
	}, [permissions]);

	const pageGroups = useMemo<PageGroup[]>(() => {
		if (!permissions) return [];

		const used = new Set<string>();
		const pages: PageGroup[] = ROLE_PERMISSION_PAGES.map((page) => {
			const subjectGroups: SubjectGroup[] = [];
			for (const subject of page.subjects) {
				const group = subjectGroupsBySubject.get(subject);
				if (group && !used.has(subject)) {
					subjectGroups.push(group);
					used.add(subject);
				}
			}
			return { label: page.label, subjectGroups };
		}).filter((page) => page.subjectGroups.length > 0);

		const leftovers: SubjectGroup[] = [];
		for (const group of subjectGroupsBySubject.values()) {
			if (!used.has(group.subject)) {
				leftovers.push(group);
			}
		}
		leftovers.sort((a, b) => a.label.localeCompare(b.label, "fa"));

		if (leftovers.length) {
			pages.push({ label: "سایر", subjectGroups: leftovers });
		}

		return pages;
	}, [permissions, subjectGroupsBySubject]);

	if (loading) {
		return <Loading size="sm">در حال دریافت دسترسی‌ها...</Loading>;
	}
	if (error) {
		return (
			<div className="flex items-center gap-3">
				<p role="alert">دریافت فهرست مجوزها انجام نشد.</p>
				<Button type="button" variant="outline" onClick={() => setAttempt(attempt + 1)}>
					تلاش دوباره
				</Button>
			</div>
		);
	}

	return <PermissionTree pageGroups={pageGroups} value={value} onChange={onChange} />;
}
