"use client";

import { forwardRef, useCallback, useEffect, useMemo, useState } from "react";
import { FaCheck, FaX } from "react-icons/fa6";
import { toast } from "sonner";
import { useDebounce } from "use-debounce";

import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandLoading,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

import { UserLookup } from "../models/UserLookup";
import { UserQueryFilter } from "../models/UserQuery";
import { UserType } from "../models/UserType";
import { getUsers } from "../services/getUsers";
import searchUserFullname from "../utils/searchUserFullname";

type UserLookupSelectProps = {
	disabled?: boolean;
	id?: string;
	placeholder?: string;
	mode?: "branchCustomerOrPersonnel";
	type?: UserType;
	value: UserLookup | null | undefined;
	onValueChange: (value: UserLookup | null) => void;
};

const UserLookupSelect = forwardRef<HTMLInputElement, UserLookupSelectProps>(
	({ disabled, id, placeholder, mode, type, value, onValueChange }, ref) => {
		const { identity } = useLoggedInUser();

		const [isOpen, setIsOpen] = useState<boolean>(false);
		const [isPending, setIsPending] = useState<boolean>(false);
		const [searchTerm, setSearchTerm] = useState<string>("");
		const [debouncedValue] = useDebounce(searchTerm, 500);
		const [users, setUsers] = useState<UserLookup[]>();

		const removable = useMemo(() => !disabled && value, [disabled, value]);

		const handleSelect = useCallback(
			(_: unknown, value: UserLookup) => {
				onValueChange(value);
				setSearchTerm("");
				setIsOpen(false);
			},
			[onValueChange],
		);

		useEffect(() => {
			(async () => {
				if (!debouncedValue) {
					setUsers(undefined);
					return;
				}

				try {
					setIsPending(true);

					const filters: UserQueryFilter = {
						$and: [{ $or: [searchUserFullname(debouncedValue)] }],
					};

					const typeFilter: UserQueryFilter[] = [
						{ type: { $ne: UserType.System } },
					];

					if (mode === "branchCustomerOrPersonnel") {
						filters.$and = [
							...(filters.$and ?? []),
							{
								$or: [
									{ type: UserType.Personnel },
									{ type: UserType.Public, branchId: identity.branchId },
								],
							},
						];
					} else {
						if (type) {
							typeFilter.push({ type });
						}
					}

					filters.$and = [...(filters.$and ?? []), ...typeFilter];

					const users = await getUsers({
						filters,
						pagination: { page: 0, pageSize: 100 },
					});

					setUsers(users.items.map((x) => ({ id: x.id, name: x.fullname })));
				} catch (err) {
					console.error(err);
					toast.error("خطای نامشخصی در هنگام دریافت اطلاعات کاربران رخ داد.");
				} finally {
					setIsPending(false);
				}
			})();
		}, [debouncedValue, identity, mode, type]);

		return (
			<div className="relative">
				<Popover open={isOpen} onOpenChange={setIsOpen}>
					<PopoverTrigger asChild>
						<Input
							ref={ref}
							className={cn(
								"text-start",
								removable && "pe-16",
								!value?.name && "text-muted-foreground",
							)}
							disabled={disabled}
							id={id}
							value={value?.name || placeholder || ""}
						/>
					</PopoverTrigger>
					<PopoverContent align="start" className="w-full p-0">
						<Command shouldFilter={false}>
							<CommandInput
								value={searchTerm}
								slotProps={{
									root: { className: cn(!users && "border-b-0") },
								}}
								onValueChange={setSearchTerm}
							/>
							{debouncedValue && (
								<CommandList className="py-1">
									{isPending && (
										<CommandLoading>در حال جستجو...</CommandLoading>
									)}
									{users && <CommandEmpty>هیچ موردی یافت نشد.</CommandEmpty>}
									<CommandGroup>
										{users?.map((user) => (
											<CommandItem
												className="rounded-none"
												value={user.id}
												key={user.id}
												onSelect={handleSelect.bind(null, undefined, user)}
											>
												<div className="w-4">
													{user.id === value?.id && <FaCheck />}
												</div>
												<span>{user.name}</span>
											</CommandItem>
										))}
									</CommandGroup>
								</CommandList>
							)}
						</Command>
					</PopoverContent>
				</Popover>

				{removable && (
					<div
						className="absolute bottom-0 end-0 top-0 mx-3 flex cursor-pointer items-center justify-center px-1 opacity-50"
						onClick={(event) => {
							event.stopPropagation();
							onValueChange(null);
						}}
					>
						<FaX className="text-2xs text-inherit" />
					</div>
				)}
			</div>
		);
	},
);
UserLookupSelect.displayName = "UserLookupSelect";

export { UserLookupSelect };
