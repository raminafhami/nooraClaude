"use client";

import { useCallback, useState } from "react";
import { FaInfo, FaPencil } from "react-icons/fa6";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardHeader,
	CardIcon,
	CardNav,
	CardTitle,
} from "@/components/ui/card";

import CustomerInfoDisplay from "./CustomerInfoDisplay";
import { CustomerInfoForm } from "./CustomerInfoForm";

type Mode = "display" | "edit";

function CustomerInfoWidget() {
	const [mode, setMode] = useState<Mode>("display");

	const handleModeDisplay = useCallback(() => {
		setMode("display");
	}, []);

	const handleModeEdit = useCallback(() => {
		setMode("edit");
	}, []);

	return (
		<Card>
			<CardHeader orientation="horizontal">
				<CardTitle>
					<CardIcon>
						<FaInfo />
					</CardIcon>
					اطلاعات مشتری
				</CardTitle>
				{mode === "display" && (
					<CardNav>
						<Button variant="secondary" onClick={handleModeEdit}>
							<FaPencil />
							ویرایش اطلاعات
						</Button>
					</CardNav>
				)}
			</CardHeader>
			{mode === "display" ? (
				<CustomerInfoDisplay />
			) : (
				<CustomerInfoForm onCancel={handleModeDisplay} />
			)}
		</Card>
	);
}

export { CustomerInfoWidget };
