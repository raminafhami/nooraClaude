"use client";

import { useCallback, useMemo, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";

import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import { BuyerCreateDialog } from "@/buyers/components/BuyerCreate/BuyerCreateDialog";
import { Buyer } from "@/buyers/models/Buyer";
import { BuyerQueryFilter } from "@/buyers/models/BuyerQuery";
import { getBuyers } from "@/buyers/services/getBuyers";
import { searchBuyerName } from "@/buyers/utils/searchBuyerName";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/form/FieldError";
import { SelectDynamic } from "@/form/select/SelectDynamic";
import { messages } from "@/messages";
import { compareById } from "@/utils/Comparators";

interface Props {
	disabled?: boolean;
	required?: boolean;
}

function BuyerSelect({ disabled, required = true }: Props) {
	const { identity } = useLoggedInUser();

	const [open, setOpen] = useState<boolean>(false);
	const handleClose = useCallback(() => {
		setOpen(false);
	}, []);

	const { control, setValue, watch } = useFormContext();

	const fields = watch();

	const filters = useMemo<BuyerQueryFilter>(() => {
		const filters: BuyerQueryFilter = {
			isDeleted: false,
		};

		if (identity.branchId) {
			filters.branches = identity.branchId;
		}

		return filters;
	}, [identity.branchId]);

	return (
		<>
			<div className="col-span-full !col-start-1 space-y-2 xs:col-span-9 sm:col-span-7 md:col-span-5 xl:col-span-3">
				<label htmlFor="Buyer">خریدار:</label>
				<Controller
					control={control}
					name="Buyer"
					render={({ field: { onBlur, onChange, ...field }, fieldState }) => (
						<>
							<div className="flex gap-x-2">
								<div className="grow">
									<SelectDynamic<Buyer>
										disabled={disabled}
										id={field.name}
										onCompare={compareById}
										onLabel={(v) => v.name}
										onLeave={onBlur}
										onMutate={(v) => {
											onChange(v || null);

											if ("BuyerNameEn" in fields) {
												setValue("BuyerNameEn", v?.nameEn ?? "", {
													shouldDirty: true,
													shouldTouch: true,
													shouldValidate: true,
												});
											}
										}}
										onSearch={async (value) => await loadBuyers(value, filters)}
										{...field}
									/>
								</div>

								{!disabled && (
									<Button
										tabIndex={-1}
										size="lg"
										type="button"
										variant="outline"
										onClick={() => {
											setOpen(true);
										}}
									>
										افزودن
									</Button>
								)}
							</div>
							<FieldError error={fieldState.error} />
						</>
					)}
					rules={{ required: required && messages.validation.required }}
				/>
			</div>

			<BuyerCreateDialog
				open={open}
				onClose={handleClose}
				onCreate={async (buyer) => {
					setValue("Buyer", buyer, {
						shouldDirty: true,
						shouldTouch: true,
						shouldValidate: true,
					});
				}}
			/>
		</>
	);
}

async function loadBuyers(name: string, filters: BuyerQueryFilter) {
	if (!name) {
		return [];
	}

	const buyers = await getBuyers({
		filters: {
			...filters,
			...searchBuyerName(name),
		},
		pagination: { page: 0, pageSize: 100 },
	});

	return buyers.items;
}

export default BuyerSelect;
