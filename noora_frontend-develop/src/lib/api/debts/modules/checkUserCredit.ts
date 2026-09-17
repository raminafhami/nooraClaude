import { DependencyList, useCallback } from "react";
import { toast } from "sonner";

import getDebtsByUserId from "../getDebtsByUserId";

interface User {
  id?: string;
  name?: string;
}

interface UseCheckUserCreditProps {
  users: User[];
  deps?: DependencyList;
}

export default function useCheckUserCredit({
  users,
  deps = [],
}: UseCheckUserCreditProps) {
  const checkDebt = useCallback(async () => {
    for (const item of users) {
      try {
        if (item.id) {
          const res = await getDebtsByUserId({
            page: 0,
            size: Number.MAX_SAFE_INTEGER,
            userId: item.id,
          });

          if (res && res.remainedCredit < 0) {
            toast.error(`اعتبار ${item.name} برای صدور گواهی کافی نمی‌باشد.`);
            return false; // Return false if any user's remainedCredit is less than 0
          }
        }
      } catch (e) {
        console.log(e);
      }
    }
    return true; // Return true if all users' remainedCredit are >= 0
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users, ...deps]);

  return checkDebt;
}
