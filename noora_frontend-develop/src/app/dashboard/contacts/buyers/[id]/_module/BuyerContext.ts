"use client";

import { createContext } from "react";

import { Buyer } from "@/buyers/models/Buyer";

type BuyerContextType = {
  buyer: Buyer;
  handleUpdate: (buyer: Partial<Buyer>) => void;
};

const BuyerContext = createContext<BuyerContextType>({} as BuyerContextType);

export { type BuyerContextType, BuyerContext };
