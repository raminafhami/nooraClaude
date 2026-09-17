"use client";

import { useId, useMemo, useState } from "react";

import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { SelectItemType } from "@/types/SelectItem";

import { GeneralEditPage } from "./general/GeneralEditPage";

type Mode = "general";

const modeOptions: (SelectItemType<Mode> & { groups?: string[] })[] = [
	{
		label: "ویرایش اطلاعات",
		value: "general",
		groups: ["ic-manager"],
	},
];

function EditsPage() {
	const { isAuthorized } = useLoggedInUser();

	const visibleModeOptions = useMemo(
		() =>
			modeOptions.filter(
				(x) =>
					typeof x.groups === "undefined" || isAuthorized({ groups: x.groups }),
			),
		[isAuthorized],
	);

	const [mode, setMode] = useState<Mode>();

	return (
		<div className="space-y-8">
			<EditOperationSelect
				options={visibleModeOptions}
				value={mode}
				onChange={setMode}
			/>

			<div>{mode === "general" ? <GeneralEditPage /> : <></>}</div>
		</div>
	);
}

function EditOperationSelect({
	options,
	value,
	onChange,
}: {
	options: SelectItemType<Mode>[];
	value: Mode | undefined;
	onChange: (value: Mode | undefined) => void;
}) {
	const id = useId();

	return (
		<div className="max-w-64 space-y-2">
			<label htmlFor={id}>عملیات</label>
			<Select
				value={value ?? ""}
				onValueChange={(value: Mode) => onChange(value || undefined)}
			>
				<SelectTrigger>
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					{options.map((x) => (
						<SelectItem key={x.value} value={x.value}>
							{x.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
}

export { EditsPage };
