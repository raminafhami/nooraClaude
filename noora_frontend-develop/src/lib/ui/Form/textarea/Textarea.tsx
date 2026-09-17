"use client";

import { forwardRef, Ref } from "react";
import { twMerge } from "tailwind-merge";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function TextArea(
    { className, id, value, ...props }: TextareaProps,
    ref: Ref<HTMLTextAreaElement>,
  ) {
    return (
      <textarea
        ref={ref}
        className={twMerge(
          "w-full min-h-[12rem] px-3 py-2 border border-gray-200 rounded-xl text-xsm/6 transition-colors placeholder:text-gray-500 disabled:bg-gray-50 disabled:select-none focus:border-gray-200 focus:ring-0 focus:ring-offset-0 focus:outline-none",
          className,
        )}
        id={id ?? props.name}
        value={value ?? ""}
        {...props}
      ></textarea>
    );
  },
);
