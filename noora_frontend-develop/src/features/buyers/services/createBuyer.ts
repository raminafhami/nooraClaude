import apiClient from "@/api/client";

import { BuyerReferralSource } from "../enums/BuyerReferralSource";
import { BuyerType } from "../enums/BuyerType";
import { Buyer } from "../models/Buyer";
import { BuyerApi } from "../models/BuyerApi";
import { parseBuyer } from "../utils/parseBuyer";

interface CreateBuyerDto {
  branchId: string | null;
  type: BuyerType;
  name: string;
  nameEn: string;
  nationalCode: string;
  registrationNo?: string;
  phoneNo: string;
  faxNo: string | null;
  email: string | null;
  postalCode: string;
  address: string;
  industryId?: string | null;
  subIndustryId?: string | null;
  referralSource?: BuyerReferralSource | null;
  sepidarId?: string | null;
}

type BuyerCreateApi = {
  branches: string[];
  name: string;
  type: BuyerType;
  userId: string | null;
  nationalCode: string;
  postalCode: string;
  contactNo: string[];
  address: string;
  industryId: string | undefined;
  subIndustryId: string | undefined;
  referralSource: BuyerReferralSource | undefined;
  metadata: {
    nameEn: string;
    registrationNo?: string;
    email: string | null;
    sepidarId: string | null;
  };
};

async function createBuyer(details: CreateBuyerDto): Promise<Buyer> {
  const data: BuyerCreateApi = {
    branches: details.branchId ? [details.branchId] : [],
    type: details.type,
    name: details.name,
    userId: null,
    nationalCode: details.nationalCode,
    postalCode: details.postalCode,
    contactNo: [],
    address: details.address,
    industryId: details.industryId ?? undefined,
    subIndustryId: details.subIndustryId ?? undefined,
    referralSource: details.referralSource ?? undefined,
    metadata: {
      nameEn: details.nameEn,
      registrationNo:
        details.type === BuyerType.Legal ? details.registrationNo : undefined,
      email: details.email,
      sepidarId: details.sepidarId || null,
    },
  };

  if (details.phoneNo) {
    data.contactNo.push(`p:${details.phoneNo}`);
  }

  if (details.faxNo) {
    data.contactNo.push(`f:${details.faxNo}`);
  }

  const response = await apiClient.post<BuyerApi>({
    url: "buyers",
    body: data,
  });

  return parseBuyer(response.result);
}

export { createBuyer };
