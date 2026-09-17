"use client";

import { memo, useCallback, useEffect, useState } from "react";
import { FaRotate, FaTrash } from "react-icons/fa6";

import { AlertDescription } from "@/components/ui/alert";
import { DestructiveAlert } from "@/components/ui/alert/destructive-alert";
import { Button } from "@/components/ui/button";
import { User } from "@/identity/users/models/User";
import { getUsers } from "@/identity/users/services/getUsers";
import { UserService } from "@/identity/users/services/UserService";
import { Head } from "@/ui/Head";
import { Loading } from "@/ui/Loader";
import { Panel } from "@/ui/Panel";
import { Table } from "@/ui/Table";

import { useGroupContext } from "../GroupContext";

export const UsersTable = memo(function UsersTable(): React.ReactNode {
	const { group, users, onUsersUpdate } = useGroupContext();

	const [isLoading, setLoading] = useState<boolean>(!users);
	const [error, setError] = useState<string | null>(null);

	const handleUsersLoad = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);

			const usersInGroup = await getUsers({
				filters: { groups: group.id },
			});

			onUsersUpdate(usersInGroup);
		} catch (err: any) {
			setError(err?.message || "خطایی در دریافت اطلاعات رخ داد.");
		} finally {
			setLoading(false);
		}
	}, [group.id, onUsersUpdate]);

	const handleUserRemove = useCallback(
		async (user: User) => {
			await UserService.update(user.id, {
				groups: [...(user.groups as string[]).filter((x) => x !== group.id)],
			});

			onUsersUpdate([...(users?.filter((x) => x.id !== user.id) || [])]);
		},
		[group, users, onUsersUpdate],
	);

	useEffect(() => {
		if (!users) {
			handleUsersLoad();
		}
	}, [users, handleUsersLoad]);

	return (
		<div className="space-y-10">
			<Head.Root className="gap-x-2">
				<Head.Title text="لیست افراد">
					{((users && users.length > 0) || error) && (
						<>
							<Button
								className="w-fit"
								disabled={isLoading}
								variant="link"
								onClick={handleUsersLoad}
							>
								{isLoading ? (
									<Loading horizontalPlacement="center" size="sm" />
								) : (
									<FaRotate />
								)}
							</Button>
						</>
					)}
				</Head.Title>
			</Head.Root>

			{users && (users.length > 0 || (!isLoading && !error)) ? (
				<Panel.Root>
					<Table.Root>
						<Table.Head>
							<Table.Row className="bg-gray-100 text-right">
								<Table.Cell as="th" className="w-20"></Table.Cell>
								<Table.Cell as="th" className="w-14">
									ردیف
								</Table.Cell>
								<Table.Cell as="th" className="w-56">
									نام
								</Table.Cell>
								<Table.Cell as="th"></Table.Cell>
							</Table.Row>
						</Table.Head>
						<Table.Body>
							{users.length > 0 ? (
								users.map((user: User, index: number) => (
									<Table.Row key={group.id}>
										<Table.Cell>
											<Table.Actions>
												<Table.Action
													title="Remove person from group"
													onClick={async () => {
														await handleUserRemove(user);
													}}
												>
													<FaTrash />
												</Table.Action>
											</Table.Actions>
										</Table.Cell>
										<Table.Cell className="text-center">{index + 1}</Table.Cell>
										<Table.Cell>{user.fullname}</Table.Cell>
										<Table.Cell></Table.Cell>
									</Table.Row>
								))
							) : (
								<Table.Row key="empty">
									<Table.Cell></Table.Cell>
									<Table.Cell colSpan={100}>
										کاربری در این گروه یافت نشد.
									</Table.Cell>
								</Table.Row>
							)}
						</Table.Body>
					</Table.Root>
				</Panel.Root>
			) : error ? (
				<DestructiveAlert>
					<AlertDescription>{error}</AlertDescription>
				</DestructiveAlert>
			) : (
				<Loading size="sm" verticalPlacement="start">
					در حال دریافت اطلاعات...
				</Loading>
			)}
		</div>
	);
});
