"use client";

import { type Ref, forwardRef } from "react";
import { twMerge } from "tailwind-merge";
import { MaskInput, MaskInputProps } from "./MaskInput";

export const MobileNoInput = forwardRef<HTMLInputElement, MaskInputProps>(
  function MobileNoInput(
    { className, mask = "", maskOptions, ...props }: MaskInputProps,
    ref: Ref<HTMLInputElement>
  ) {
    const options = {
      mask: "!@#########",
      definitions: { "!": /[0]/, "@": /[9]/, "#": /[0-9]/ },
    };

    return (
      <MaskInput
        className={twMerge(
          "pt-2.5 pb-1.5 text-right tracking-wider placeholder:tracking-normal",
          className
        )}
        dir="ltr"
        ref={ref}
        {...{ ...options, ...maskOptions }}
        {...props}
      />
    );
  }
);
