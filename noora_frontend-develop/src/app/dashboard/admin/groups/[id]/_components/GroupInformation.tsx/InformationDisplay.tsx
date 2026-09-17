"use client";

import { memo, useCallback, useEffect, useState } from "react";
import { FaExclamationTriangle } from "react-icons/fa";
import { FaPencil } from "react-icons/fa6";

import { Button } from "@/components/ui/button";
import { getUsers } from "@/identity/users/services/getUsers";
import { Loading } from "@/ui/Loader";

import { useGroupContext } from "../GroupContext";

interface Props {
	onInformationEdit: () => void;
}

export const InformationDisplay = memo(function InformationDisplay({
	onInformationEdit,
}: Props): React.ReactNode {
	const { group, users, onUsersUpdate } = useGroupContext();

	const [isUsersLoading, setUsersLoading] = useState<boolean>(!users);

	const handleUsersLoad = useCallback(async () => {
		try {
			setUsersLoading(true);

			const usersInGroup = await getUsers({
				filters: { groups: group.id },
			});

			onUsersUpdate(usersInGroup);
		} catch (err: any) {
		} finally {
			setUsersLoading(false);
		}
	}, [group.id, onUsersUpdate]);

	useEffect(() => {
		if (!users) {
			handleUsersLoad();
		}
	}, [users, handleUsersLoad]);

	return (
		<div className="space-y-10">
			<div className="space-y-4">
				<div className="flex h-10 items-center">
					<div className="shrink-0 basis-32">عنوان:</div>
					<div>{group.title}</div>
				</div>

				<div className="flex h-10 items-center">
					<div className="shrink-0 basis-32">کلیدواژه:</div>
					<div>{group.name}</div>
				</div>

				<div className="flex h-10 items-center">
					<div className="shrink-0 basis-32">تعداد افراد گروه:</div>
					<div>
						{users ? (
							`${users.length} نفر`
						) : isUsersLoading ? (
							<Loading size="sm" />
						) : (
							<FaExclamationTriangle />
						)}
					</div>
				</div>
			</div>

			<div>
				<Button type="button" onClick={() => onInformationEdit()}>
					ویرایش اطلاعات
				</Button>
			</div>
		</div>
	);
});
