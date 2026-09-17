"use client";

import { useId, useState } from "react";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { SelectItemType } from "@/types/SelectItem";

type Mode = "";

const modeOptions: SelectItemType<Mode>[] = [];

export function EditsPage() {
	const [mode, setMode] = useState<Mode>();

	return (
		<div className="space-y-8">
			<EditOperationSelect value={mode} onChange={setMode} />

			{/* <div>{mode === "casetype" ? <CaseTypeEditPage /> : <></>}</div> */}
		</div>
	);
}

function EditOperationSelect({
	value,
	onChange,
}: {
	value: Mode | undefined;
	onChange: (value: Mode | undefined) => void;
}) {
	const id = useId();

	return (
		<div className="max-w-64 space-y-2">
			<label htmlFor={id}>عملیات:</label>
			<Select
				value={value ?? ""}
				onValueChange={(value: Mode) => onChange(value || undefined)}
			>
				<SelectTrigger>
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					{modeOptions.map((x) => (
						<SelectItem key={x.value} value={x.value}>
							{x.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
}
