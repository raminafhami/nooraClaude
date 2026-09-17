"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FaLeftLong } from "react-icons/fa6";

import { Buyer } from "@/buyers/models/Buyer";
import { getBuyerById } from "@/buyers/services/getBuyerById";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DynamicLink } from "@/components/ui/dynamic-link";
import { Layout } from "@/ui/Layout";
import { Loading } from "@/ui/Loader";
import { omitUndefinedProperties } from "@/utils/object/omitUndefinedProperties";

import { BuyerActivitiesWidget } from "./activities/BuyerActivitiesWidget";
import { BuyerContext, BuyerContextType } from "./BuyerContext";
import { BuyerInfoWidget } from "./info/BuyerInfoWidget";
import { BuyerRequestsWidget } from "./requests/BuyerRequestsWidget";

function BuyerClient({ id }: { id: string }) {
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [buyer, setBuyer] = useState<Buyer>();

	const handleBuyerUpdate = useCallback((buyer: Partial<Buyer>) => {
		setBuyer((previous) => ({
			...(previous ?? {}),
			...(omitUndefinedProperties(buyer) as Buyer),
		}));
	}, []);

	useEffect(() => {
		async function init() {
			try {
				setIsLoading(true);
				setErrorMessage(null);

				const buyer = await getBuyerById(id);

				if (buyer === null) {
					throw new Error("buyer is not found.");
				}

				setBuyer(buyer);
			} catch (err) {
				console.error(err);
				setErrorMessage("خطای نامشخصی رخ داد.");
			} finally {
				setIsLoading(false);
			}
		}

		init();
	}, [id]);

	const ctxValue = useMemo<BuyerContextType>(
		() => ({ buyer: buyer ?? ({} as Buyer), handleUpdate: handleBuyerUpdate }),
		[buyer, handleBuyerUpdate],
	);

	if (isLoading) {
		return <Loading>در حال دریافت اطلاعات...</Loading>;
	}

	if (errorMessage || !buyer) {
		return <div>{errorMessage}</div>;
	}

	return (
		<Layout.Root>
			<Layout.Head
				title={
					<div className="flex items-center gap-3">
						<span>{`خریدار: ${buyer.name}`}</span>
						{buyer.isDeleted && <Badge variant="destructive">غیرفعال</Badge>}
					</div>
				}
			>
				<div className="sm:ms-auto">
					<DynamicLink href="/dashboard/contacts?tab=buyers">
						<Button>
							<FaLeftLong />
							<span>بازگشت به لیست</span>
						</Button>
					</DynamicLink>
				</div>
			</Layout.Head>
			<Layout.Content>
				<BuyerContext.Provider value={ctxValue}>
					<div className="grid grid-cols-12 gap-6">
						<BuyerInfoWidget />
						<BuyerActivitiesWidget />
						<BuyerRequestsWidget />
					</div>
				</BuyerContext.Provider>
			</Layout.Content>
		</Layout.Root>
	);
}

export { BuyerClient };
