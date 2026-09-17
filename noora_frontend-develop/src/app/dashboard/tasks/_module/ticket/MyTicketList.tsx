"use client";

import { useCallback } from "react";

import GetAllTickets from "@/api/ticketsapi/getAllTickets";
import TicketItem from "@/app/dashboard/tickets-list/_components/TicketItem";
import { TicketsList } from "@/app/dashboard/tickets-list/_components/TicketsList";
import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import { usePagination } from "@/components/ui/pagination/usePagination";
import { Layout } from "@/ui/Layout";
import { Loading } from "@/ui/Loader";

function MyTicketList() {
	const { identity } = useLoggedInUser();

	// list
	const fetchTickets = useCallback(
		async (page: number, pageSize: number) => {
			const response = await GetAllTickets({
				page,
				size: pageSize,
				user: { id: identity.id },
			});

			return [response.result.data, response.result.count] as const;
		},
		[identity.id],
	);

	const {
		items: tickets,
		isLoading,
		error,
		offset,
		refetch,
		Pagination,
	} = usePagination(fetchTickets);

	return (
		<>
			<Layout.Root>
				<Layout.Content>
					{isLoading ? (
						<Loading size="md" />
					) : tickets?.length ? (
						<div className="grid grid-cols-12 gap-6">
							<div className="col-span-full 2xl:col-span-8">
								<TicketsList
									parentNode="tickets"
									loading={isLoading}
									tickets={tickets}
									getData={refetch}
									setLoading={() => {}}
								/>

								<div className="w-full py-4">
									<Pagination />
								</div>
							</div>

							<div className="col-span-full 2xl:col-span-4">
								<TicketItem />
							</div>
						</div>
					) : (
						"هیچ تیکتی یافت نشد."
					)}
				</Layout.Content>
			</Layout.Root>
		</>
	);
}

export { MyTicketList };
