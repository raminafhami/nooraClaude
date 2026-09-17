"use client";

import { Personnel } from "@/hrm/personnel/models/Personnel";
import { UserBankInfoList } from "@/identity/users/components/UserBankInfoList";
import { UserCredit } from "@/identity/users/components/UserCredit";
import { UserInfo } from "@/identity/users/components/UserInfo";
import { User } from "@/identity/users/models/User";

function PersonnelInfo({
	parentPath,
	personnel,
	user,
	onChange,
}: {
	parentPath: string;
	personnel?: Personnel;
	user?: User;
	onChange: () => void;
}) {
	return (
		<div className="grid grid-cols-12 gap-6">
			<div className="col-span-full xl:col-span-4">
				<UserInfo
					parentPath={parentPath}
					user={user}
					personnel={personnel}
					onChange={onChange}
				/>
			</div>

			<div className="col-span-full space-y-5 xl:col-span-8">
				{user ? (
					<>
						<UserBankInfoList id={user?.id} />
						<UserCredit userId={user.id} />
					</>
				) : (
					<>
						<UserBankInfoList id={personnel?.userId ?? ""} />
						<UserCredit userId={personnel?.userId ?? ""} />
					</>
				)}
			</div>
		</div>
	);
}

export { PersonnelInfo };
