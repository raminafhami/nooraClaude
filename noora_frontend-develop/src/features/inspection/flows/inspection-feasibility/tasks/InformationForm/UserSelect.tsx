"use client";

import { forwardRef, useCallback, useEffect, useState } from "react";
import { FaCheck, FaX } from "react-icons/fa6";
import { toast } from "sonner";
import { useDebounce } from "use-debounce";

import {
	Command,
	CommandEmpty,
	CommandInput,
	CommandItem,
	CommandList,
	CommandLoading,
} from "@/components/ui/command";
import { inputClasses } from "@/components/ui/input";
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

const UserSelect = forwardRef(function UserSelect<
	T extends Pick<UserApi, "id" | "name" | "lastname">,
>(
	{
		disabled,
		placeholder,
		value,
		onChange,
	}: {
		disabled?: boolean;
		placeholder?: string;
		value: T | null | undefined;
		onChange: (value: UserApi | null) => void;
	},
	ref: React.ForwardedRef<HTMLButtonElement>,
) {
	const [isOpen, setIsOpen] = useState<boolean>(false);

	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [searchTerm, setSearchTerm] = useState<string>("");
	const [debouncedSearchTerm] = useDebounce(searchTerm, 500);

	const [items, setItems] = useState<UserApi[]>();

	const handleSelect = useCallback(
		(_: unknown, value: UserApi) => {
			onChange(value);
			setIsOpen(false);
		},
		[onChange],
	);

	useEffect(() => {
		(async () => {
			if (!debouncedSearchTerm) {
				setItems(undefined);
				return;
			}

			try {
				setIsLoading(true);

				const filters: UserQueryFilter = {
					$or: [searchUserFullname(debouncedSearchTerm)],
				};

				const typeFilter: UserQueryFilter[] = [
					{ type: { $ne: UserType.System } },
				];

				filters.$and = [...(filters.$and ?? []), ...typeFilter];

				const users = await getRawUsers({
					filters,
					pagination: { page: 0, pageSize: 100 },
				});

				setItems(users.items);
			} catch (err) {
				console.error(err);
				toast.error("خطای نامشخصی در هنگام دریافت اطلاعات رخ داد.");
			} finally {
				setIsLoading(false);
			}
		})();
	}, [debouncedSearchTerm]);

	useEffect(() => {
		if (!isOpen) {
			setSearchTerm("");
		}
	}, [isOpen]);

	return (
		<Popover open={isOpen} onOpenChange={setIsOpen}>
			<PopoverTrigger
				ref={ref}
				className={cn(inputClasses, "flex w-full")}
				disabled={disabled}
				onClick={(event) => {
					if (disabled) {
						event.preventDefault();
					}
				}}
			>
				<div className="truncate">
					{getUserFullname(value) || placeholder || ""}
				</div>

				{!!value && !disabled && (
					<div
						className="ms-auto flex h-full w-4 cursor-pointer items-center justify-center text-muted-foreground"
						onClick={(event) => {
							event.preventDefault();
							onChange(null);
						}}
					>
						<FaX size={10} />
					</div>
				)}
			</PopoverTrigger>

			<PopoverContent className="p-0">
				<Command shouldFilter={false}>
					<CommandInput
						placeholder="جستجوی نام"
						value={searchTerm}
						slotProps={{
							root: { className: cn(!items && !isLoading && "border-b-0") },
						}}
						onValueChange={setSearchTerm}
					/>

					<CommandList className={cn(items?.length && "py-2")}>
						{debouncedSearchTerm && (
							<>
								{isLoading && <CommandLoading>در حال جستجو...</CommandLoading>}

								<CommandEmpty>هیچ موردی یافت نشد.</CommandEmpty>

								{items?.map((user) => (
									<CommandItem
										key={user.id}
										className="cursor-pointer rounded-none"
										value={user.id}
										onSelect={handleSelect.bind(null, undefined, user)}
									>
										<div className="w-4">
											{user.id === value?.id && <FaCheck />}
										</div>
										<span>{getUserFullname(user)}</span>
									</CommandItem>
								))}
							</>
						)}
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
});
UserSelect.displayName = "UserSelect";

export { UserSelect };
