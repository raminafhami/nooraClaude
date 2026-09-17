"use client";

import { forwardRef, useCallback, useEffect, useMemo, useState } from "react";
import { FaCheck, FaX } from "react-icons/fa6";
import { toast } from "sonner";
import { useDebounce } from "use-debounce";

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
import { UserApi } from "@/identity/users/models/User";
import { UserQueryFilter } from "@/identity/users/models/UserQuery";
import { UserType } from "@/identity/users/models/UserType";
import { getRawUsers } from "@/identity/users/services/getRawUsers";
import { getUserFullname } from "@/identity/users/utils/getUserFullname";
import searchUserFullname from "@/identity/users/utils/searchUserFullname";
import { cn } from "@/lib/utils";

import { UserInformation } from "../../models/UserInformation";

type UserSelectProps = {
	disabled?: boolean;
	placeholder?: string;
	value: Partial<UserInformation> | null | undefined;
	onValueChange: (value: UserApi | null) => void;
};

const UserSelect = forwardRef<HTMLInputElement, UserSelectProps>(
	({ disabled, placeholder, value, onValueChange }, ref) => {
		const [isOpen, setIsOpen] = useState<boolean>(false);
		const [isPending, setIsPending] = useState<boolean>(false);
		const [searchTerm, setSearchTerm] = useState<string>("");
		const [debouncedValue] = useDebounce(searchTerm, 500);
		const [users, setUsers] = useState<UserApi[]>();

		const removable = useMemo(() => !disabled && value?.id, [disabled, value]);

		const handleSelect = useCallback(
			(_: unknown, value: UserApi) => {
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
						$or: [searchUserFullname(debouncedValue)],
					};

					const typeFilter: UserQueryFilter[] = [
						{ type: { $ne: UserType.System } },
					];

					filters.$and = [...(filters.$and ?? []), ...typeFilter];

					const users = await getRawUsers({
						filters,
						pagination: { page: 0, pageSize: 100 },
					});

					setUsers(users.items);
				} catch (err) {
					console.error(err);
					toast.error("خطای نامشخصی در هنگام دریافت اطلاعات کاربران رخ داد.");
				} finally {
					setIsPending(false);
				}
			})();
		}, [debouncedValue]);

		return (
			<div className="relative">
				<Popover open={isOpen} onOpenChange={setIsOpen}>
					<PopoverTrigger asChild>
						<Input
							ref={ref}
							className={cn(
								"text-start",
								removable && "pe-16",
								!value?.id && "text-muted-foreground",
							)}
							value={getUserFullname(value) || placeholder || ""}
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
												<span>{getUserFullname(user)}</span>
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
UserSelect.displayName = "UserSelect";

export { UserSelect };
