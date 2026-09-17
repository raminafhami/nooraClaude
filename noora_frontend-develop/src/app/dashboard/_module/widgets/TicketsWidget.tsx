"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Tooltip } from "react-tooltip";

import GetAllTickets from "@/api/ticketsapi/getAllTickets";
import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardNav,
	CardTitle,
} from "@/components/ui/card";
import { DateTime } from "@/components/ui/datetime";
import { DynamicLink } from "@/components/ui/dynamic-link";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Loading } from "@/ui/Loader";
import { getDynamicUrl } from "@/utils/url/getDynamicUrl";

function TicketsWidget() {
	const { identity } = useLoggedInUser();
	const router = useRouter();
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [tickets, setTickets] = useState<any>();

	const loadTickets = useCallback(async () => {
		try {
			setIsLoading(true);

			let response = await GetAllTickets({
				page: 0,
				size: 5,
				user: identity,
			});

			setTickets(response.result.data);
		} catch (err) {
			console.error(err);
		} finally {
			setIsLoading(false);
		}
	}, [identity]);

	useEffect(() => {
		loadTickets();
	}, [loadTickets]);

	return (
		<Card className="col-span-full border-0 shadow-none xl:col-span-8 xl:h-[32rem]">
			<CardHeader orientation="horizontal">
				<CardTitle>تیکت ها</CardTitle>
				<CardNav>
					<DynamicLink href="/dashboard/tickets-list">
						<Button variant="ghost">مشاهده همه</Button>
					</DynamicLink>
				</CardNav>
			</CardHeader>
			<CardContent className="p-0">
				<Table
					slotProps={{
						wrapper: { className: "pb-4" },
						root: {
							className: "rounded-none border-x-0 ",
						},
					}}
				>
					<TableHeader className="bg-gray-50">
						<TableRow>
							<TableHead className="w-20">#</TableHead>
							<TableHead>موضوع</TableHead>
							<TableHead className="w-52">ارسال کننده</TableHead>
							<TableHead className="w-52">مسئول مربوطه</TableHead>
							<TableHead className="w-36">اولویت</TableHead>
							<TableHead className="w-36">زمان ایجاد</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody className="cursor-pointer text-gray-700">
						{isLoading ? (
							<TableRow>
								<TableCell>
									<Loading size="sm">در حال بارگزاری...</Loading>
								</TableCell>
							</TableRow>
						) : tickets?.length ? (
							tickets.map((ticket: any) => (
								<TableRow
									onClick={() =>
										router.push(
											getDynamicUrl(
												`/dashboard/tickets-list?ticketId=${ticket.id}`,
											),
										)
									}
									key={ticket.id}
								>
									<TableCell className="cursor-pointer">
										{ticket.ticketNo ? ticket.ticketNo : "-"}
									</TableCell>

									<TableCell>{ticket.subject ? ticket.subject : "-"}</TableCell>

									<TableCell>
										{ticket.createdBy
											? `${ticket.createdBy.name} ${ticket.createdBy.lastname}`
											: "-"}
									</TableCell>

									<TableCell>
										{ticket.assignee ? (
											`${ticket?.assignee.name} ${ticket?.assignee.lastname}`
										) : (
											<>-</>
										)}
									</TableCell>

									<TableCell
										className={`${
											ticket?.priority === 3
												? "text-red-700"
												: ticket?.priority === 2
													? "text-green-700"
													: ticket?.priority === 1
														? "text-blue-700"
														: ""
										}`}
									>
										<div
											className={cn(
												ticket.priority === 3 && "bg-red-100 text-red-700",
												ticket.priority === 2 &&
													"bg-orange-100 text-orange-700",
												ticket.priority === 1 && "bg-green-100 text-green-700",
												"w-16 rounded-lg py-1 text-center",
											)}
										>
											<div>
												{ticket.priority
													? `${
															ticket?.priority === 3
																? "زیاد"
																: ticket?.priority === 2
																	? "متوسط"
																	: ticket?.priority === 1
																		? "کم"
																		: "-"
														}`
													: "-"}
											</div>
										</div>
									</TableCell>

									<TableCell className="p-4">
										<DateTime date={ticket.createdAt} />
									</TableCell>
								</TableRow>
							))
						) : (
							""
						)}
						{!isLoading && (!tickets || tickets?.length === 0) && (
							<TableRow data-static>
								<TableCell className="text-start" colSpan={100}>
									موردی یافت نشد...
								</TableCell>
							</TableRow>
						)}
						<Tooltip id={`assigne`}>اختصاص به من</Tooltip>
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);
}

export { TicketsWidget };
