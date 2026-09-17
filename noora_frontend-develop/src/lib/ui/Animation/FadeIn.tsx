"use client";

import { Fragment, ReactNode } from "react";

import { Transition } from "@headlessui/react";

import { durationVariants } from "./variants";

interface Props {
  asFragment?: boolean;
  children: ReactNode;
  className?: string;
  duration?: keyof typeof durationVariants;
}

export function FadeIn({
  asFragment = false,
  children,
  className,
  duration = 300,
}: Props) {
  return (
    <Transition
      appear={true}
      show={true}
      className={className}
      as={asFragment ? Fragment : "div"}
      enter={durationVariants[duration]}
      enterFrom="opacity-0"
      enterTo="opacity-100"
    >
      {children}
    </Transition>
  );
}
