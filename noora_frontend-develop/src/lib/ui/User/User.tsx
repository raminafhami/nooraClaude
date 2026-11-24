"use client";

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

	const fallbackAvatar = typeof avatar === "string" ? avatar : avatar.src;
	const [userAvatar, setUserAvatar] = useState(fallbackAvatar);
	const { userAvatarChange, setUserAvatarChange } =
		useContext(DashboardContext);

	useEffect(() => {
		(async () => {
			try {
				setLoading(true);

				const personnelPhotos = await GetAllUserDocuments({
					userId: identity.id,
					page: 0,
					size: 1,
					key: "personnelPhoto",
				});
				const avatars = personnelPhotos?.length
					? []
					: await GetAllUserDocuments({
							userId: identity.id,
							page: 0,
							size: 1,
							key: "avatar",
						});
				const photo = personnelPhotos?.[0] ?? avatars?.[0];

				if (!photo) {
					setUserAvatar(fallbackAvatar);
					return;
				}

				const inspectorFile = await GetUserDocumentsFile({
					fileId: photo.id,
				});

				if (!inspectorFile) {
					setUserAvatar(fallbackAvatar);
					return;
				}

				const dataUrl = await new Promise<string>((resolve, reject) => {
					const reader = new FileReader();
					reader.onloadend = () => resolve(String(reader.result));
					reader.onerror = () => reject(reader.error);
					reader.readAsDataURL(inspectorFile);
				});

				localStorage.setItem("userAvatar", dataUrl);
				setUserAvatar(dataUrl);
			} catch {
				setUserAvatar(fallbackAvatar);
			} finally {
				setLoading(false);
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
						<img
							draggable={false}
							className="clip-hexagon h-[55px] w-[55px] border border-[#355E7C] bg-white object-cover object-center"
							src={userAvatar}
							alt="avatar"
							width={55}
							height={55}
						/>
					)}
				</DynamicLink>
			</div>
		</div>
	);
}
