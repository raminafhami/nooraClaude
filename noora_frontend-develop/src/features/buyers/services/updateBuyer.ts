import apiClient from "@/api/client";

import { BuyerReferralSource } from "../enums/BuyerReferralSource";
import { BuyerType } from "../enums/BuyerType";
import { Buyer } from "../models/Buyer";
import { BuyerApi } from "../models/BuyerApi";
import { parseBuyer } from "../utils/parseBuyer";
import { getBuyerById } from "./getBuyerById";

interface BuyerUpdateDto {
  name?: string;
  nameEn?: string;
  nationalCode?: string;
  registrationNo?: string;
  phoneNo?: string;
  faxNo?: string | null;
  email?: string | null;
  postalCode?: string;
  address?: string;
  industryId?: string | null;
  subIndustryId?: string | null;
  referralSource?: BuyerReferralSource | null;
  sepidarId?: string | null;
}

type BuyerUpdateApi = {
  name?: string;
  nationalCode?: string;
  postalCode?: string;
  contactNo?: string[];
  address?: string;
  industryId?: string | null;
  subIndustryId?: string | null;
  referralSource?: BuyerReferralSource | null;
  metadata?: {
    nameEn?: string;
    registrationNo?: string;
    email?: string | null;
    sepidarId?: string | null;
  };
};

async function updateBuyer(
  id: string,
  details: BuyerUpdateDto,
): Promise<Buyer> {
  const buyer = await getBuyerById(id);

  if (!buyer) {
    throw new Error("buyer not found.");
  }

  const data: BuyerUpdateApi = {};

  if (typeof details.name !== "undefined") data.name = details.name;

  if (typeof details.nationalCode !== "undefined")
    data.nationalCode = details.nationalCode;

  if (typeof details.postalCode !== "undefined")
    data.postalCode = details.postalCode;

  if (typeof details.address !== "undefined") data.address = details.address;

  if (typeof details.industryId !== "undefined")
    data.industryId = details.industryId;
  if (typeof details.subIndustryId !== "undefined")
    data.subIndustryId = details.subIndustryId;
  if (typeof details.referralSource !== "undefined")
    data.referralSource = details.referralSource;

  // contactNo array
  data.contactNo = [];

  if (typeof details.phoneNo !== "undefined") {
    data.contactNo.push(`p:${details.phoneNo}`);
  } else if (buyer.phoneNo) {
    data.contactNo.push(buyer.phoneNo);
  }

  if (typeof details.faxNo !== "undefined") {
    if (details.faxNo) {
      data.contactNo.push(`f:${details.faxNo}`);
    }
  } else if (buyer.faxNo) {
    data.contactNo.push(`f:${buyer.faxNo}`);
  }

  data.metadata = {};

  data.metadata.nameEn =
    typeof details.nameEn !== "undefined" ? details.nameEn : buyer.nameEn;
  data.metadata.email =
    typeof details.email !== "undefined" ? details.email : buyer.email;

  if (buyer.type === BuyerType.Legal) {
    data.metadata.registrationNo =
      typeof details.registrationNo !== "undefined"
        ? details.registrationNo
        : buyer.registrationNo;
  }

  data.metadata.sepidarId =
    typeof details.sepidarId !== "undefined"
      ? details.sepidarId
      : buyer.sepidarId;

  const response = await apiClient.put<BuyerApi>({
    url: `/buyers/${id}`,
    body: data,
  });

  return parseBuyer(response.result);
}

export { updateBuyer };
