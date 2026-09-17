import { FaEye, FaRegCreditCard } from "react-icons/fa6";

import { Button } from "@/components/ui/button";
import { DynamicLink } from "@/components/ui/dynamic-link";
import {
	TableAction,
	TableActions,
	TableCell,
	TableRow,
} from "@/components/ui/table";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { User } from "@/identity/users/models/User";

function CustomersTableRow({
	customer,
	coordinator,
	marketer,
	index,
	canChangeCredit,
	onCredit,
}: {
	customer: User;
	coordinator: User | undefined;
	marketer: User | undefined;
	index: number;
	canChangeCredit: boolean;
	onCredit: (customer: User) => void;
}) {
	return (
		<TableRow className="whitespace-nowrap">
			<TableCell>{index + 1}</TableCell>
			<TableCell>
				<DynamicLink href={`/dashboard/contacts/customers/${customer.id}`}>
					{customer.fullname}
				</DynamicLink>
			</TableCell>
			<TableCell className="tracking-wide">
				{customer.nationalCode || "-"}
			</TableCell>
			<TableCell className="tracking-wide">{customer.phoneNo || "-"}</TableCell>
			<TableCell className="tracking-wide">{customer.email || "-"}</TableCell>
			<TableCell>{coordinator?.fullname || "-"}</TableCell>
			<TableCell>{marketer?.fullname || "-"}</TableCell>
			<TableCell>
				<TooltipProvider>
					<TableActions>
						<Tooltip>
							<TableAction>
								<TooltipTrigger asChild>
									<DynamicLink
										className="flex h-full items-center"
										href={`/dashboard/contacts/customers/${customer.id}`}
									>
										<Button
											className="h-full focus-within:text-blue-600 hover:text-blue-600 active:text-blue-600"
											size="icon"
											variant="ghost"
										>
											<FaEye />
										</Button>
									</DynamicLink>
								</TooltipTrigger>
								<TooltipContent>مشاهده مشتری</TooltipContent>
							</TableAction>
						</Tooltip>

						{canChangeCredit && (
							<Tooltip>
								<TableAction>
									<TooltipTrigger asChild>
										<Button
											className="h-full focus-within:text-yellow-600 hover:text-yellow-600 active:text-yellow-600"
											size="icon"
											variant="ghost"
											onClick={() => {
												onCredit(customer);
											}}
										>
											<FaRegCreditCard />
										</Button>
									</TooltipTrigger>
									<TooltipContent>اعتبار مشتری</TooltipContent>
								</TableAction>
							</Tooltip>
						)}
					</TableActions>
				</TooltipProvider>
			</TableCell>
		</TableRow>
	);
}

export { CustomersTableRow };
