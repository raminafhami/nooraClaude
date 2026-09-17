import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

export const inputClasses =
  "flex h-10 w-full rounded-xl border border-gray-200 bg-background px-3 py-2 file:border-0 file:bg-transparent placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50";

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(inputClasses, className)}
        type={type}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
