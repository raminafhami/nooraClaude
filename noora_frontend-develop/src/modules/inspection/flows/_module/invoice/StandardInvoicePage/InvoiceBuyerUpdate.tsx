import { useState } from "react";

import { getBuyerById } from "@/buyers/services/getBuyerById";
import { Button } from "@/components/ui/button";
import { updateInstanceData } from "@/felo/instances/services/updateInstanceData";
import { useInspectionContext } from "@/inspection/context/InspectionContext";
import { Loading } from "@/ui/Loader";

import { ids } from "./InvoiceIds";

function InvoiceBuyerUpdate() {
  const { instance, onInstanceUpdate } = useInspectionContext();

  const [isPending, setPending] = useState<boolean>(false);

  async function handleBuyerUpdate() {
    try {
      setPending(true);

      const buyer = await getBuyerById(instance.parameters[ids.buyer].id);

      const nextParameters = {
        [ids.buyer]: buyer,
      };
      await updateInstanceData(instance.id, nextParameters);
      onInstanceUpdate(nextParameters);
    } catch (err: any) {
    } finally {
      setPending(false);
    }
  }

  return (
    <Button
      className="flex gap-2"
      disabled={isPending}
      onClick={handleBuyerUpdate}
    >
      {isPending && <Loading size="xs" />}
      <span>بروزرسانی اطلاعات خریدار</span>
    </Button>
  );
}

export { InvoiceBuyerUpdate };
