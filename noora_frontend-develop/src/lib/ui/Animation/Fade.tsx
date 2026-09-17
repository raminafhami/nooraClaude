"use client";

import { Fragment, ReactNode } from "react";

import { Transition } from "@headlessui/react";

import { durationVariants } from "./variants";

interface Props {
  asFragment?: boolean;
  appear?: boolean;
  children: ReactNode;
  className?: string;
  duration?: keyof typeof durationVariants;
  show: boolean;
}

export function Fade({
  asFragment = false,
  appear = false,
  children,
  className,
  duration = 300,
  show,
}: Props) {
  return (
    <Transition
      as={asFragment ? Fragment : "div"}
      appear={appear}
      show={show}
      className={className}
      enter={durationVariants[duration]}
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave={durationVariants[duration]}
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      {children}
    </Transition>
  );
}
