"use client";

import { memo, useCallback, useState } from "react";

import { Head } from "@/ui/Head";

import { InformationDisplay } from "./InformationDisplay";
import { InformationEditForm } from "./InformationEditForm";

type PageMode = "display" | "edit";

export const GroupInformation = memo(
	function GroupInformation(): React.ReactNode {
		const [mode, setMode] = useState<PageMode>("display");

		const handleInformationEdit = useCallback(() => {
			setMode("edit");
		}, []);

		const handleInformationEditCancel = useCallback(() => {
			setMode("display");
		}, []);

		return (
			<div className="space-y-10">
				<Head.Root className="gap-x-2">
					<Head.Title
						text={mode === "display" ? "اطلاعات گروه" : "ویرایش اطلاعات گروه"}
					/>
				</Head.Root>

				{mode === "display" ? (
					<InformationDisplay onInformationEdit={handleInformationEdit} />
				) : (
					<InformationEditForm
						onInformationEditCancel={handleInformationEditCancel}
					/>
				)}
			</div>
		);
	},
);
