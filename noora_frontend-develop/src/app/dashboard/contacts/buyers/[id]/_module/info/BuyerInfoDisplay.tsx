"use client";

import { buyerReferralSource } from "@/buyers/enums/BuyerReferralSource";
import { BuyerType, buyerType } from "@/buyers/enums/BuyerType";
import { CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toPostalCode } from "@/utils/String";

import { useBuyerContext } from "../useBuyerContext";

function BuyerInfoDisplay() {
	const { buyer } = useBuyerContext();

	return (
		<CardContent className="grid grid-cols-12 gap-6">
			<div className="col-span-full col-start-1 space-y-2">
				<div className="text-muted-foreground">نوع:</div>
				<div>{buyerType[buyer.type].title}</div>
			</div>

			<Separator className="col-span-full" />

			<div className="col-span-full !col-start-1 space-y-2 sm:col-span-6">
				<div className="text-muted-foreground">نام فارسی:</div>
				<div>{buyer.name}</div>
			</div>

			<div className="col-span-full col-start-1 space-y-2 sm:col-span-6">
				<div className="text-muted-foreground">نام انگلیسی:</div>
				<div>{buyer.nameEn}</div>
			</div>

			<Separator className="col-span-full" />

			<div className="col-span-full !col-start-1 space-y-2 sm:col-span-6">
				<div className="text-muted-foreground">
					{buyer.type === BuyerType.Natural ? "کد ملی" : "شناسه ملی"}:
				</div>
				<div className="tracking-wide">{buyer.nationalCode}</div>
			</div>

			{buyer.registrationNo && (
				<div className="col-span-full col-start-1 space-y-2 sm:col-span-6">
					<div className="text-muted-foreground">شماره ثبت:</div>
					<div className="tracking-wide">{buyer.registrationNo}</div>
				</div>
			)}

			<Separator className="col-span-full" />

			<div className="col-span-full !col-start-1 space-y-2 sm:col-span-6">
				<div className="text-muted-foreground">شماره تماس:</div>
				<div className="tracking-wide">
					{buyer.phoneNo
						? Array.isArray(buyer.phoneNo)
							? buyer.phoneNo[0] || "-"
							: buyer.phoneNo
						: "-"}
				</div>
			</div>

			<div className="col-span-full col-start-1 space-y-2 sm:col-span-6">
				<div className="text-muted-foreground">شماره فکس:</div>
				<div className="tracking-wide">{buyer.faxNo || "-"}</div>
			</div>

			<div className="col-span-full !col-start-1 space-y-2 sm:col-span-6">
				<div className="text-muted-foreground">پست الکترونیک:</div>
				<div>{buyer.email || "-"}</div>
			</div>

			<div className="col-span-full col-start-1 space-y-2 sm:col-span-6">
				<div className="text-muted-foreground">کد پستی:</div>
				<div className="tracking-wide">
					{buyer.postalCode && toPostalCode(buyer.postalCode)}
				</div>
			</div>

			<div className="col-span-full col-start-1 space-y-2">
				<div className="text-muted-foreground">آدرس:</div>
				<div>{buyer.address}</div>
			</div>

			<Separator className="col-span-full" />

			<div className="col-span-full !col-start-1 space-y-2 sm:col-span-6">
				<div className="text-muted-foreground">صنعت:</div>
				<div>{buyer.industry?.name || "-"}</div>
			</div>

			<div className="col-span-full col-start-1 space-y-2 sm:col-span-6">
				<div className="text-muted-foreground">زیرصنعت:</div>
				<div>{buyer.subIndustry?.name || "-"}</div>
			</div>

			<div className="col-span-full col-start-1 space-y-2">
				<div className="text-muted-foreground">نحوه آشنایی:</div>
				<div>
					{buyer.referralSource
						? buyerReferralSource[buyer.referralSource].title
						: "-"}
				</div>
			</div>

			<Separator className="col-span-full" />

			<div className="col-span-full col-start-1 space-y-2">
				<div className="text-muted-foreground">شناسه سپیدار:</div>
				<div>{buyer.sepidarId || "-"}</div>
			</div>
		</CardContent>
	);
}

export { BuyerInfoDisplay };
