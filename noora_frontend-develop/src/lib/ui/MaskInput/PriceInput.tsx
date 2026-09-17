"use client";

import { forwardRef, Ref } from "react";

import { MaskInputProps } from "./MaskInput";
import { NumberInput } from "./NumberInput";

export const PriceInput = forwardRef<HTMLInputElement, MaskInputProps>(
  function PriceInput(
    { mask = "", maskOptions, ...props }: MaskInputProps,
    ref: Ref<HTMLInputElement>
  ) {
    const options = {
      thousandsSeparator: ",",
    };

    return (
      <NumberInput ref={ref} {...{ ...options, ...maskOptions }} {...props} />
    );
  }
);
