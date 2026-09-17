"use client";

import { forwardRef, Ref } from "react";
import { twMerge } from "tailwind-merge";

import { MaskInput, MaskInputProps } from "./MaskInput";

export const EmailInput = forwardRef<HTMLInputElement, MaskInputProps>(
  function EmailInput(
    { className, mask = "", maskOptions, ...props }: MaskInputProps,
    ref: Ref<HTMLInputElement>
  ) {
    const options = {
      mask: /^\S*@?\S*$/,
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
