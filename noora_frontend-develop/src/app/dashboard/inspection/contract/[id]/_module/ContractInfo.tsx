"use client";

import dynamic from "next/dynamic";
import { FaInfo, FaPencil } from "react-icons/fa6";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardIcon,
	CardNav,
	CardTitle,
} from "@/components/ui/card";
import { useDialogs } from "@/components/ui/dialog/use-dialogs";
import { Numeric } from "@/components/ui/numeric";
import { ContractNumber } from "@/contract-number/models/ContractNumber";
import { getUserFullname } from "@/identity/users/utils/getUserFullname";
import { asNavigationProp } from "@/utils/asNavigationProp";

const ContractNumberUpsertDialog = dynamic(() =>
	import(
		"@/contract-number/components/contract-number-upsert/ContractNumberUpsertDialog"
	).then((x) => x.ContractNumberUpsertDialog),
);

const ContractInfo = ({
	contract,
	onChange,
}: {
	contract: ContractNumber | undefined;
	onChange: () => void;
}) => {
	const dialogs = useDialogs();

	return (
		<Card>
			<CardHeader orientation="horizontal">
				<CardTitle>
					<CardIcon>
						<FaInfo />
					</CardIcon>
					اطلاعات قرارداد
				</CardTitle>

				{contract && (
					<CardNav>
						<Button
							variant="secondary"
							onClick={async () => {
								const result = await dialogs.open(
									ContractNumberUpsertDialog,
									contract,
								);

								if (result) {
									onChange();
								}
							}}
						>
							<FaPencil />
							ویرایش اطلاعات
						</Button>
					</CardNav>
				)}
			</CardHeader>

			<CardContent>
				<div className="grid grid-cols-12 gap-8">
					<div className="col-span-full flex flex-col gap-2 xs:col-span-6 md:col-span-4 lg:col-span-3 xl:col-span-2">
						<div className="text-muted-foreground">عنوان</div>
						<span>{contract?.title}</span>
					</div>
					<div className="col-span-full flex flex-col gap-2 xs:col-span-6 md:col-span-4 lg:col-span-3 xl:col-span-2">
						<div className="text-muted-foreground">شماره قرارداد</div>
						<span>
							<Numeric value={contract?.cn} />
						</span>
					</div>
					<div className="col-span-full flex flex-col gap-2 xs:col-span-6 md:col-span-4 lg:col-span-3 xl:col-span-2">
						<div className="text-muted-foreground"> خریدار</div>
						<span>{asNavigationProp(contract?.buyerId)?.name}</span>
					</div>
					<div className="col-span-full flex flex-col gap-2 xs:col-span-6 md:col-span-4 lg:col-span-3 xl:col-span-2">
						<div className="text-muted-foreground">مشتری</div>
						<span>
							{getUserFullname(asNavigationProp(contract?.customerId)) || "-"}
						</span>
					</div>
					<div className="col-span-full flex flex-col gap-2 xs:col-span-6 md:col-span-4 lg:col-span-3 xl:col-span-2">
						<div className="text-muted-foreground">شماره پروفرما</div>
						<span>
							<Numeric value={contract?.proforma || "-"} />
						</span>
					</div>
				</div>
			</CardContent>
		</Card>
	);
};

export { ContractInfo };
