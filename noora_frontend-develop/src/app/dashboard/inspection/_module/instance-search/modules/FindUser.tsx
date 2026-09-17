import { Check, ChevronsUpDown } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandItem,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { UserQueryFilter } from "@/identity/users/models/UserQuery";
import { UserType } from "@/identity/users/models/UserType";
import { getUsers } from "@/identity/users/services/getUsers";
import searchUserFullname from "@/identity/users/utils/searchUserFullname";
import { cn } from "@/lib/utils";
import { ObjectType } from "@/utils/object/ObjectType";

import { UserLookup } from "./UserLookup";

interface FindUserProps {
	user: UserLookup | undefined;
	setUser: (data: UserLookup | undefined) => void;
	type?: UserType;
	disabled?: boolean;
}

export default function FindUser({
	user,
	setUser,
	type,
	disabled,
}: FindUserProps) {
	const [open, setOpen] = useState<boolean>(false);
	const [searchTerm, setSearchTerm] = useState<string>("");
	const [users, setUsers] = useState<UserLookup[]>([]);

	useEffect(() => {
		(async () => {
			if (!searchTerm) {
				setUsers([]);
				return;
			}

			const filters: Partial<UserQueryFilter> = {
				...searchUserFullname(searchTerm),
			};

			const typeFilter: ObjectType[] = [{ type: { $ne: UserType.System } }];
			if (type) {
				typeFilter.push({ type });
			}

			filters.$and = typeFilter;

			try {
				const users = await getUsers({
					filters,
					pagination: {
						page: 0,
						pageSize: 100,
					},
				});

				setUsers(users.items.map((x) => ({ id: x.id, name: x.fullname })));
			} catch (err) {
				console.error(err);
			}
		})();
	}, [searchTerm, type]);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild disabled={disabled} className="w-[30%]">
				<Button
					aria-expanded={open}
					className="group relative h-[40px] w-full max-w-[400px] items-center justify-between text-ellipsis rounded-2xl border-2 bg-white px-2 py-2 pl-[2.8rem] pr-[.5rem] text-[.9rem] placeholder-gray-400 focus:border-blue-500 focus:text-black focus:outline-0"
					role="combobox"
					variant="outline"
				>
					{user?.name || "جستجو"}
					<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[200px] p-0">
				<Command>
					<Input
						dir="rtl"
						placeholder="جستجو"
						onChange={(event) => setSearchTerm(event.target.value)}
					/>
					<CommandEmpty>یافت نشد...</CommandEmpty>
					<CommandGroup className="max-h-[27rem] overflow-y-auto">
						{users.map((value) => (
							<CommandItem
								key={value.id}
								value={value.id}
								onSelect={() => {
									setUser(value !== user ? value : undefined);
									setOpen(false);
								}}
							>
								<Check
									className={cn(
										"mr-2 h-4 w-4",
										value === user ? "opacity-100" : "opacity-0",
									)}
								/>
								{value.name}
							</CommandItem>
						))}
					</CommandGroup>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
