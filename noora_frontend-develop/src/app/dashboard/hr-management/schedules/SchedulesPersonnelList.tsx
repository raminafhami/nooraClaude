"use client";

import React, { useEffect, useState } from "react";

import { Input } from "@/form/Input";
import { Personnel } from "@/hrm/personnel/models/Personnel";
import { getPersonnel } from "@/hrm/personnel/services/getPersonnel";
import { cn } from "@/lib/utils";
import { Loading } from "@/ui/Loader";

import { PersonnelSelectionType, Query } from "./SchedulesWidget";

type Props = {
	mode: PersonnelSelectionType;
	formData: Query["formData"] | { userId: [] };
	locked?: boolean;
	changeForm:
		| Query["setFormData"]
		| React.Dispatch<React.SetStateAction<{ userId: [] }>>;
};

export function SchedulesPersonnelList({
	mode,
	changeForm,
	formData,
	locked = false,
}: Props) {
	const [isLoading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [personnel, setPersonnel] = useState<Personnel[]>([]);
	const [selectedPersonnel, setSelectedPersonnel] = useState<string[]>([]);
	const [searchValue, setSearchValue] = useState("");
	const [allPersonnel, setAllPersonnel] = useState<Personnel[]>([]);

	const handlePersonnelFetch = (personnel: Personnel[]): void => {
		setAllPersonnel(personnel);
		setPersonnel(personnel);
	};
	async function loadAllPersonnel() {
		try {
			setLoading(true);
			const personnel = await getPersonnel({ populate: ["user"] });
			setError(null);
			handlePersonnelFetch(personnel);
		} catch (err: any) {
			setError(err?.message || "خطایی در دریافت اطلاعات رخ داد.");
		} finally {
			setLoading(false);
		}
	}

	async function getSearchedpersonnel() {
		try {
			setLoading(true);
			const personnel = await getPersonnel({
				filters: [
					{
						name: "user",
						value: {
							$or: [
								{
									$expr: {
										$regexMatch: {
											input: {
												$concat: ["$name", " ", "$lastname"],
											},
											regex: searchValue,
											options: "i",
										},
									},
								},
							],
						},
					},
				],
				populate: ["user"],
			});
			setPersonnel(personnel);
		} catch (err: any) {
			setError(err?.message || "خطایی در دریافت اطلاعات رخ داد.");
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		loadAllPersonnel();
	}, []);

	useEffect(() => {
		const delay = setTimeout(() => {
			if (searchValue === "") {
				loadAllPersonnel();
			} else {
				getSearchedpersonnel();
			}
		}, 400);

		return () => clearTimeout(delay);
	}, [searchValue]);

	useEffect(() => {
		changeForm((prev: any) => ({ ...prev, userId: selectedPersonnel }));
	}, [selectedPersonnel]);

	const changeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.checked) {
			if (mode === PersonnelSelectionType.multiPersonnel) {
				setSelectedPersonnel((prev) => [...prev, e.target.name]);
			}
			if (mode === PersonnelSelectionType.onePersonnel) {
				setSelectedPersonnel([e.target.name]);
			}
		} else {
			setSelectedPersonnel((prev) => prev.filter((id) => id !== e.target.name));
		}
	};

	const selectAllHandler = (e: any) => {
		setSelectedPersonnel(
			e.target.checked
				? [...personnel.map((personnel) => personnel.userId)]
				: [],
		);
	};

	useEffect(() => {
		setSearchValue("");
	}, [locked]);

	return (
		<div className="max-h-[80rem] w-full min-w-[15rem] overflow-auto rounded-2xl bg-primary-100/30 p-3">
			<div className="flex items-center justify-between pb-4">
				<h4 className="align-middle text-lg font-semibold">لیست پرسنل</h4>
				<Input
					disabled={locked ? true : false}
					className="w-[60%] rounded-lg border-none px-1 py-2 text-sm"
					placeholder="جستجو "
					value={searchValue}
					onChange={(e) =>
						setSearchValue(
							e.target.value.replace(/^\s+/, "").replace(/\s\s+/g, " "),
						)
					}
				/>
			</div>
			<div className="h-[35rem] overflow-y-auto">
				{isLoading ? (
					<Loading
						size={"md"}
						horizontalPlacement="start"
						verticalPlacement="start"
					/>
				) : error ? (
					<div>خطایی رخ داده است</div>
				) : (
					<div className="flex flex-col gap-3">
						{!searchValue && mode === PersonnelSelectionType.multiPersonnel && (
							<div className="flex gap-3">
								<input
									type="checkbox"
									disabled={locked ? true : false}
									onChange={selectAllHandler}
									checked={formData.userId.length === allPersonnel.length}
									className={cn(locked ? "!opacity-60" : "")}
								/>
								<label className={cn(locked ? "!opacity-60" : "")}>
									انتخاب همه
								</label>
							</div>
						)}
						{personnel?.map((personnel, index) => (
							<div
								key={`personnel ${index}`}
								className="flex items-center gap-2 border-b border-primary-100 py-2 text-lg"
							>
								<input
									checked={
										!!formData.userId.find((x) => x === personnel.userId)
									}
									name={personnel.userId}
									type="checkbox"
									onChange={changeHandler}
									disabled={locked ? true : false}
									className={cn(locked ? "!opacity-60" : "")}
								/>

								{/* <Image
                src={"/"}
                className="rounded-full"
                alt=""
                width={30}
                height={30}
              /> */}

								<div className={cn(locked ? "opacity-60" : "", "!text-base")}>
									{personnel.fullname}
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
