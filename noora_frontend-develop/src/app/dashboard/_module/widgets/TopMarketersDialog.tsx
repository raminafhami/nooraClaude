"use client";

import bronzeMedal from "/public/images/bronzeMedal.png";
import goldMedal from "/public/images/goldMedal.png";
import silverMedal from "/public/images/silverMedal.png";
import Image from "next/image";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { DialogProps } from "@/components/ui/dialog/use-dialogs";
import { cn } from "@/lib/utils";

import { SvgBorder } from "./SvgBorder";

function TopMarketersDialog({
	payload,
	open,
	onClose,
}: DialogProps<
	{
		topMarketers: any[];
		imageUrls: Record<string, string>;
	},
	string | boolean
>) {
	function getPersianOrdinalNumber(num: number) {
		const persianOrdinals = {
			1: "اول",
			2: "دوم",
			3: "سوم",
			4: "چهارم",
			5: "پنجم",
			6: "ششم",
			7: "هفتم",
			8: "هشتم",
			9: "نهم",
			10: "دهم",
		};
		return persianOrdinals[num as keyof typeof persianOrdinals];
	}

	return (
		<Dialog open={open} onOpenChange={onClose.bind(null, undefined)}>
			<DialogContent className="max-w-screen-sm">
				<DialogHeader>
					<DialogTitle>بازاریاب های برتر</DialogTitle>
				</DialogHeader>
				<div className="flex flex-col">
					{payload.topMarketers.slice(0, 10).map((item, index) => (
						<div
							key={index}
							className={cn(
								"flex w-full items-center justify-between border-b",
								index === 9 && "border-none",
							)}
						>
							<div className="flex items-center gap-5">
								<div className="mt-2 h-14 w-14">
									<SvgBorder
										url={payload.imageUrls[item.id] || "/images/avatar.png"}
										strokeColor={index === 0 ? "#F2D422" : "#D2D7DB"}
										strokeWidth="2px"
									/>
								</div>
								<span>{item.name}</span>
							</div>
							<div
								className={cn(
									"flex h-1/2 w-28 items-center justify-center gap-2 rounded-lg bg-gray-200 px-2",
									index === 0 && "bg-yellow-100",
									index === 1 && "bg-gray-100",
									index === 2 && "bg-[#FFE6D2]",
								)}
							>
								{index === 0 && (
									<Image src={goldMedal} width={15} height={15} alt="" />
								)}
								{index === 1 && (
									<Image src={silverMedal} width={15} height={15} alt="" />
								)}
								{index === 2 && (
									<Image src={bronzeMedal} width={15} height={15} alt="" />
								)}
								نفر {getPersianOrdinalNumber(index + 1)}
							</div>
						</div>
					))}
				</div>
			</DialogContent>
		</Dialog>
	);
}

export default TopMarketersDialog;
