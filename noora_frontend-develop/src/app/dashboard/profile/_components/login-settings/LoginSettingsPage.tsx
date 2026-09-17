"use client";

import { useEffect, useState } from "react";

import { Spinner } from "@/components/ui/spinner";
import { User } from "@/identity/users/models/User";
import getActiveUser from "@/identity/users/services/getActiveUser";

import { LoginTypeForm } from "./LoginTypeForm";
import { PasswordEditForm } from "./PasswordEditForm";

function LoginSettingsPage() {
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [user, setUser] = useState<User>();

	useEffect(() => {
		const fetchData = async () => {
			try {
				setIsLoading(true);

				const user = await getActiveUser();

				setUser(user);
			} catch (err) {
				console.error(err);
			} finally {
				setIsLoading(false);
			}
		};

		fetchData();
	}, []);

	if (isLoading) {
		return <Spinner label="در حال دریافت اطلاعات..." size="sm" />;
	}

	if (!user) {
		return null;
	}

	return (
		<div className="space-y-12">
			<LoginTypeForm user={user} />

			<PasswordEditForm />
		</div>
	);
}

export { LoginSettingsPage };
