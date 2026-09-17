"use client";

import { memo, useCallback, useState } from "react";
import { FaPlus } from "react-icons/fa6";

import GetAllTickets from "@/api/ticketsapi/getAllTickets";
import AddNewTicket from "@/app/dashboard/tickets-list/_components/modal/AddNewTicket";
import TicketItem from "@/app/dashboard/tickets-list/_components/TicketItem";
import { TicketsList } from "@/app/dashboard/tickets-list/_components/TicketsList";
import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import { Button } from "@/components/ui/button";
import { usePagination } from "@/components/ui/pagination/usePagination";
import { Instance } from "@/felo/instances/models/Instance";
import { Layout } from "@/ui/Layout";
import { Loading } from "@/ui/Loader";

function InspectionTicketList({
	instance: { caseNo },
}: {
	instance: Instance;
}) {
	const { identity } = useLoggedInUser();

	// upsert dialog
	const [isModal, setIsModal] = useState<boolean>(false);

	// list
	const isAdmin = identity.groups.includes("ceo");

	const fetchTickets = useCallback(
		async (page: number, pageSize: number) => {
			const user = !isAdmin ? { id: identity.id } : undefined;

			const response = await GetAllTickets({
				page,
				size: pageSize,
				reference: caseNo,
				referenceType: "instance-inspection",
				user,
			});

			return [response.result.data, response.result.count] as [any[], number];
		},
		[identity.id, caseNo, isAdmin],
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
			{isModal && (
				<AddNewTicket
					isShow={isModal}
					setShow={setIsModal}
					getData={refetch}
					isExternal
					caseNumber={caseNo}
					refType="instance-inspection"
				/>
			)}

			<Layout.Root>
				<Layout.Content>
					<div>
						<Button variant="primary" onClick={() => setIsModal(true)}>
							<FaPlus />
							<span>تیکت جدید</span>
						</Button>
					</div>
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

const MemoizedInspectionTicketList = memo(InspectionTicketList);

export { MemoizedInspectionTicketList as InspectionTicketList };
