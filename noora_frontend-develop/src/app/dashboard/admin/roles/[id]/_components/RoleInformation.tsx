"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaSquare } from "react-icons/fa";

import { Input } from "@/form/Input";
import { UserGroup } from "@/identity/groups/models/Group";
import { UserGroupType } from "@/identity/groups/models/GroupType";
import { getGroupById } from "@/identity/groups/services/getGroupById";
import { getGroups } from "@/identity/groups/services/getGroups";
import { Loading } from "@/ui/Loader";

interface Props {
	id: string;
}

export function RoleInformation({ id }: Props) {
	const router = useRouter();

	const [role, setRole] = useState<UserGroup>();

	useEffect(() => {
		(async () => {
			const role = await getGroupById(id);

			if (!role) {
				router.replace("/dashboard/admin/roles");
				return;
			}

			const children = await getGroups(UserGroupType.Role, {
				filters: [{ name: "parentId", value: role.id }],
			});

			setRole({ ...role, children });
		})();
	}, []);

	if (!role) {
		return <Loading size="sm">در حال دریافت اطلاعات...</Loading>;
	}

	return (
		<div className="grid grid-cols-12 gap-x-10 gap-y-6">
			<div className="col-span-3 col-start-1">
				<label>عنوان:</label>
				<Input className="mt-2" defaultValue={role.title} disabled />
			</div>

			<div className="col-span-3 col-start-1">
				<label>نام:</label>
				<Input className="mt-2" defaultValue={role.name} disabled />
			</div>

			<div className="col-span-3 col-start-1">
				<label>نقش پدر:</label>
				<div className="mt-2">
					<Input
						className="mt-2"
						defaultValue={role.parent ? (role.parent as UserGroup).title : "-"}
						disabled
					/>
				</div>
			</div>

			<div className="col-span-3 col-start-1">
				<label>زیر نقش ها:</label>
				<div className="mt-2 space-y-1.5 ps-4">
					{(role.children &&
						role.children.length !== 0 &&
						role.children?.map((child) => (
							<div className="flex items-center gap-x-2" key={child.id}>
								<FaSquare className="text-[.375rem]" />
								{child.title}
							</div>
						))) ||
						"زیر نقشی وجود ندارد."}
				</div>
			</div>

			<div className="col-span-3 col-start-1">
				<label>کاربران:</label>
				<div className="mt-2 space-y-1.5 ps-4">
					{(role.users &&
						role.users.length !== 0 &&
						role.users.map((user) => (
							<div className="flex items-center gap-x-2" key={user.id}>
								<FaSquare className="text-[.375rem]" />
								{user.fullname}
							</div>
						))) ||
						"کاربری در این نقش وجود ندارد."}
				</div>
			</div>
		</div>
	);
}
