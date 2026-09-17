"use client";

import bronze from "/public/images/bronzeMedal.png";
import gold from "/public/images/goldMedal.png";
import silver from "/public/images/silverMedal.png";
import moment from "jalali-moment";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardNav,
	CardTitle,
} from "@/components/ui/card";
import { useDialogs } from "@/components/ui/dialog/use-dialogs";
import { getDashboardRankingReport } from "@/identity/users/services/getDashboardRankingReport";
import getUserById from "@/identity/users/services/getUserById";

import { SvgBorder } from "./SvgBorder";

const TopMarketersDialog = dynamic(() => import("./TopMarketersDialog"));

const TopThree = () => {
	const dialogs = useDialogs();
	const [topMarketers, setTopMarketers] = useState<any[]>();
	const [imageUrls, setImageUrls] = useState<Record<string, string>>({});

	const getTopThreeSellers = useCallback(async () => {
		try {
			const today = moment();
			const jMonth = today.jMonth();

			let seasonStartMonth = 0;

			if (jMonth < 3) {
				seasonStartMonth = 0;
			} else if (jMonth < 6) {
				seasonStartMonth = 3;
			} else if (jMonth < 9) {
				seasonStartMonth = 6;
			} else {
				seasonStartMonth = 9;
			}

			const year = today.jYear();
			const seasonStart = moment
				.from(`${year}/${seasonStartMonth + 1}/1`, "fa", "jYYYY/jM/jD")
				.startOf("day");
			const seasonEnd = seasonStart
				.clone()
				.add(3, "months")
				.subtract(1, "days");

			const result = await getDashboardRankingReport({
				dateFrom: seasonStart.format("YYYY-MM-DD"),
				dateTo: seasonEnd.format("YYYY-MM-DD"),
			});

			setTopMarketers(result);

			const imagePromises = result.map(async (seller) => {
				const user = await getUserById(seller.id);
				return [
					seller.id,
					user?.image?.id ? `/api/users/${user.image.id}` : "",
				];
			});

			const resolvedImages = await Promise.all(imagePromises);
			const imageMap: Record<string, string> = {};
			resolvedImages.forEach(([id, url]) => {
				imageMap[id] = url;
			});
			setImageUrls(imageMap);
		} catch (err) {
			console.error(err);
		}
	}, []);

	useEffect(() => {
		getTopThreeSellers();
	}, [getTopThreeSellers]);

	const handleTopMarketersDialogOpen = useCallback(async () => {
		await dialogs.open(TopMarketersDialog, {
			topMarketers: topMarketers!,
			imageUrls,
		});
	}, [dialogs, imageUrls, topMarketers]);

	return (
		<Card className="relative col-span-full flex h-full flex-col border-0 shadow-none lg:col-span-6 2xl:col-span-3">
			<CardHeader orientation="horizontal">
				<CardTitle>بازاریاب های برتر</CardTitle>
				<CardNav>
					<Button onClick={handleTopMarketersDialogOpen} variant="ghost">
						مشاهده همه
					</Button>
				</CardNav>
			</CardHeader>
			<CardContent className="grow">
				{!topMarketers ? (
					<div className="flex h-full w-full items-center justify-center">
						<span className="text-gray-500">در حال بارگذاری...</span>
					</div>
				) : !topMarketers.length ? (
					<div className="flex h-full w-full items-center justify-center">
						<span className="text-gray-500">هیج موردی یافت نشد.</span>
					</div>
				) : (
					<>
						<div className="absolute bottom-14 left-[30%] z-10 flex w-2/5 flex-col items-center justify-center rounded-2xl border-[0.5px] border-gray-100 bg-white py-4 shadow-[0px_0px_25px_-3px_rgba(0,0,0,0.1),_0px_0px_10px_-6px_rgba(0,0,0,0.1)]">
							<div className="h-[55px] w-[55px]">
								<SvgBorder
									url={imageUrls[topMarketers[0].id] || "/images/avatar.png"}
									strokeColor="#F2D422"
									strokeWidth="3px"
								/>
							</div>
							<div className="mt-2 text-nowrap text-xs font-bold text-gray-700">
								{topMarketers[0].name}
							</div>
							<div className="absolute mb-6">
								<Image src={gold} width={17} height={17} alt="gold" />
							</div>
							<div className="mt-2 w-3/4 rounded-lg bg-[#FBE8CB] px-2 py-2 text-center text-gray-700">
								نفر اول
							</div>
						</div>

						<div className="grid grid-cols-12">
							<div className="col-span-4 flex flex-col items-center justify-center rounded-2xl border-[0.5px] border-gray-100 py-4 shadow-[0px_0px_25px_-3px_rgba(0,0,0,0.1),_0px_0px_10px_-6px_rgba(0,0,0,0.1)]">
								<div className="w-[50px]">
									<SvgBorder
										url={imageUrls[topMarketers[1].id] || "/images/avatar.png"}
										strokeColor="#D2D7DB"
										strokeWidth="3px"
									/>
								</div>
								<div className="mt-2 text-nowrap text-xs font-bold text-gray-700">
									{topMarketers[1].name}
								</div>
								<div className="absolute mb-7">
									<Image src={silver} width={17} height={17} alt="gold" />
								</div>
								<div className="mt-2 w-3/4 rounded-lg bg-gray-100 px-2 py-2 text-center text-gray-700">
									نفر دوم
								</div>
							</div>
							<div className="col-span-4"></div>
							<div className="col-span-4 flex flex-col items-center justify-center rounded-2xl border-[0.5px] border-gray-100 py-2 shadow-[0px_0px_25px_-3px_rgba(0,0,0,0.1),_0px_0px_10px_-6px_rgba(0,0,0,0.1)]">
								<div className="w-[50px]">
									<SvgBorder
										url={imageUrls[topMarketers[2].id] || "/images/avatar.png"}
										strokeColor="#D18B52"
										strokeWidth="3px"
									/>
								</div>

								<div className="mt-2 text-nowrap text-xs font-bold text-gray-700">
									{topMarketers[2].name}
								</div>
								<div className="absolute mb-7">
									<Image src={bronze} width={17} height={17} alt="gold" />
								</div>

								<div className="mt-2 w-3/4 rounded-lg bg-gray-100 px-2 py-2 text-center text-gray-700">
									نفر سوم
								</div>
							</div>
						</div>
					</>
				)}
			</CardContent>
		</Card>
	);
};

export { TopThree };
