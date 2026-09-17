import { useContext } from "react";

import { BuyerContext, BuyerContextType } from "./BuyerContext";

function useBuyerContext(): BuyerContextType {
  return useContext(BuyerContext);
}

export { useBuyerContext };
