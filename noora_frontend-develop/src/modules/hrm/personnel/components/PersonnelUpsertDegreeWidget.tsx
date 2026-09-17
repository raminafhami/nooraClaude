"use client";

import { useState } from "react";
import { FaTrash } from "react-icons/fa6";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AcademicDegree } from "@/hrm/shared/models/AcademicDegree";

function PersonnelUpsertDegreeWidget({
	disabled,
	value = [],
	onChange,
}: {
	disabled?: boolean;
	value: AcademicDegree[] | undefined;
	onChange: (degrees: AcademicDegree[]) => void;
}) {
	const [degreeLevel, setDegreeLevel] = useState<string>("");
	const [degreeName, setDegreeName] = useState<string>("");
	const [degreeField, setDegreeField] = useState<string>("");

	function handleSubmit() {
		if (degreeLevel !== "" && degreeName !== "") {
			onChange([
				...value,
				{ level: degreeLevel, name: degreeName, field: degreeField },
			]);

			setDegreeName("");
			setDegreeLevel("");
			setDegreeField("");
		} else {
			toast.error("لطفا همه فیلدهای را تکمیل کنید");
		}
	}

	function handleDelete(index: number) {
		onChange(value.filter((_, i) => i !== index));
	}

	return (
		<div className="col-span-full flex gap-5">
			<div className="flex w-full gap-2">
				<div className="flex w-2/5 flex-col gap-2">
					<Input
						className="w-full"
						placeholder="مقطع"
						value={degreeLevel}
						onChange={(e) => setDegreeLevel(e.target.value)}
					/>

					<Input
						className="w-full"
						placeholder="رشته"
						value={degreeName}
						onChange={(e) => setDegreeName(e.target.value)}
					/>

					<Input
						className="w-full"
						placeholder="گرایش"
						value={degreeField}
						onChange={(e) => setDegreeField(e.target.value)}
					/>

					<Button
						className=""
						size="lg"
						type="button"
						variant="outline"
						onClick={handleSubmit}
					>
						افزودن
					</Button>
				</div>

				<div className="flex w-3/5 flex-col items-center gap-2 rounded-2xl border p-2">
					{!!value.length &&
						value.map((degree, index) => (
							<div
								className="flex w-full items-center justify-start gap-1 rounded-lg bg-gray-50 p-2"
								key={index}
							>
								<div>{degree.level}</div>
								<div>{degree.name}</div>
								<div>{degree.field}</div>
								<div className="ms-auto">
									<Button
										variant="ghost"
										type="button"
										onClick={() => handleDelete(index)}
									>
										<FaTrash />
									</Button>
								</div>
							</div>
						))}
				</div>
			</div>
		</div>
	);
}

export { PersonnelUpsertDegreeWidget };
