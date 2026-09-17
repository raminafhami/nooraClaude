import * as React from "react";

import { cn } from "@/lib/utils";

import { Input } from "./input";

export interface PasswordInputProps
  extends React.ComponentProps<typeof Input> {}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <Input
        ref={ref}
        className={cn("tracking-wider", className)}
        type={type ?? "password"}
        {...props}
      />
    );
  },
);
PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
