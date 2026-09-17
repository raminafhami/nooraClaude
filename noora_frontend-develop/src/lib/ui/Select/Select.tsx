"use client";

import { forwardRef, Ref, useMemo } from "react";
import { FaCheck, FaChevronDown } from "react-icons/fa6";
import { twMerge } from "tailwind-merge";

import { SelectItem } from "@/entities/SelectItem";
import { Listbox } from "@headlessui/react";

interface Props<T> {
  className?: string;
  defaultText?: string;
  disabled?: boolean;
  id?: string;
  items: SelectItem<T>[] | null;
  name?: string;
  optional?: boolean;
  value: T | null;
  compareFn?: (a: T | null, b: T | null) => boolean;
  onBlur?: () => void;
  onChange?: (value: T | null) => Promise<void> | void;
}

function Select<T>(
  {
    className,
    defaultText = "-",
    disabled,
    id,
    items,
    name,
    optional,
    value,
    compareFn = (a, b) => a === b,
    onBlur,
    onChange,
  }: Props<T>,
  ref: Ref<any>,
) {
  const optionsItems = useMemo(
    () =>
      items ? items.filter((x) => x.visible === undefined || x.visible) : [],
    [items],
  );

  const label = useMemo(() => {
    if (value === undefined || value === null || value === "") {
      return defaultText;
    }

    if (items) {
      const item = items.find((x) => compareFn(x.value, value));

      if (item) {
        return item.label;
      }
    }

    return value.toString();
  }, [compareFn, defaultText, items, value]);

  return (
    <Listbox
      by={compareFn}
      disabled={disabled}
      value={value ?? null}
      onChange={onChange}
    >
      {({ open }) => {
        return (
          <div className="relative" onBlur={() => !open && onBlur?.()}>
            <Listbox.Button
              className={twMerge(
                "relative w-full h-10 leading-4 ps-3 pe-10 border border-gray-200 rounded-xl bg-white text-start transition-colors disabled:bg-gray-100 placeholder:text-gray-500 focus:border-gray-300 focus:ring-0 focus:ring-offset-0 focus:outline-none",
                className,
              )}
              id={id ?? name}
            >
              <span className="block truncate">{label}</span>
              <span className="pointer-events-none absolute inset-y-0 end-0 flex size-10 items-center justify-center">
                <FaChevronDown
                  className="h-3 w-3 text-gray-400"
                  aria-hidden="true"
                />
              </span>
            </Listbox.Button>

            <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 z-20 focus:outline-none">
              {optional && value && (
                <Listbox.Option
                  className={({ active }) =>
                    `relative cursor-pointer select-none py-2 ps-10 pe-4 transition-colors duration-300 ${
                      active
                        ? "bg-primary-50 text-primary-500"
                        : "text-gray-900"
                    }`
                  }
                  key="unknown"
                  value={null}
                >
                  {defaultText}
                </Listbox.Option>
              )}
              {optionsItems && optionsItems.length !== 0 ? (
                optionsItems.map((item) => (
                  <Listbox.Option
                    className={({ active }) =>
                      `relative cursor-pointer select-none py-2 ps-10 pe-4 transition-colors duration-300 ${
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
                          {item.label}
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
                  key="undefined"
                  className="relative select-none py-2 ps-10 pe-4 text-gray-900"
                  value={undefined}
                  onClick={(e) => e.preventDefault()}
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
}

export default forwardRef(Select) as <T>(
  props: Props<T> & { ref?: Ref<any> },
) => JSX.Element;
