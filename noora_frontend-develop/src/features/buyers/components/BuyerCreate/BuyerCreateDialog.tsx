"use client";

import { Buyer } from "@/buyers/models/Buyer";
import { Conditional } from "@/components/ui/conditional";
import { Dialog } from "@/components/ui/dialog";

import { BuyerCreateWidget } from "./BuyerCreateWidget";

interface Props {
  open: boolean;
  onCreate?: (buyer: Buyer) => void;
  onClose: () => void;
}

function BuyerCreateDialog({ open, onCreate, onClose }: Props) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <Conditional mount={open} delay>
        <BuyerCreateWidget onCreate={onCreate} onClose={onClose} />
      </Conditional>
    </Dialog>
  );
}

export { BuyerCreateDialog };
