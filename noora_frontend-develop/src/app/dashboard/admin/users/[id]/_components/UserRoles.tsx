"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { FaSquare } from "react-icons/fa";
import { twMerge } from "tailwind-merge";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { UserGroup } from "@/identity/groups/models/Group";
import { UserGroupType } from "@/identity/groups/models/GroupType";
import { getGroups } from "@/identity/groups/services/getGroups";
import getUserById from "@/identity/users/services/getUserById";
import { updateUserGroups } from "@/identity/users/services/updateUserGroups";
import { Head } from "@/ui/Head";
import { Loading } from "@/ui/Loader";
import { getDynamicUrl } from "@/utils/url/getDynamicUrl";

interface Props {
	id: string;
}

interface FormData {
	roles: string[];
	groups: string[];
}

interface UserGroupNode {
	id: string;
	title: string;
	children: UserGroupNode[];
}

export function UserRoles({ id }: Props) {
	const router = useRouter();

	const [isLoading, setLoading] = useState<boolean>(true);
	const [roles, setRoles] = useState<UserGroupNode[]>();
	const [groupOptions, setGroupOptions] = useState<UserGroupNode[]>();

	const form = useForm<FormData>();
	const { formState, handleSubmit, reset, setError, setValue, watch } = form;
	const { isDirty, isSubmitting, isSubmitSuccessful } = formState;
	const fields = watch();

	const fetchMemberships = useCallback(async () => {
		const user = await getUserById(id);
		const memberships = user.groups as UserGroup[];
		return {
			roles: memberships.filter((item) => item.type === "role").map((item) => item.id),
			groups: memberships.filter((item) => item.type === "group").map((item) => item.id),
		};
	}, [id]);

	const fetchAllRoles = useCallback(async () => {
		const roles = await getGroups(UserGroupType.Role);

		return roles
			.sort((a, b) => a.title.localeCompare(b.title))
			.filter((x) => !x.parent)
			.map((x) => buildGroupNode(x, roles));
	}, []);

	const fetchAllGroups = useCallback(async () => {
		const groups = await getGroups(UserGroupType.Group);
		return groups
			.sort((a, b) => a.title.localeCompare(b.title))
			.map((group) => ({ id: group.id, title: group.title, children: [] }));
	}, []);

	useEffect(() => {
		(async () => {
			try {
				await Promise.all([
					await (async () => {
						const memberships = await fetchMemberships();
						setValue("roles", memberships.roles);
						setValue("groups", memberships.groups);
					})(),
					await (async () => {
						const roles = await fetchAllRoles();
						setRoles(roles);
					})(),
					await (async () => {
						setGroupOptions(await fetchAllGroups());
					})(),
				]);
			} catch (err) {
				router.replace(getDynamicUrl("/dashboard/admin/users"));
			} finally {
				setLoading(false);
			}
		})();
	}, [router, fetchAllGroups, fetchAllRoles, fetchMemberships, setValue]);

	if (isLoading) {
		return <Loading size="sm">در حال دریافت اطلاعات...</Loading>;
	}

	if (!fields["roles"] || !fields["groups"] || !roles || !groupOptions) {
		return <></>;
	}

	return (
		<>
			<FormProvider {...form}>
				<form
					className="w-1/2 min-w-[40rem] space-y-6"
						onSubmit={handleSubmit(async (data) => {
						try {
							await updateUserGroups({
								userId: id,
								groupType: "role",
								groups: data.roles,
							});
							await updateUserGroups({
								userId: id,
								groupType: "group",
								groups: data.groups,
							});

							reset({ roles: data.roles, groups: data.groups });
						} catch (err) {
							setError("root.server", { message: "Something went wrong..." });
						}
					})}
				>
					<Head.Root>
						<Head.Title>نقش های کاربر</Head.Title>
					</Head.Root>

					{isSubmitSuccessful && (
						<Alert variant="info">
							<AlertDescription>
								نقش‌ها و گروه‌های کاربر با موفقیت بروزرسانی گردید.
							</AlertDescription>
						</Alert>
					)}

					<div>
						{roles.map((role) => (
							<GroupNode
								key={role.id}
								node={role}
								selected={fields["roles"]}
								onSelect={(id) => {
									setValue(
										"roles",
										(() => {
											if (!fields["roles"]) {
												return [id];
											}

											if (!fields["roles"].find((x) => x === id)) {
												return [...fields["roles"], id];
											}

											return [...fields["roles"].filter((x) => x !== id)];
										})(),
										{ shouldDirty: true, shouldTouch: true },
									);
								}}
							/>
						))}
					</div>

					<Head.Root>
						<Head.Title>گروه‌ها</Head.Title>
					</Head.Root>
					<p className="text-sm text-muted-foreground">
						عضویت در گروه‌هایی که از قبل در تب گروه‌ها ساخته شده‌اند.
					</p>
					<div>
						{groupOptions.length === 0 ? (
							<p className="text-sm text-muted-foreground">گروهی ثبت نشده است.</p>
						) : (
							groupOptions.map((group) => (
								<GroupNode
									key={group.id}
									node={group}
									selected={fields["groups"]}
									onSelect={(groupId) => {
										setValue(
											"groups",
											fields["groups"].includes(groupId)
												? fields["groups"].filter((item) => item !== groupId)
												: [...fields["groups"], groupId],
											{ shouldDirty: true, shouldTouch: true },
										);
									}}
								/>
							))
						)}
					</div>

					<Button
						className="w-36"
						disabled={!isDirty || isSubmitting}
						size="sm"
					>
						{isSubmitting ? (
							<Loading intent="white" size="xs" />
						) : isSubmitSuccessful && !isDirty ? (
							"بروزرسانی شد!"
						) : (
							"بروزرسانی"
						)}
					</Button>
				</form>
			</FormProvider>
		</>
	);
}

function GroupNode({
	node,
	selected,
	onSelect,
}: {
	node: UserGroupNode;
	selected: string[];
	onSelect: (id: string) => void;
}) {
	return (
		<>
			<div key={node.id}>
				<div className="flex items-center px-2 py-1">
					<FaSquare className="text-[.375rem]" />
					<span
						className={twMerge(
							"ms-2 cursor-pointer rounded-lg px-2 py-0.5 transition",
							selected.indexOf(node.id) !== -1 && "bg-teal-500 text-white",
						)}
						onClick={() => {
							onSelect(node.id);
						}}
					>
						{node.title}
					</span>
				</div>

				{node.children.length !== 0 && (
					<div className="my-2 ms-2 border-s-4 border-gray-200 px-6">
						{node.children.map((x) => (
							<GroupNode
								key={x.id}
								node={x}
								selected={selected}
								onSelect={onSelect}
							/>
						))}
					</div>
				)}
			</div>
		</>
	);
}

function buildGroupNode(group: UserGroup, groups: UserGroup[]) {
	const node = { id: group.id, title: group.title } as UserGroupNode;
	node.children = groups
		.filter((x) => x.parent === group.id)
		.map((x) => buildGroupNode(x, groups));

	return node;
}
