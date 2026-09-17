import { PropsWithChildren } from "react";

import { useDeferredToggle } from "@/hooks/useDeferredToggle";

const Conditional = ({
  children,
  mount,
  delay,
  onUnmount,
}: PropsWithChildren<{
  mount: boolean;
  delay?: number | boolean;
  onUnmount?: () => void;
}>) => {
  const show = useDeferredToggle({
    status: mount,
    delay: typeof delay === "number" ? delay : delay ? undefined : 0,
    onToggleOff: onUnmount,
  });

  return <>{show && children}</>;
};
Conditional.displayName = "Conditional";

export { Conditional };
