"use client";

import { useCallback, useState } from "react";

import { Buyer } from "@/buyers/models/Buyer";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Seperator } from "@/ui/Seperator";

import { BuyerCreateBranchForm } from "./BuyerCreateBranchForm";
import { BuyerCreateInitialForm } from "./BuyerCreateInitialForm";
import { BuyerCreateNewForm } from "./BuyerCreateNewForm";

enum WidgetMode {
  Create = "create",
  AddToBranch = "addToBranch",
}

interface Props {
  onCreate?: (buyer: Buyer) => void;
  onClose: () => void;
}

function BuyerCreateWidget({ onCreate, onClose }: Props) {
  const [mode, setMode] = useState<WidgetMode | null>(null);

  const [buyer, setBuyer] = useState<Buyer | null>(null);

  const handleModeSwitch = useCallback((mode: WidgetMode, buyer: Buyer) => {
    if (buyer) {
      setBuyer(buyer);
    }

    setMode(mode);
  }, []);

  return (
    <DialogContent
      className="max-w-screen-md"
      onPointerDownOutside={(e) => {
        if (mode) e.preventDefault();
      }}
    >
      <DialogHeader>
        <DialogTitle>افزودن خریدار جدید</DialogTitle>
      </DialogHeader>

      <div className="space-y-8">
        <BuyerCreateInitialForm
          onModeSwitch={handleModeSwitch}
          onClose={onClose}
        />

        {mode && buyer && (
          <>
            <Seperator />

            {mode === WidgetMode.Create ? (
              <BuyerCreateNewForm
                buyer={buyer}
                onCreate={onCreate}
                onClose={onClose}
              />
            ) : (
              <BuyerCreateBranchForm
                buyer={buyer}
                onCreate={onCreate}
                onClose={onClose}
              />
            )}
          </>
        )}
      </div>
    </DialogContent>
  );
}

export { WidgetMode, BuyerCreateWidget };
