import {
	BuyerReferralSource,
	buyerReferralSource,
} from "@/buyers/enums/BuyerReferralSource";
import { CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { asNavigationProp } from "@/utils/asNavigationProp";

import { useCustomerContext } from "../CustomerContext";

function CustomerInfoDisplay() {
	const { customer } = useCustomerContext();

	const moneyReturn = customer.metadata.moneyReturn;

	return (
		<CardContent className="grid grid-cols-12 gap-6">
			<div className="col-span-full space-y-2 sm:col-span-6 lg:col-span-3 xl:col-span-6 2xl:col-span-3">
				<div className="text-muted-foreground">نام</div>
				<div>{customer.fullname}</div>
			</div>

			<div className="col-span-full space-y-2 sm:col-span-6 lg:col-span-3 xl:col-span-6 2xl:col-span-3">
				<div className="text-muted-foreground">کد ملی</div>
				<div className="tracking-wide">{customer.nationalCode || "-"}</div>
			</div>

			<div className="col-span-full space-y-2 sm:col-span-6 lg:col-span-3 xl:col-span-6 2xl:col-span-3">
				<div className="text-muted-foreground">شماره همراه</div>
				<div className="tracking-wide">{customer.phoneNo || "-"}</div>
			</div>

			<div className="col-span-full space-y-2 sm:col-span-6 lg:col-span-3 xl:col-span-6 2xl:col-span-3">
				<div className="text-muted-foreground">پست الکترونیک</div>
				<div>{customer.email || "-"}</div>
			</div>

			<Separator className="col-span-full" />

			<div className="col-span-full space-y-2 sm:col-span-6 lg:col-span-3 xl:col-span-6 2xl:col-span-3">
				<div className="text-muted-foreground">صنعت</div>
				<div>{asNavigationProp(customer.industryId)?.name ?? "-"}</div>
			</div>

			<div className="col-span-full space-y-2 sm:col-span-6 lg:col-span-3 xl:col-span-6 2xl:col-span-3">
				<div className="text-muted-foreground">زیرصنعت</div>
				<div>{asNavigationProp(customer.subIndustryId)?.name ?? "-"}</div>
			</div>

			<div className="col-span-full space-y-2 sm:col-span-6 lg:col-span-3 xl:col-span-6 2xl:col-span-3">
				<div className="text-muted-foreground">نحوه آشنایی</div>
				<div>
					{(customer.referralSource &&
						buyerReferralSource[customer.referralSource as BuyerReferralSource]
							?.title) ||
						"-"}
				</div>
			</div>

			<Separator className="col-span-full" />

			<div className="col-span-full space-y-2 sm:col-span-6 lg:col-span-3 xl:col-span-6 2xl:col-span-3">
				<div className="text-muted-foreground">بازگشت مبلغ</div>
				<div>{moneyReturn ? "دارد" : "ندارد"}</div>
			</div>

			<Separator className="col-span-full" />

			<div className="col-span-full space-y-2 sm:col-span-6 lg:col-span-3 xl:col-span-6 2xl:col-span-3">
				<div className="text-muted-foreground">شناسه سپیدار</div>
				<div className="tracking-wide">{customer.sepidarId || "-"}</div>
			</div>
		</CardContent>
	);
}

export default CustomerInfoDisplay;
