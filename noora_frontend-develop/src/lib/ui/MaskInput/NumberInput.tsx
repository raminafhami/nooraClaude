"use client";

import { forwardRef, Ref } from "react";

import { MaskInput, MaskInputProps } from "./MaskInput";

export const NumberInput = forwardRef<HTMLInputElement, MaskInputProps>(
  function NumberInput(
    { mask = "", maskOptions, ...props }: MaskInputProps,
    ref: Ref<HTMLInputElement>
  ) {
    const options = {
      mask: Number,
      scale: 2,
      radix: ".",
      mapToRadix: ["."],
    };

    return (
      <MaskInput ref={ref} {...{ ...options, ...maskOptions }} {...props} />
    );
  }
);
