import { useEffect, useState } from "react";
import { RxCross2 } from "react-icons/rx";
import { toast } from "sonner";

import { getGroups } from "@/identity/groups/services/getGroups";

interface FindBranchProps {
	branch: Branch;
	setBranch: (branch: Branch | undefined) => void;
}

type Branch = {
	id: string;
	name: string;
	title: string;
	type: "group" | "branch";
};

export default function FindBranch({ branch, setBranch }: FindBranchProps) {
	const [users, setUsers] = useState<Array<Branch> | undefined>();
	const [searchedName, setSearchedName] = useState<string>();

	async function getbranch() {
		let res;
		try {
			res = getGroups(null, {
				filters: [
					{ name: "$or", value: [{ type: "group" }, { type: "branch" }] },
					{ name: "title", type: "search", value: searchedName },
				],
			});
			res.then((res) => {
				setUsers(res as unknown as Branch[]);
			});
		} catch (err) {
			toast.error("خطایی رخ داد!");
		}
	}

	useEffect(() => {
		const delayDebounceFn = setTimeout(() => {
			if (searchedName && searchedName?.length > 1) {
				getbranch();
			} else {
				setUsers(undefined);
			}
		}, 300);
		return () => {
			clearTimeout(delayDebounceFn);
		};
	}, [searchedName]);

	return (
		<div className={`relative flex flex-col ${branch ? "mb-2" : ""}`}>
			<input
				className={`group relative mx-[1rem] mb-[1rem] mt-[1rem] w-[300px] text-ellipsis rounded rounded-2xl border-2 border-white bg-white px-2 py-2 pl-[2.8rem] pr-[.5rem] text-[.9rem] placeholder-gray-400 focus:border-blue-500 focus:text-black focus:outline-0`}
				type="text"
				placeholder="جستجو"
				onChange={(event) =>
					setSearchedName(
						event.target.value.replace(/^\s+/, "").replace(/\s\s+/g, " "),
					)
				}
				value={branch ? `${branch.title}` : searchedName ? searchedName : ""}
				disabled={branch ? true : false}
			/>
			{!branch && users?.length ? (
				<div className="absolute right-[1rem] top-[3.5rem] z-10 mb-[10rem] max-h-[288px] w-[300px] overflow-y-scroll rounded bg-gray-200">
					{users?.map((user, index) => (
						<p
							key={index}
							onClick={() => {
								setBranch(user);
								setUsers(undefined);
							}}
							className="cursor-pointer rounded py-2 pr-3 hover:bg-blue-400 hover:text-white"
						>
							{user.type === "group" ? "گروه" : "شعبه"} {user.title}
						</p>
					))}
				</div>
			) : (
				searchedName &&
				!branch && (
					<span className="absolute bottom-[-.5rem] right-[1.2rem] text-red-600">
						موردی یافت نشد!
					</span>
				)
			)}
			{branch && (
				<span className="mx-[1rem] w-fit rounded-2xl bg-gray-200 p-2">
					{branch.type === "group" ? "گروه" : "شعبه"} {branch?.title}
					<RxCross2
						data-tooltip-id="filterCleaner"
						size={15}
						className="mr-2 inline-flex cursor-pointer hover:text-red-500"
						onClick={() => {
							setBranch(undefined);
							setSearchedName(undefined);
						}}
					/>
				</span>
			)}
		</div>
	);
}
