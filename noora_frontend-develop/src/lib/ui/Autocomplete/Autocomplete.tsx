"use client";

import { forwardRef, Ref, useRef, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { FaCheck } from "react-icons/fa6";

import { Input } from "@/form/Input";
import { GenericObject } from "@/ts/GenericObject";
import { Combobox } from "@headlessui/react";

import { Fade } from "../Animation/Fade";
import { Loading } from "../Loader";

interface Props<T extends string | number | GenericObject> {
  compareFn?: (a: T | null | undefined, b: T | null | undefined) => boolean;
  disabled?: boolean;
  id?: string;
  items: T[] | null | undefined;
  label?: string | ((value: T) => string);
  name?: string;
  value: T | null | undefined;
  onBlur?: () => void;
  onChange: (value: T | null | undefined) => Promise<void> | void;
  onInput: (value: string) => Promise<void> | void;
}

function Autocomplete<T extends string | number | GenericObject>(
  {
    disabled,
    id,
    items,
    label,
    name,
    value,
    compareFn = (a, b) => a === b,
    onBlur,
    onChange,
    onInput,
  }: Props<T>,
  ref: Ref<any>
) {
  const [isLoading, setLoading] = useState<boolean>(false);

  const inputRef = useRef<HTMLInputElement>(null);

  function renderLabel(
    item: T | null | undefined,
    defaultValue: string = ""
  ): string {
    if (!item) {
      return defaultValue;
    }

    if (typeof item === "object") {
      if (label) {
        if (typeof label === "string") {
          return item[label];
        } else {
          return label(item);
        }
      }

      return item["label"] || item["name"] || item["title"] || item.toString();
    }

    return item.toString();
  }

  return (
    <Combobox
      as="div"
      by={compareFn}
      disabled={disabled}
      value={value ?? null}
      onChange={onChange}
    >
      {({ open }) => {
        return (
          <div
            aria-disabled={disabled}
            className="relative"
            onBlur={(e) => {
              if (!e.relatedTarget) {
                !inputRef.current?.value && onChange(null);
                onBlur?.();
              }
            }}
          >
            <Fade show={!!value && !disabled}>
              <div
                className="absolute flex size-10 end-0 items-center justify-center cursor-pointer text-gray-400"
                onClick={() => onChange(null)}
              >
                <FaTimes />
              </div>
            </Fade>
            <Combobox.Input
              autoComplete="off"
              as={Input}
              className="pe-6"
              displayValue={(item: T | null) => renderLabel(item ?? undefined)}
              id={id ?? name}
              ref={inputRef}
              onChange={async (e) => {
                setLoading(true);
                await onInput(e.target.value);
                setLoading(false);
              }}
            />
            <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-2xl bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 z-20 focus:outline-none">
              {!isLoading ? (
                items && items.length !== 0 ? (
                  items.map((item) => (
                    <Combobox.Option
                      className={({ active }) =>
                        `relative cursor-pointer select-none py-2 ps-10 pe-4 ${
                          active
                            ? "bg-primary-50 text-primary-500"
                            : "text-gray-900"
                        }`
                      }
                      key={
                        typeof item === "object"
                          ? JSON.stringify(item)
                          : (item as any).toString()
                      }
                      value={item}
                    >
                      {({ selected }) => (
                        <>
                          <span
                            className={`block ${
                              selected ? "font-medium" : "font-normal"
                            }`}
                          >
                            {renderLabel(item)}
                          </span>
                          {selected ? (
                            <span className="absolute inset-y-0 start-0 flex items-center ps-3 text-primary-500">
                              <FaCheck className="h-3 w-3" aria-hidden="true" />
                            </span>
                          ) : null}
                        </>
                      )}
                    </Combobox.Option>
                  ))
                ) : (
                  <Combobox.Option
                    className="relative cursor-pointer select-none py-2 ps-10 pe-4 text-gray-900"
                    key="empty"
                    value={undefined}
                  >
                    <span className="block font-normal">
                      نتیجه ای یافت نشد.
                    </span>
                  </Combobox.Option>
                )
              ) : (
                <Combobox.Option
                  className="relative flex min-h-9 cursor-pointer select-none py-2 ps-10 pe-4 text-gray-900 items-center"
                  key="loading"
                  value={undefined}
                >
                  <Loading size="xs">در حال دریافت اطلاعات...</Loading>
                </Combobox.Option>
              )}
            </Combobox.Options>
          </div>
        );
      }}
    </Combobox>
  );
}

export default forwardRef(Autocomplete) as <
  T extends string | number | GenericObject
>(
  props: Props<T> & { ref?: Ref<any> }
) => JSX.Element;
