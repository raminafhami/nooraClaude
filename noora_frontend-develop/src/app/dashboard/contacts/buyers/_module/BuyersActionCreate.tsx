"use client";

import { useState } from "react";
import { FaPlus } from "react-icons/fa6";

import { BuyerCreateDialog } from "@/buyers/components/BuyerCreate/BuyerCreateDialog";
import { Button } from "@/components/ui/button";

function BuyersActionCreate({ onChange }: { onChange: () => void }) {
	const [open, setOpen] = useState<boolean>(false);

	return (
		<>
			<Button variant="primary" onClick={() => setOpen(true)}>
				<FaPlus />
				افزودن خریدار جدید
			</Button>

			<BuyerCreateDialog
				open={open}
				onCreate={onChange}
				onClose={() => {
					setOpen(false);
				}}
			/>
		</>
	);
}

export { BuyersActionCreate };
