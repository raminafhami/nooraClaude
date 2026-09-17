import { memo } from "react";
import {
	FaAngleLeft,
	FaCopy,
	FaEye,
	FaTriangleExclamation,
} from "react-icons/fa6";

import { Button } from "@/components/ui/button";
import { expertiseType } from "@/hrm/expertises/enums/ExpertiseType";
import { Expertise } from "@/hrm/expertises/models/Expertise";
import { Card } from "@/ui/Card";
import { Head } from "@/ui/Head";

interface Props {
	expertises: Expertise[];
	onExpertiseRemove: (expertiseId: string) => void;
	onExpertisesSelect: (expertises: Expertise[]) => void;
}

export const ExpertisesSelected = memo(function ExpertisesSelectes({
	expertises,
	onExpertiseRemove,
	onExpertisesSelect,
}: Props): React.ReactNode {
	return (
		<Card
			className="flex h-80 min-h-full basis-1/2 flex-col gap-y-2 px-4"
			style={{
				background: "linear-gradient(135deg, #fff 0%, #1bb383 100%)",
			}}
		>
			<Head.Root>
				<Head.Title text="توانمندی های انتخاب شده">
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

					<Button
						className="border-none"
						size="xs"
						type="button"
						variant="outline"
						onClick={() => {
							onExpertisesSelect(expertises);
						}}
					>
						<FaEye className="w-4" />
						نمایش پرسنل
					</Button>
				</Head.Title>
			</Head.Root>

			<div className="grow overflow-hidden">
				{expertises.length === 0 ? (
					<div className="flex items-center gap-x-1">
						<FaTriangleExclamation /> هیچ توانمندی ای انتخاب نشده است.
					</div>
				) : (
					<ul className="h-full grow space-y-2 overflow-auto">
						{expertises.map((expertise, index) => (
							<li
								className="flex cursor-pointer select-none items-start gap-x-2"
								key={expertise.id}
								onDoubleClick={() => {
									onExpertiseRemove(expertise.id);
								}}
							>
								<div className="mt-1 shrink-0 basis-1.5">
									<FaAngleLeft className="w-1.5" />
								</div>
								<div className="mt-0.5 shrink-0 basis-16 rounded-xl bg-zinc-700 px-1 text-center text-xs text-white">
									{expertiseType[expertise.type].title}
								</div>
								<div className="mt-0.5 flex h-4 w-fit shrink-0 items-center justify-center rounded-full bg-zinc-700 px-1.5 text-2xs text-white">
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
