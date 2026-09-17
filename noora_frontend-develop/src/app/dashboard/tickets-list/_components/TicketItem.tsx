"use client";

import { parseAsString, useQueryState } from "nuqs";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import getTicket from "@/api/ticketsapi/getTicket";
import { useLoggedInUser } from "@/auth/hooks/useLoggedInUser";
import { Button } from "@/components/ui/button";

import ChangeStatustickets from "./ChangeStatustickets";
import TicketConversation from "./modules/TicketConversation";

export default function TicketItem() {
	const { identity } = useLoggedInUser();

	const [activeTicketId] = useQueryState("ticketId", parseAsString);

	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [ticket, setTicket] = useState<any>();

	const fetchTicket = useCallback(async () => {
		if (!activeTicketId) return;

		try {
			setIsLoading(true);

			const ticket = await getTicket({ id: activeTicketId });
			setTicket(ticket);
		} catch (err) {
			console.error(err);
			toast.error("خطایی در بارگیری تیکت رخ داد!");
		} finally {
			setIsLoading(false);
		}
	}, [activeTicketId]);

	useEffect(() => {
		fetchTicket();
	}, [fetchTicket]);

	const [deleteModal, setDeleteActionModal] = useState<boolean>(false);

	if (!activeTicketId) {
		return (
			<div className="flex h-[60vh] w-full items-center justify-center rounded-2xl bg-gray-100 text-center">
				یک تیکت انتخاب کن.
			</div>
		);
	}

	if (isLoading) {
		return;
	}

	if (!ticket) {
		return (
			<div className="flex h-[60vh] w-full items-center justify-center rounded-2xl bg-gray-100 text-center">
				موردی یافت نشد
			</div>
		);
	}

	return (
		<>
			{deleteModal && identity.id === ticket?.assignee?.id && (
				<ChangeStatustickets
					getData={fetchTicket}
					setShow={setDeleteActionModal}
					isShow={deleteModal}
					data={ticket}
				/>
			)}

			<div className="overflow-hidden rounded-2xl">
				<div className="flex w-full justify-end">
					{identity.id === ticket?.assignee?.id && (
						<Button
							variant="primary"
							onClick={() => setDeleteActionModal(true)}
							className="absolute z-10 me-10 mt-[3.6rem]"
						>
							تغییر وضعیت
						</Button>
					)}
				</div>

				<TicketConversation data={ticket} getData={fetchTicket} />
			</div>
		</>
	);
}
