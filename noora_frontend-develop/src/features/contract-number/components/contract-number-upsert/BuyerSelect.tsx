"use client";

import { useCallback, useEffect, useState } from "react";
import { FaCheck, FaX } from "react-icons/fa6";
import { toast } from "sonner";
import { useDebounce } from "use-debounce";

import { BuyerApi } from "@/buyers/models/BuyerApi";
import { getRawBuyers } from "@/buyers/services/getRawBuyers";
import { searchBuyerName } from "@/buyers/utils/searchBuyerName";
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
import { cn } from "@/lib/utils";

function BuyerSelect<
	T extends Pick<BuyerApi, "id" | "name"> & { metadata: { nameEn: string } },
>({
	disabled,
	value,
	onChange,
}: {
	disabled?: boolean;
	value: T | null | undefined;
	onChange: (value: BuyerApi | null) => void;
}) {
	const [isOpen, setIsOpen] = useState<boolean>(false);

	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [searchTerm, setSearchTerm] = useState<string>("");
	const [debouncedSearchTerm] = useDebounce(searchTerm, 500);

	const [items, setItems] = useState<BuyerApi[]>();

	const handleSelect = useCallback(
		(_: unknown, buyer: BuyerApi) => {
			onChange(buyer);
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

				const buyers = await getRawBuyers({
					filters: {
						isDeleted: false,
						...searchBuyerName(debouncedSearchTerm),
					},
					pagination: { page: 0, pageSize: 100 },
				});

				setItems(buyers.items);
			} catch (err) {
				console.error(err);
				toast.error("خطای نامشخصی در هنگام دریافت اطلاعات خریداران رخ داد.");
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
				className={cn(inputClasses, "flex w-full")}
				disabled={disabled}
				onClick={(event) => {
					if (disabled) {
						event.preventDefault();
					}
				}}
			>
				<div className="truncate">
					{value?.name.trim() || value?.metadata.nameEn?.trim() || ""}
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
						placeholder="جستجوی نام خریدار"
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

								{items?.map((buyer) => (
									<CommandItem
										key={buyer.id}
										className="cursor-pointer rounded-none"
										value={buyer.id}
										onSelect={handleSelect.bind(null, undefined, buyer)}
									>
										<div className="w-4">
											{value?.id === buyer.id && <FaCheck />}
										</div>

										<div className="space-y-1">
											<div>{buyer.name.trim() || buyer.metadata.nameEn}</div>
											{buyer.name.trim() && buyer.metadata.nameEn.trim() && (
												<div className="text-xs text-muted-foreground">
													{buyer.metadata.nameEn}
												</div>
											)}
										</div>
									</CommandItem>
								))}
							</>
						)}
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}

export { BuyerSelect };
