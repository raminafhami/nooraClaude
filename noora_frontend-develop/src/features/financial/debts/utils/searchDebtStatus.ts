import { ObjectType } from "@/utils/object/ObjectType";

import { DebtStatus } from "../enums/DebtStatus";

function searchDebtStatus(value: DebtStatus): ObjectType<"isPaid"> {
  return {
    isPaid: value === DebtStatus.Paid,
  };
}

export { searchDebtStatus };
