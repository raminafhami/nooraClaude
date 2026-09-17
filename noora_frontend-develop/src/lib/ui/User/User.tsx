"use client";

import Image from "next/image";
import { useContext, useEffect, useState } from "react";

import DashboardContext from "@/app/dashboard/_module/DashboardContext";
import avatar from "@/assets/images/avatar.svg";
import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import { DynamicLink } from "@/components/ui/dynamic-link";
import { Skeleton } from "@/components/ui/skeleton";
import GetAllUserDocuments from "@/identity/userDocuments/services/getAllUserDocuments";
import GetUserDocumentsFile from "@/identity/userDocuments/services/getUserDocumentsFile";

export function User() {
	const { identity } = useLoggedInUser();

	const [isLoading, setLoading] = useState<boolean>(true);

	const [userAvatar, setUserAvatar] = useState(avatar);
	const { userAvatarChange, setUserAvatarChange } =
		useContext(DashboardContext);

	useEffect(() => {
		(async () => {
			try {
				setLoading(true);

				let userDocs = await GetAllUserDocuments({
					userId: identity.id,
					page: 0,
					size: 99,
					key: "avatar",
				});

				if (userDocs) {
					let inspectorFile = await GetUserDocumentsFile({
						fileId: userDocs[0].id,
					});

					if (inspectorFile) {
						const files = new File([inspectorFile], "Avatar", {
							type: inspectorFile.type,
						});

						const reader = new FileReader();

						reader.onloadend = () => {
							const dataURL = reader.result;
							localStorage.setItem("userAvatar", dataURL as string);
							setUserAvatar(dataURL);
							setLoading(false);
						};

						reader.readAsDataURL(files);
					}
				}
			} catch {
				setUserAvatar(avatar);
				setLoading(false);
			} finally {
				setUserAvatarChange(false);
			}
		})();
	}, [identity.id, setUserAvatarChange, userAvatarChange]);

	return (
		<div className="relative -mt-0.5 hidden w-[55px] shrink-0 items-end gap-3 sm:flex">
			<div className="">
				<DynamicLink href="/dashboard/profile">
					{isLoading ? (
						<Skeleton className="size-14 p-0.5" />
					) : (
						<Image
							draggable={false}
							className="clip-hexagon h-[55px] !w-[55px] border border-[#355E7C] bg-white"
							src={userAvatar}
							alt="avatar"
							width={60}
							height={60}
						/>
					)}
				</DynamicLink>
			</div>
		</div>
	);
}
