"use client";

import { useCallback, useEffect, useState } from "react";

import {
	Card,
	CardContent,
	CardHeader,
	CardNav,
	CardTitle,
} from "@/components/ui/card";
import { UserLookupSelect } from "@/identity/users/components/UserLookupSelect";
import { User } from "@/identity/users/models/User";
import { UserLookup } from "@/identity/users/models/UserLookup";
import { UserType } from "@/identity/users/models/UserType";
import getUserById from "@/identity/users/services/getUserById";
import { getUsers } from "@/identity/users/services/getUsers";
import { asNavigationProp } from "@/utils/asNavigationProp";

import { SvgBorder } from "./SvgBorder";

const PersonnelContactList = () => {
	const [searchUser, setSearchUser] = useState<UserLookup>();
	const [personnel, setPerssonel] = useState<User>();
	const [firstFourUsers, setFirstFourUsers] = useState<User[]>([]);

	useEffect(() => {
		const getFirstFourUserWithImage = async () => {
			const res = await getUsers({
				pagination: { page: 0, pageSize: 10 },
				populate: ["userFiles"],
			});
			setFirstFourUsers(res.items.filter((x) => x.image).slice(0, 4));
			setPerssonel(res.items.filter((x) => x.image).slice(0, 4)[0]);
		};
		getFirstFourUserWithImage();
	}, []);

	const findPersonnel = useCallback(async () => {
		if (!searchUser?.id) return;

		try {
			const res = await getUserById(searchUser?.id);

			setPerssonel(res);
		} catch (err) {
			console.error(err);
		}
	}, [searchUser?.id]);

	useEffect(() => {
		if (searchUser) {
			findPersonnel();
		}
	}, [findPersonnel, searchUser]);

	return (
		<Card className="col-span-full border-0 pb-6 shadow-none xl:col-span-4">
			<CardHeader orientation="horizontal">
				<CardTitle>فهرست تماس کارکنان</CardTitle>
				<CardNav>
					<div
						className="relative flex items-center"
						style={{ minWidth: `${firstFourUsers.length * 20 + 50}px` }}
					>
						{firstFourUsers &&
							firstFourUsers.map((user: User, index) => {
								return (
									<div
										key={user.id}
										className="absolute h-[55px] w-[55px]"
										style={{
											left: `${index * 34}px`,
											zIndex: firstFourUsers.length + index,
										}}
									>
										<SvgBorder
											strokeColor="#EF9B20"
											strokeWidth="1px"
											url={
												user.image?.id !== ""
													? `/api/users/${user.image?.id}`
													: "/images/avatar.png"
											}
										/>
									</div>
								);
							})}
					</div>
				</CardNav>
			</CardHeader>
			<CardContent className="p-0">
				<div className="flex w-full flex-col gap-y-5 px-7">
					<UserLookupSelect
						placeholder="جستجوی نام پرسنل"
						type={UserType.Personnel}
						value={searchUser}
						onValueChange={(value: any) => {
							setSearchUser(value);
						}}
					/>
					{personnel ? (
						<div className="flex justify-start gap-5 rounded-2xl border border-gray-200 p-2">
							{personnel && (
								<div className="h-[75px] w-[75px]">
									<SvgBorder
										strokeColor="#E5E7EB"
										strokeWidth="0.5px"
										url={
											personnel.image?.id
												? `/api/users/${personnel.image?.id}`
												: "public/images/avatar.png"
										}
									/>
								</div>
							)}

							<div className="flex flex-col gap-y-1">
								<span>
									{personnel?.fullname}
									{personnel.branch &&
										" شعبه " + asNavigationProp(personnel.branch).title}
								</span>
								<span>{personnel?.email}</span>
								<span>
									{personnel.personnel &&
										"داخلی " + personnel.personnel[0]?.internalPhoneNo + " - "}
									{personnel?.phoneNo}
								</span>
							</div>
						</div>
					) : (
						<div className="flex justify-start gap-5 rounded-2xl border border-gray-200 p-2">
							<div className="h-[75px] w-[75px]">
								<SvgBorder
									strokeColor="#E5E7EB"
									strokeWidth="0.5px"
									url={"public/images/avatar.png"}
								/>
							</div>

							<div className="flex flex-col gap-y-1">
								<span>-</span>
								<span>-</span>
								<span>-</span>
							</div>
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
};

export { PersonnelContactList };
