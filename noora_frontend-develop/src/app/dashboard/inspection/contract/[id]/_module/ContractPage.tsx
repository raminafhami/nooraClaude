"use client";

import { useCallback, useEffect, useState } from "react";
import { FaLeftLong } from "react-icons/fa6";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { DynamicLink } from "@/components/ui/dynamic-link";
import { Spinner } from "@/components/ui/spinner";
import { ContractNumber } from "@/contract-number/models/ContractNumber";
import { getContractNumbers } from "@/contract-number/services/getContractNumbers";
import { Layout } from "@/ui/Layout";

import { ContractInfo } from "./ContractInfo";
import { ContractInstanceList } from "./ContractInstanceList";

function ContractPage({ id }: { id: string }) {
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [contract, setContract] = useState<ContractNumber>();

	const contractQueryFn = useCallback(async () => {
		try {
			setIsLoading(true);

			const contract = await getContractNumbers({
				filters: { _id: id },
				populate: ["buyerId", "customerId", "branchId"],
			}).then((response) => response[0]);

			setContract(contract);
		} catch (err) {
			console.error(err);
			toast.error("خطای نامشخصی در هنگام دریافت اطلاعات رخ داد.");
		} finally {
			setIsLoading(false);
		}
	}, [id]);

	useEffect(() => {
		contractQueryFn();
	}, [contractQueryFn]);

	return (
		<Layout.Root>
			<Layout.Head title="جزییات قرارداد">
				<div className="ms-auto">
					<DynamicLink href="/dashboard/inspection?view=contract" passHref>
						<Button>
							<FaLeftLong />
							<span>بازگشت به لیست</span>
						</Button>
					</DynamicLink>
				</div>
			</Layout.Head>
			<Layout.Content>
				{isLoading && <Spinner label="در حال دریافت اطلاعات..." size="sm" />}

				{!isLoading && (
					<div className="grid grid-cols-12 gap-6">
						<div className="col-span-full">
							<ContractInfo contract={contract} onChange={contractQueryFn} />
						</div>

						<div className="col-span-full">
							<ContractInstanceList contract={contract} />
						</div>
					</div>
				)}
			</Layout.Content>
		</Layout.Root>
	);
}

export { ContractPage };
