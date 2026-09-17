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

import { CourseInfoDisplay } from "./CourseInfoDisplay";
import { CourseInfoForm } from "./CourseInfoForm";

type Mode = "display" | "edit";

function CourseInfoWidget() {
	const [mode, setMode] = useState<Mode>("display");

	const handleModeDisplay = useCallback(() => {
		setMode("display");
	}, []);

	const handleModeEdit = useCallback(() => {
		setMode("edit");
	}, []);

	return (
		<div className="col-span-full 2xl:col-span-4">
			<Card>
				<CardHeader orientation="horizontal">
					<CardTitle>
						<CardIcon>
							<FaInfo />
						</CardIcon>
						اطلاعات دوره آموزشی
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
					<CourseInfoDisplay />
				) : (
					<CourseInfoForm onCancel={handleModeDisplay} />
				)}
			</Card>
		</div>
	);
}

export { CourseInfoWidget };
