"use client";

import { useEffect, useState } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { UserLookupSelect } from "@/identity/users/components/UserLookupSelect";
import { UserLookup } from "@/identity/users/models/UserLookup";
import { UserType } from "@/identity/users/models/UserType";

type SearchAttributeProps = Partial<{
	caseNo: string;
	author: UserLookup;
	subject: string;
}>;

function LetterSearch({ setSearch }: { setSearch: (s: any) => void }) {
	const [searchAttribute, setSearchAttribute] =
		useState<SearchAttributeProps>();

	useEffect(() => {
		const delayDebounceFn = setTimeout(() => {
			if (searchAttribute) {
				setSearch(searchAttribute);
			}
		}, 300);

		return () => clearTimeout(delayDebounceFn);
	}, [searchAttribute, setSearch]);

	return (
		<Card>
			<CardContent className="grid grid-cols-1 gap-3 px-0 pt-6 sm:grid-cols-1 md:grid-cols-4">
				<div className="flex flex-col px-4">
					<label htmlFor="caseNo" className="mb-2">
						شماره نامه:
					</label>
					<Input
						id="caseNo"
						key={`input[name]`}
						onChange={(event) =>
							setSearchAttribute((prev) => ({
								...prev,
								caseNo: event.target.value,
							}))
						}
						value={searchAttribute?.caseNo}
					/>
				</div>

				<div className="flex flex-col px-4">
					<label htmlFor="parameters.LetterSubject" className="mb-2">
						موضوع نامه:
					</label>
					<Input
						id="parameters.LetterSubject"
						onChange={(event) =>
							setSearchAttribute((prev) => ({
								...prev,
								subject: event.target.value,
							}))
						}
						value={searchAttribute?.subject}
					/>
				</div>

				<div className="flex flex-col px-4">
					<label htmlFor="parameters.Assignees.Author.name" className="mb-2">
						ارسال کننده:
					</label>
					<UserLookupSelect
						placeholder="همه ارسال کننده ها"
						type={UserType.Personnel}
						onValueChange={(value) =>
							setSearchAttribute((prev) => ({
								...prev,
								author: value ?? undefined,
							}))
						}
						value={searchAttribute?.author}
					/>
				</div>
			</CardContent>
		</Card>
	);
}

export { LetterSearch };
