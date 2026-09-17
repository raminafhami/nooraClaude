"use client";

import { forwardRef, Ref, useEffect, useRef, useState } from "react";
import { FaCheck, FaTimes } from "react-icons/fa";

import { Combobox } from "@headlessui/react";

import { Fade } from "../../Animation";
import { Input } from "../Input";

interface Props<T> extends React.HTMLAttributes<HTMLElement> {
  disabled?: boolean;
  value: T | undefined;
  onCompare?: (a: T | undefined, b: T | undefined) => boolean;
  onLabel?: (value: T) => string;
  onLeave?: () => void;
  onMutate: (value: T | undefined) => Promise<void> | void;
  onSearch: (value: string) => Promise<T[]> | T[];
}

export const SelectDynamic = forwardRef(function SelectDynamic<T>(
  {
    disabled,
    id,
    value,
    onCompare = (a, b) => a === b,
    onLabel,
    onLeave,
    onMutate,
    onSearch,
    ...props
  }: Props<T>,
  ref: Ref<HTMLElement>
) {
  const [items, setItems] = useState<T[]>([]);
  const [selected, setSelected] = useState<T | null>(value ?? null);

  const input = useRef<HTMLInputElement>(null);
  const timeout = useRef<NodeJS.Timeout>();

  async function getItems(text: string | undefined) {
    setItems(await onSearch(text || ""));
  }

  useEffect(() => {
    (async () => {
      selected && (await getItems(getLabel(selected)!));
    })();
  }, []);

  useEffect(() => {
    if (
      !(selected === null && value === undefined) &&
      !onCompare(selected ?? undefined, value)
    ) {
      setSelected(value ?? null);
      getItems(getLabel(value)!);
    }
  }, [value]);

  function getLabel(a: T | undefined, defaultValue: string = ""): string {
    if (!a) {
      return defaultValue;
    }

    const label = onLabel?.(a);
    if (label) {
      return label;
    }

    if (typeof a === "object") {
      return (a as any).name || (a as any).title;
    }

    return a.toString();
  }

  return (
    <Combobox
      as="div"
      by={onCompare}
      disabled={disabled}
      ref={ref}
      value={selected as any}
      onChange={async (value: T | undefined) => {
        setSelected(value ?? null);
        await onMutate(value);
      }}
    >
      {({ open }) => {
        return (
          <div
            aria-disabled={disabled}
            className="relative"
            onBlur={async (e) => {
              if (!e.relatedTarget) {
                const v = input.current?.value;

                if (!v) {
                  setSelected(null);
                  setItems([]);
                  await onMutate(undefined);
                } else if (
                  selected &&
                  (items.length === 0 ||
                    !items.find((x) => onCompare(x, selected ?? undefined)))
                ) {
                  setSelected(null);
                  setItems([]);
                  await onMutate(undefined);
                } else if (!selected && items.length === 1) {
                  setSelected(items.at(0)!);
                  await onMutate(items.at(0));
                }

                onLeave?.();
              }
            }}
          >
            <Fade show={!!selected && !disabled}>
              <div
                className="absolute flex size-10 end-0 items-center justify-center cursor-pointer text-gray-400"
                onClick={async (e) => {
                  setSelected(null);
                  setItems([]);
                  await onMutate(undefined);
                }}
              >
                <FaTimes />
              </div>
            </Fade>
            <Combobox.Input
              autoComplete="off"
              as={Input}
              className="pe-6"
              displayValue={(item: T | null) => getLabel(item ?? undefined)}
              id={id}
              ref={input}
              onChange={(e) => {
                clearTimeout(timeout.current);
                const term = e.target.value;
                timeout.current = setTimeout(async () => {
                  getItems(term);
                }, 100);
              }}
            />
            <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 z-20 focus:outline-none">
              {items && items.length !== 0 ? (
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
                          {getLabel(item)}
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
                  <span className="block font-normal">نتیجه ای یافت نشد.</span>
                </Combobox.Option>
              )}
            </Combobox.Options>
          </div>
        );
      }}
    </Combobox>
  );
}) as <T>(props: Props<T> & { ref?: Ref<HTMLElement> }) => JSX.Element;
