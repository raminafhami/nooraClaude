"use client";

import { useCallback, useEffect, useState } from "react";

import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import { PersonnelInfo } from "@/hrm/personnel/components/personnel-info/PersonnelInfo";
import { Personnel } from "@/hrm/personnel/models/Personnel";
import { User } from "@/identity/users/models/User";
import { UserType } from "@/identity/users/models/UserType";
import getUserById from "@/identity/users/services/getUserById";
import { Loading } from "@/ui/Loader";

function ProfileInformation() {
	const { identity } = useLoggedInUser();

	const [isLoading, setLoading] = useState<boolean>(true);
	const [user, setUser] = useState<User>();
	const [personnel, setPersonnel] = useState<Personnel>();

	const personnelQueryFn = useCallback(async () => {
		if (identity.type !== UserType.Personnel) {
			setLoading(false);
			return;
		}

		const user = await getUserById(identity.id);

		setUser(user);
		setPersonnel(user.personnel?.[0]);

		setLoading(false);
	}, [identity.id, identity.type]);

	useEffect(() => {
		personnelQueryFn();
	}, [personnelQueryFn]);

	if (isLoading) {
		return <Loading size="sm">در حال دریافت اطلاعات...</Loading>;
	}

	if (!user) {
		return <></>;
	}

	return (
		<PersonnelInfo
			parentPath="profile"
			user={user}
			personnel={personnel}
			onChange={personnelQueryFn}
		/>
	);
}

export { ProfileInformation };
