"use client";

import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { twMerge } from "tailwind-merge";

import { Input } from "@/form/Input";
import { Personnel } from "@/hrm/personnel/models/Personnel";
import { getPersonnel } from "@/hrm/personnel/services/getPersonnel";
import { Card } from "@/ui/Card";
import { Head } from "@/ui/Head";
import { Loading } from "@/ui/Loader";

import { AttendancesQuery } from "./Reports";

export function AttendancesPersonnel(): React.ReactNode {
	const [isLoading, setLoading] = useState<boolean>(true);
	const [people, setPeople] = useState<Personnel[]>([]);
	const [searchValue, setSearchValue] = useState("");
	const [searchResult, setSearchResult] = useState<Personnel[]>([]);
	const { register, setValue, watch } = useFormContext<AttendancesQuery>();
	const personnel = watch("personnel");

	useEffect(() => {
		register("personnel", {
			validate: (v) => {
				return Array.isArray(v);
			},
		});

		(async () => {
			setLoading(true);
			const response = await getPersonnel({ sort: { personnelCode: "asc" } });
			setPeople(response);
			setLoading(false);
		})();
	}, []);

	useEffect(() => {
		const delay = setTimeout(() => {
			if (searchValue === "") {
				setSearchResult(people);
			} else {
				getSearchedpersonnel();
			}
		}, 400);

		return () => clearTimeout(delay);
	}, [searchValue, people]);

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
			setSearchResult(personnel);
		} catch (err: any) {
			// setError(err?.message || "خطایی در دریافت اطلاعات رخ داد.");
		} finally {
			setLoading(false);
		}
	}

	return (
		<>
			<Card className="space-y-3 px-0" intent="primary">
				<Head.Root className="flex flex-col">
					<Head.Title text="لیست پرسنل">
						<Input
							className="h-8 w-[8rem] rounded-lg border-none px-1 text-sm text-black placeholder:text-xs"
							placeholder="جستجو "
							value={searchValue}
							onChange={(e) =>
								setSearchValue(
									e.target.value.replace(/^\s+/, "").replace(/\s\s+/g, " "),
								)
							}
						/>
					</Head.Title>
				</Head.Root>
				<div className="flex h-80 flex-col">
					{isLoading ? (
						<div className="px-5">
							<Loading size="sm" intent="white">
								در حال دریافت اطلاعات...
							</Loading>
						</div>
					) : (
						<div className="grow overflow-auto">
							{searchResult.length < 1 && searchValue.length > 1 && (
								<div className="ms-3 py-2 ps-2">نتیجه‌ای یافت نشد</div>
							)}
							{searchResult.map((person) => (
								<div
									className={twMerge(
										"ms-3 cursor-pointer rounded-s-xl py-2 ps-2 transition",
										personnel?.at(0)?.id === person.id && "bg-white text-black",
									)}
									key={person.id}
									onClick={() => {
										setValue("personnel", [person], {
											shouldDirty: true,
											shouldTouch: true,
											shouldValidate: true,
										});
									}}
								>
									<span>
										{person.firstname} {person.lastname}
									</span>
								</div>
							))}
						</div>
					)}
				</div>
			</Card>
		</>
	);
}
