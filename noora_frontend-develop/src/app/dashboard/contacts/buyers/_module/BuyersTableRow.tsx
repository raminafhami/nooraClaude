import { FaEye } from "react-icons/fa6";

import { buyerType } from "@/buyers/enums/BuyerType";
import { Buyer } from "@/buyers/models/Buyer";
import { Badge } from "@/components/ui/badge";
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
import { cn } from "@/lib/utils";
import { toPostalCode } from "@/utils/String";

function BuyersTableRow({ buyer, index }: { buyer: Buyer; index: number }) {
	return (
		<TableRow
			className={cn("whitespace-nowrap", buyer.isDeleted && "opacity-50")}
		>
			<TableCell>{index}</TableCell>
			<TableCell>
				<DynamicLink
					className="flex cursor-pointer flex-col gap-y-2"
					href={`/dashboard/contacts/buyers/${buyer.id}`}
				>
					<div className="flex items-center gap-2">
						<span>{buyer.name || buyer.nameEn}</span>
						{buyer.isDeleted && <Badge variant="destructive">غیرفعال</Badge>}
					</div>
					{buyer.name && buyer.nameEn && (
						<span className="text-xs text-muted-foreground">
							{buyer.nameEn}
						</span>
					)}
				</DynamicLink>
			</TableCell>
			<TableCell>{buyerType[buyer.type].title}</TableCell>
			<TableCell className="tracking-wide">
				{buyer.nationalCode || "-"}
			</TableCell>
			<TableCell className="tracking-wide">{buyer.phoneNo || "-"}</TableCell>
			<TableCell>{buyer.email || "-"}</TableCell>
			<TableCell className="tracking-wide">
				{buyer.postalCode ? toPostalCode(buyer.postalCode) : "-"}
			</TableCell>
			<TableCell>
				<div className="min-w-96 max-w-[32rem] whitespace-normal">
					{buyer.address || "-"}
				</div>
			</TableCell>
			<TableCell>
				<TooltipProvider>
					<TableActions>
						<Tooltip>
							<TableAction>
								<TooltipTrigger asChild>
									<DynamicLink
										className="flex h-full items-center"
										href={`/dashboard/contacts/buyers/${buyer.id}`}
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
								<TooltipContent>مشاهده خریدار</TooltipContent>
							</TableAction>
						</Tooltip>
					</TableActions>
				</TooltipProvider>
			</TableCell>
		</TableRow>
	);
}

export { BuyersTableRow };
