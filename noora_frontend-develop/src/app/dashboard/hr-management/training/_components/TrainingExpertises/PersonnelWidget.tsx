"use client";

import { memo, useEffect, useMemo, useState } from "react";
import { FaCopy } from "react-icons/fa6";

import { Expertise } from "@/hrm/expertises/models/Expertise";
import { Personnel } from "@/hrm/personnel/models/Personnel";
import { getPersonnel } from "@/hrm/personnel/services/getPersonnel";
import { PersonnelExpertiseStatus } from "@/hrm/personnelExpertise/models/PersonnelExpertiseStatus";
import { cn } from "@/lib/utils";
import { Card } from "@/ui/Card";
import { Head } from "@/ui/Head";
import { Loading } from "@/ui/Loader";

interface Props {
	expertises: Expertise[];
}

interface PersonnelAndExpertises {
	personnel: Personnel;
	expertises: ({ index: number; status: PersonnelExpertiseStatus } | null)[];
}

export const PersonnelWidget = memo(function PersonnelWidget({
	expertises,
}: Props): React.ReactNode {
	const [isLoading, setLoading] = useState<boolean>(true);
	const [personnel, setPersonnel] = useState<PersonnelAndExpertises[]>([]);

	const listedPersonnel = useMemo(() => {
		return personnel.filter(
			(x) => x?.expertises.filter((y) => y && y?.status !== "qualified").length,
		);
	}, [personnel]);

	useEffect(() => {
		(async () => {
			setLoading(true);

			const personnel = await getPersonnel({
				filters: [{ name: "expertiseId", value: expertises.map((x) => x.id) }],
				populate: ["expertises"],
			});
			setPersonnel(
				personnel.map((person) => ({
					personnel: person,
					expertises: expertises.map((x, i) => {
						const expertise = person.expertises?.find(
							(y) => y.expertiseId === x.id,
						);

						if (expertise) {
							return { index: i, status: expertise.status! };
						}

						return null;
					}),
				})),
			);

			setLoading(false);
		})();
	}, [expertises]);

	return (
		expertises.length !== 0 && (
			<Card intent="primary" padding="xl">
				{isLoading ? (
					<Loading intent="white" size="sm">
						در حال دریافت اطلاعات...
					</Loading>
				) : (
					<div className="space-y-4">
						<Head.Root>
							<Head.Title
								text={`لیست پرسنل: ${
									personnel.filter(
										(x) =>
											x?.expertises.filter(
												(y) => y && y?.status !== "qualified",
											).length,
									).length
								} نفر`}
							>
								<FaCopy
									className="cursor-pointer"
									onClick={() => {
										const text = listedPersonnel
											.map((x) => x.personnel.fullname)
											.reduce((acc, fullname) => {
												return (acc += `${fullname}\n`);
											}, "")
											.replace(/\n$/, "");

										navigator.clipboard.writeText(text);
									}}
								/>
							</Head.Title>
						</Head.Root>
						<div className="grid grid-cols-3 gap-x-14 gap-y-3 lg:gap-x-28 xl:gap-x-40">
							{listedPersonnel.map((item, index) => (
								<div
									className="flex items-center justify-between gap-x-2"
									key={item.personnel.id}
								>
									<div>
										<span className="basis-4">{index + 1}.</span>
										<span>{item.personnel.fullname}</span>
									</div>
									<div className="flex gap-x-1 gap-y-1">
										{item.expertises.map((expertise, index) =>
											!expertise ? (
												<div className="h-4 w-4" key={index}></div>
											) : (
												<div
													className={cn(
														"flex h-4 w-4 cursor-help select-none items-center justify-center rounded-full text-2xs",
														expertise.status === "qualified"
															? "bg-zinc-600"
															: "bg-gray-100 text-black",
													)}
													key={expertise.index}
													title={expertises.at(index)?.title}
												>
													<span className="relative top-[1px]">
														{expertise.index + 1}
													</span>
												</div>
											),
										)}
									</div>
								</div>
							))}
						</div>
					</div>
				)}
			</Card>
		)
	);
});
