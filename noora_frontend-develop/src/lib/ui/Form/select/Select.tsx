"use client";

import { forwardRef, Ref, useEffect, useState } from "react";
import { FaCheck, FaChevronDown } from "react-icons/fa";
import { twMerge } from "tailwind-merge";

import { SelectItem } from "@/entities";
import { Listbox } from "@headlessui/react";

interface Props<T = string> extends React.HTMLAttributes<HTMLElement> {
  defaultText?: string;
  disabled?: boolean;
  items: SelectItem<T>[] | undefined;
  optional?: boolean;
  value: T | undefined;
  onCompare?: (a: T | undefined, b: T | undefined) => boolean;
  onLeave?: () => void;
  onMutate: (value: T | undefined) => Promise<void> | void;
}

export const Select = forwardRef(function Select<T = string>(
  {
    className,
    defaultText,
    disabled,
    id,
    items,
    optional,
    value,
    onCompare = (a, b) => a === b,
    onLeave,
    onMutate,
    ...props
  }: Props<T>,
  ref: Ref<HTMLElement>
) {
  const [selected, setSelected] = useState<T | null>(
    (value && items && items.find((x) => onCompare(x.value, value))?.value) ??
      null
  );

  useEffect(() => {
    if (!onCompare(selected ?? undefined, value) && items) {
      setSelected(
        (value && items.find((x) => onCompare(x.value, value))?.value) ?? null
      );
    }
  }, [value, items]);

  function getLabel(a: any, defaultValue: string = defaultText ?? "-"): string {
    if (a === undefined || a === null) {
      return defaultValue;
    }

    if (items) {
      const item = items.find((x) => onCompare(x.value, a ?? undefined));
      if (item) {
        return item.label;
      }
    }

    return a.toString();
  }

  return (
    <Listbox
      by={onCompare}
      disabled={disabled}
      ref={ref}
      value={selected}
      onChange={async (value: any) => {
        setSelected(value);
        await onMutate(value);
      }}
    >
      {({ open }) => {
        return (
          <div
            className="relative"
            onBlur={() => {
              if (!open) {
                onLeave?.();
              }
            }}
          >
            <Listbox.Button
              className={twMerge(
                "relative w-full h-10 leading-4 ps-3 pe-10 border border-gray-200 rounded-xl bg-white text-start transition-colors disabled:bg-gray-100 placeholder:text-gray-500 focus:border-gray-300 focus:ring-0 focus:ring-offset-0 focus:outline-none",
                className
              )}
              id={id}
            >
              <span className="block truncate">{getLabel(selected)}</span>
              <span className="pointer-events-none absolute inset-y-0 end-0 flex size-10 items-center justify-center">
                <FaChevronDown
                  className="h-3 w-3 text-gray-400"
                  aria-hidden="true"
                />
              </span>
            </Listbox.Button>
            <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 z-20 focus:outline-none">
              {optional && selected && (
                <Listbox.Option
                  className={({ active }) =>
                    `relative cursor-pointer select-none py-2 ps-10 pe-4 ${
                      active
                        ? "bg-primary-50 text-primary-500"
                        : "text-gray-900"
                    }`
                  }
                  key="unknown"
                  value={null}
                >
                  {defaultText ?? "-"}
                </Listbox.Option>
              )}
              {items && items.length !== 0 ? (
                items.map((item) => (
                  <Listbox.Option
                    className={({ active }) =>
                      `relative cursor-pointer select-none py-2 ps-10 pe-4 ${
                        active
                          ? "bg-primary-50 text-primary-500"
                          : "text-gray-900"
                      }`
                    }
                    key={typeof item === "object" ? JSON.stringify(item) : item}
                    value={item.value}
                  >
                    {({ selected }) => (
                      <>
                        <span
                          className={`block truncate ${
                            selected ? "font-medium" : "font-normal"
                          }`}
                        >
                          {getLabel(item.value)}
                        </span>
                        {selected ? (
                          <span className="absolute inset-y-0 start-0 flex items-center ps-3 text-primary-500">
                            <FaCheck className="h-3 w-3" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Listbox.Option>
                ))
              ) : (
                <Listbox.Option
                  className="relative cursor-pointer select-none py-2 ps-10 pe-4 text-gray-900"
                  key="empty"
                  value={undefined}
                >
                  <span className="block font-normal">گزینه ای یافت نشد.</span>
                </Listbox.Option>
              )}
            </Listbox.Options>
          </div>
        );
      }}
    </Listbox>
  );
}) as <T = string>(props: Props<T> & { ref?: Ref<HTMLElement> }) => JSX.Element;
