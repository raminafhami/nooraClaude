"use client";

import { useEffect } from "react";

import { useToggle } from "./useToggle";

interface UseDeferredToggleDto {
  status: boolean;
  delay?: number;
  onToggleOff?: () => void;
}

type UseDeferredToggleReturn = boolean;

function useDeferredToggle({
  status: statusOne,
  delay = 300,
  onToggleOff,
}: UseDeferredToggleDto): UseDeferredToggleReturn {
  const [statusTwo, setStatusTwo] = useToggle(statusOne);

  useEffect(() => {
    if (statusOne) {
      setStatusTwo(true);
    } else if (!statusOne && statusTwo) {
      if (delay) {
        setTimeout(() => {
          setStatusTwo(false);
          onToggleOff?.();
        }, delay);
      } else {
        setStatusTwo(false);
        onToggleOff?.();
      }
    }
  }, [statusOne, statusTwo, delay, setStatusTwo, onToggleOff]);

  return statusOne || statusTwo;
}

export type { UseDeferredToggleDto };
export { useDeferredToggle };
