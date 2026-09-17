"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { memo, useCallback, useEffect, useState } from "react";
import { FaAngleRight } from "react-icons/fa6";

import { AlertDescription } from "@/components/ui/alert";
import { DestructiveAlert } from "@/components/ui/alert/destructive-alert";
import { Button } from "@/components/ui/button";
import { DynamicLink } from "@/components/ui/dynamic-link";
import { UserGroup } from "@/identity/groups/models/Group";
import { UserGroupType } from "@/identity/groups/models/GroupType";
import { getGroupById } from "@/identity/groups/services/getGroupById";
import { User } from "@/identity/users/models/User";
import { Layout, Wait } from "@/ui/Layout";
import { getDynamicUrl } from "@/utils/url/getDynamicUrl";

import { GroupContext } from "./GroupContext";
import { GroupInformation } from "./GroupInformation.tsx/GroupInformation";
import { GroupNavigation } from "./GroupNavigation";
import { GroupUsers } from "./GroupUsers/GroupUsers";

export type GroupSection = "information" | "users";

interface Props {
	id: string;
}

export const GroupWidget = memo(function GroupWidget({
	id,
}: Props): React.ReactNode {
	const router = useRouter();

	const [isLoading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [group, setGroup] = useState<UserGroup | null>(null);
	const [users, setUsers] = useState<User[] | null>(null);

	const searchParams = useSearchParams();

	const [section, setSection] = useState<GroupSection>(
		(searchParams.get("section") as GroupSection) || "information",
	);

	const handleSectionChange = useCallback((s: GroupSection) => {
		setSection(s);
	}, []);

	const handleGroupUpdate = useCallback((group: UserGroup) => {
		setGroup((previous) => ({ ...previous, ...group }));
	}, []);

	const handleUsersUpdate = useCallback((users: User[]) => {
		setUsers([...users]);
	}, []);

	useEffect(() => {
		(async () => {
			try {
				setLoading(true);
				setError(null);

				const group = await getGroupById(id);
				if (!group || group.type !== UserGroupType.Group) {
					router.push(getDynamicUrl("/dashboard/admin/groups"));
				}

				setGroup(group);
			} catch (err: any) {
				setError(err?.message || "خطایی در دریافت اطلاعات رخ داد.");
			} finally {
				setLoading(false);
			}
		})();
	}, [id, router]);

	return isLoading ? (
		<Wait />
	) : (
		group && (
			<GroupContext.Provider
				value={{
					group,
					users,
					onGroupUpdate: handleGroupUpdate,
					onUsersUpdate: handleUsersUpdate,
				}}
			>
				<Layout.Root>
					<Layout.Head title={`گروه ${group.title}`}>
						<DynamicLink
							className="py-1items-center flex px-3 transition"
							href="/dashboard/admin"
						>
							<Button>
								<FaAngleRight className="text-2xs" />
								<span className="ms-1">بازگشت</span>
							</Button>
						</DynamicLink>
					</Layout.Head>
					<Layout.Content>
						{error ? (
							<DestructiveAlert>
								<AlertDescription>{error}</AlertDescription>
							</DestructiveAlert>
						) : (
							<>
								<GroupNavigation
									section={section}
									onChange={handleSectionChange}
								/>
								<GroupSection section={section} />
							</>
						)}
					</Layout.Content>
				</Layout.Root>
			</GroupContext.Provider>
		)
	);
});

const GroupSection = memo(function GroupSection({
	section,
}: {
	section: GroupSection;
}): React.ReactNode {
	switch (section) {
		case "information":
			return <GroupInformation />;
		case "users":
			return <GroupUsers />;
		default:
			return <></>;
	}
});
