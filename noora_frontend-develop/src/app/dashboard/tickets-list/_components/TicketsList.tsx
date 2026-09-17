"use client";

import { parseAsString, useQueryState } from "nuqs";
import { AiFillDelete } from "react-icons/ai";
import { RiUserReceived2Fill } from "react-icons/ri";
import { Tooltip } from "react-tooltip";
import { toast } from "sonner";

import DeleteTickets from "@/api/ticketsapi/deleteTickets";
import PutTicketClaim from "@/api/ticketsapi/putTicketClaim";
import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import { Card, CardContent } from "@/components/ui/card";
import { DateTime } from "@/components/ui/datetime";
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

interface TicketsListProps {
	parentNode: "tickets" | "instance";
	tickets: any;
	loading: boolean;
	getData: () => void;
	setLoading: (s: boolean) => any;
	tableClasses?: string;
}

export function TicketsList({
	parentNode,
	tickets,
	loading,
	getData,
	setLoading,
}: TicketsListProps) {
	const { identity } = useLoggedInUser();

	const isAdmin = identity.groups.includes("admins");

	const [activeTicketId, setActiveTicketId] = useQueryState(
		"ticketId",
		parseAsString,
	);

	async function claimTicket(id: string) {
		setLoading(true);
		try {
			let res = await PutTicketClaim({ id });
			if (res) {
				setTimeout(() => {
					toast.success("با موفقیت اختصاص داده شد!");
					getData();
					setLoading(false);
				}, 300);
			}
		} catch (e: any) {
			setLoading(false);
			toast.error(e?.response?.data?.message);
		}
	}

	async function deleteTicket(id: string) {
		setLoading(true);
		try {
			let res = await DeleteTickets({ id });
			if (res) {
				setTimeout(() => {
					toast.success("با موفقیت حذف شد!");
					getData();
					setLoading(false);
				}, 300);
			}
		} catch (e: any) {
			setLoading(false);
			toast.error(e.response.data.message);
		}
	}

	return (
		<Card>
			<CardContent className="px-0 pt-6">
				<Table
					slotProps={{
						root: {
							className: "rounded-none border-x-0",
						},
					}}
				>
					<TableHeader>
						<TableRow className="whitespace-nowrap">
							<TableHead className="w-20">شماره</TableHead>
							<TableHead>موضوع</TableHead>
							<TableHead className="w-44">ارسال کننده</TableHead>
							<TableHead className="w-44">مسئول مربوطه</TableHead>
							<TableHead className="w-32">اولویت</TableHead>
							<TableHead className="w-36">زمان ایجاد</TableHead>
							<TableHead className="w-36">آخرین بروزرسانی</TableHead>
							{isAdmin && <TableHead className="w-28">عملیات</TableHead>}
						</TableRow>
					</TableHeader>
					<TableBody className="cursor-pointer">
						{loading ? (
							<TableRow>
								<TableCell>
									<Loading size="sm">در حال بارگزاری...</Loading>
								</TableCell>
							</TableRow>
						) : tickets?.length ? (
							tickets.map((ticket: any) => (
								<TableRow
									key={ticket.id}
									className={cn(
										"whitespace-nowrap",
										ticket.id === activeTicketId &&
											"!border-b !border-e-2 border-primary-400 border-b-gray-200 bg-gray-50",
									)}
									onClick={() => {
										window.scrollTo({ top: 0, behavior: "smooth" });
										setActiveTicketId(ticket.id);
									}}
								>
									<TableCell className="cursor-pointer">
										{ticket.ticketNo ? ticket.ticketNo : "-"}
									</TableCell>

									<TableCell>
										<div className="flex min-w-36 flex-col items-start justify-center gap-y-2 whitespace-normal">
											<div>{ticket.subject || "-"}</div>
											{parentNode !== "instance" && (
												<div className="whitespace-nowrap text-muted-foreground">
													{ticket.referenceType === "instance-inspection" &&
														`بازرسی ${ticket.reference}`}
												</div>
											)}
										</div>
									</TableCell>

									<TableCell>
										<div className="flex flex-col items-start justify-center gap-y-2">
											<div>
												{ticket.createdBy
													? `${ticket.createdBy.name} ${ticket.createdBy.lastname}`
													: "-"}
											</div>
										</div>
									</TableCell>

									<TableCell>
										{ticket.assignee ? (
											`${ticket?.assignee.name} ${ticket?.assignee.lastname}`
										) : (
											<>
												{identity.groups.includes(ticket?.group) ? (
													<>
														<RiUserReceived2Fill
															onClick={() => claimTicket(ticket.id)}
															data-tooltip-id={`assigne`}
															size={22}
															className="flex-inline btn cursor-pointer items-center rounded bg-gray-100 px-1 py-1 text-black hover:bg-blue-400 hover:text-white"
														/>
													</>
												) : (
													<>-</>
												)}
											</>
										)}
									</TableCell>

									<TableCell
										className={`${
											ticket?.priority === 3
												? "text-red-500"
												: ticket?.priority === 2
													? "text-green-500"
													: ticket?.priority === 1
														? "text-blue-500"
														: ""
										}`}
									>
										<div className="flex flex-col items-start gap-y-2 text-center">
											<div>
												{ticket.priority
													? `${
															ticket?.priority === 3
																? "فوری"
																: ticket?.priority === 2
																	? "معمولی"
																	: ticket?.priority === 1
																		? "پایین"
																		: "-"
														}`
													: "-"}
											</div>
											<div>
												<span
													className={`block w-max rounded-2xl px-2 py-1 text-xs ${
														ticket.status === "in-progress"
															? "bg-yellow-50 text-yellow-500"
															: ticket.status === "closed"
																? "bg-green-50 text-green-500"
																: ticket.status === "on-hold"
																	? "bg-red-50 text-red-500"
																	: ticket.status === "open"
																		? "bg-blue-50 text-blue-500"
																		: ""
													}`}
												>
													{ticket.status
														? `${
																ticket.status === "in-progress"
																	? "در حال بررسی"
																	: ticket.status === "closed"
																		? "بسته شده"
																		: ticket.status === "on-hold"
																			? "متوقف شده"
																			: ticket.status === "open"
																				? "در حال اجرا"
																				: "-"
															}`
														: ""}
												</span>
											</div>
										</div>
									</TableCell>

									<TableCell>
										<DateTime date={ticket.createdAt} />
									</TableCell>

									<TableCell>
										<DateTime date={ticket.modifiedAt} />
									</TableCell>

									{isAdmin && (
										<TableCell>
											<button
												onClick={() => deleteTicket(ticket.id)}
												className="flex-inline btn items-center rounded px-1 py-1"
											>
												<AiFillDelete
													size={15}
													className="inline-flex cursor-pointer text-red-400 hover:text-red-700 focus:outline-0"
												/>
											</button>
										</TableCell>
									)}
								</TableRow>
							))
						) : (
							""
						)}
						{!loading && (!tickets || tickets?.length === 0) && (
							<TableRow>
								<TableCell colSpan={100}>موردی یافت نشد...</TableCell>
							</TableRow>
						)}
						<Tooltip id={`assigne`}>اختصاص به من</Tooltip>
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);
}
