import { memo, useEffect, useRef, useState } from "react";
import { FaSearch, FaTimes } from "react-icons/fa";
import { FaAngleLeft, FaCopy, FaTriangleExclamation } from "react-icons/fa6";

import { Input } from "@/form/Input";
import { expertiseType } from "@/hrm/expertises/enums/ExpertiseType";
import { Expertise } from "@/hrm/expertises/models/Expertise";
import { getExpertises } from "@/hrm/expertises/services/getExpertises";
import { Card } from "@/ui/Card";
import { Head } from "@/ui/Head";
import { Loading } from "@/ui/Loader";

interface Props {
	expertises: Expertise[];
	onExpertiseSelect: (expertise: Expertise) => void;
	onExpertisesLoad: (expertises: Expertise[]) => void;
}

export const ExpertisesUnselected = memo(function ExpertisesUnselected({
	expertises,
	onExpertiseSelect,
	onExpertisesLoad,
}: Props): React.ReactNode {
	const [isLoading, setLoading] = useState<boolean>(true);
	const [isSearching, setSearching] = useState<boolean>(false);
	const [searchText, setSearchText] = useState<string | null>(null);

	const searchTimeout = useRef<NodeJS.Timeout>();

	useEffect(() => {
		clearTimeout(searchTimeout.current);

		if (searchText === null && !isSearching) {
			(async () => {
				setLoading(true);

				const expertises = await getExpertises();
				onExpertisesLoad(expertises);

				setSearching(false);
				setLoading(false);
			})();
		} else if (isSearching) {
			searchTimeout.current = setTimeout(async () => {
				setLoading(true);

				const expertises = searchText
					? await getExpertises({
							filters: {
								title: {
									$regex: searchText,
									$options: "i",
								},
							},
						})
					: await getExpertises();
				onExpertisesLoad(expertises);

				setLoading(false);
			}, 300);
		}

		return () => clearTimeout(searchTimeout.current);
	}, [isSearching, searchText, onExpertisesLoad]);

	return (
		<Card className="flex h-80 min-h-full basis-1/2 flex-col gap-y-2 px-4">
			<Head.Root>
				<Head.Title text="توانمندی ها">
					<FaCopy
						className="cursor-pointer"
						onClick={() => {
							const text = expertises
								.map((x) => x.title)
								.reduce((acc, name) => {
									return (acc += `${name}\n`);
								}, "")
								.replace(/\n$/, "");

							navigator.clipboard.writeText(text);
						}}
					/>

					{searchText === null ? (
						<div>
							<FaSearch
								className="cursor-pointer"
								onClick={() => {
									setSearchText("");
								}}
							/>
						</div>
					) : (
						<div className="flex items-center gap-x-2">
							<Input
								className="border-none"
								template="sm"
								onChange={(e) => {
									setSearching(true);
									setSearchText(e.target.value);
								}}
							/>
							<FaTimes
								className="cursor-pointer"
								onClick={() => {
									setSearchText(null);
								}}
							/>
						</div>
					)}
				</Head.Title>
			</Head.Root>

			<div className="grow overflow-hidden">
				{isLoading ? (
					<div>
						<Loading size="sm">در حال دریافت توانمندی ها...</Loading>
					</div>
				) : expertises.length == 0 ? (
					<div className="flex items-center gap-x-1">
						<FaTriangleExclamation />
						توانمندی ای برای انتخاب وجود ندارد.
					</div>
				) : (
					<ul className="h-full grow space-y-2 overflow-auto">
						{expertises.map((expertise, index) => (
							<li
								className="flex cursor-pointer select-none items-start gap-x-2"
								key={expertise.id}
								onDoubleClick={() => {
									onExpertiseSelect(expertise);
								}}
							>
								<div className="mt-1 shrink-0 basis-1.5">
									<FaAngleLeft className="w-1.5" />
								</div>
								<div className="mt-0.5 shrink-0 basis-16 rounded-xl bg-gray-400 px-1 text-center text-xs text-white">
									{expertiseType[expertise.type].title}
								</div>

								<div className="mt-0.5 flex h-4 w-fit shrink-0 items-center justify-center rounded-full bg-gray-400 px-1.5 text-2xs text-white">
									<span className="relative top-[1px]">{index + 1}</span>
								</div>

								<div className="grow">{expertise.title}</div>
							</li>
						))}
					</ul>
				)}
			</div>
		</Card>
	);
});
