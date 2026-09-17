"use client";

import { memo, useEffect, useState } from "react";

import GetAllTickets from "@/api/ticketsapi/getAllTickets";
import { TicketsList } from "@/app/dashboard/tickets-list/_components/TicketsList";
import Pagination from "@/components/ui/pagination/Pagination";
import { Layout } from "@/ui/Layout";
import { Loading } from "@/ui/Loader";
import { Panel } from "@/ui/Panel";

interface Props {
	caseNo: string;
}

export const PageTicket = memo(function PageTicket({
	caseNo,
}: Props): React.ReactNode {
	const [loading, setLoading] = useState<boolean>(true); //should be true
	const [items, setItems] = useState<number>(0);
	const [currentPage, setCurrentPage] = useState<number>(0);
	const [size, setSize] = useState<number>(10);
	const [tickets, setTickets] = useState<any>();

	useEffect(() => {
		if (caseNo) {
			getTickets();
		}
	}, [currentPage, caseNo]);

	async function getTickets() {
		setLoading(true);
		let res = await GetAllTickets({
			page: currentPage,
			size: size,
			reference: caseNo,
			referenceType: "instance-inspection",
		});
		if (res) {
			setTickets(res.result.data);
			setItems(res.result.count);
		}
		setLoading(false);
	}
	return (
		<>
			<Layout.Root>
				<Layout.Content>
					{loading ? (
						<Loading size="md" />
					) : tickets?.length ? (
						<>
							<Panel.Root>
								<Panel.Container className="py-0">
									<TicketsList
										parentNode="instance"
										loading={loading}
										tickets={tickets}
										getData={getTickets}
										setLoading={setLoading}
									/>
								</Panel.Container>
							</Panel.Root>

							<Pagination
								items={items}
								currentPage={currentPage}
								size={size}
								onPageChange={setCurrentPage}
								loading={loading}
								setSize={setSize}
							/>
						</>
					) : (
						"تیکتی یافت نشد..."
					)}
				</Layout.Content>
			</Layout.Root>
		</>
	);
});
