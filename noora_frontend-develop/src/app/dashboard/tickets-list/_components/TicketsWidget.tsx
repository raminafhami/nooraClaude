"use client";

import { useCallback, useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa6";
import { toast } from "sonner";

import GetAllTickets from "@/api/ticketsapi/getAllTickets";
import getTicket from "@/api/ticketsapi/getTicket";
import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import { Button } from "@/components/ui/button";
import Pagination from "@/components/ui/pagination/Pagination";
import { Spinner } from "@/components/ui/spinner";
import { Layout } from "@/ui/Layout";

import AddNewTicket from "./modal/AddNewTicket";
import TicketItem from "./TicketItem";
import { TicketsList } from "./TicketsList";

export function TicketsWidget() {
	const { identity } = useLoggedInUser();

	const isAdmin = identity.groups.includes("admins");

	const [tickets, setTickets] = useState<any>();
	const [items, setItems] = useState<number>(0);
	const [currentPage, setCurrentPage] = useState<number>(0);
	const [size, setSize] = useState<number>(5);
	const [loading, setLoading] = useState<boolean>(true);
	const [isModal, setIsModal] = useState<boolean>(false);
	const [isShowAll, setIsShowAll] = useState<boolean>(false);

	const getTickets = useCallback(async () => {
		setLoading(true);
		try {
			let user = isShowAll ? null : identity;
			let res = await GetAllTickets({
				page: currentPage,
				size: size,
				user,
			});
			if (res) {
				setTimeout(() => {
					setTickets(res.result.data);
					setItems(res.result.count);
					setLoading(false);
				}, 300);
			}
		} catch {
			toast.error("خطایی رخ داد!");
		}
	}, [currentPage, identity, isShowAll, size]);

	useEffect(() => {
		getTickets();
	}, [currentPage, getTickets, isShowAll]);

	return (
		<>
			{isModal && (
				<AddNewTicket
					key={"addTicket"}
					isShow={isModal}
					setShow={setIsModal}
					getData={getTickets}
				/>
			)}

			<Layout.Root>
				<Layout.Head title={"لیست تیکت ها"}>
					<Button
						variant="primary"
						type="button"
						onClick={() => setIsModal(true)}
					>
						<FaPlus />
						<span>تیکت جدید</span>
					</Button>

					{isAdmin && (
						<Button
							type="button"
							variant="secondary"
							onClick={() => !loading && setIsShowAll(!isShowAll)}
						>
							<Spinner loading={loading} size="sm">
								{isShowAll ? "تیکت های من" : "همه تیکت ها"}
							</Spinner>
						</Button>
					)}
				</Layout.Head>

				<Layout.Content>
					<div className="grid grid-cols-12 gap-6">
						<div className="col-span-full 2xl:col-span-8">
							<TicketsList
								parentNode="tickets"
								loading={loading}
								tickets={tickets}
								getData={getTickets}
								setLoading={setLoading}
							/>

							<div className="w-full py-4">
								<Pagination
									items={items}
									currentPage={currentPage}
									size={size}
									onPageChange={setCurrentPage}
									loading={loading}
									setSize={setSize}
								/>
							</div>
						</div>

						<div className="col-span-full 2xl:col-span-4">
							<TicketItem />
						</div>
					</div>
				</Layout.Content>
			</Layout.Root>
		</>
	);
}
