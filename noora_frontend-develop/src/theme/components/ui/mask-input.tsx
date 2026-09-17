"use client";

import { createElement, forwardRef } from "react";
import { IMaskInputProps, IMaskMixin } from "react-imask";

import { Input } from "./input";

const IMaskInputClass = IMaskMixin<HTMLInputElement>(({ inputRef, ...props }) =>
  createElement(Input, {
    ...props,
    ref: inputRef,
  }),
);

const IMaskInputFn = <Props extends IMaskInputProps<HTMLInputElement>>(
  props: Props,
  ref: React.Ref<React.ComponentType<Props>>,
) =>
  createElement(IMaskInputClass as any, {
    ...props,
    ref,
  });

const MaskInput = forwardRef(
  IMaskInputFn as <Props extends IMaskInputProps<HTMLInputElement>>(
    props: Props & { ref?: React.Ref<React.ComponentType<Props>> },
  ) => React.ReactElement<Props>,
);

export { MaskInput };
