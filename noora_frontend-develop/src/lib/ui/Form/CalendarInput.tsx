"use client";

import "./DateInput.css";

import { forwardRef, useRef } from "react";
import persian from "react-date-object/calendars/persian";
import gregorian_en from "react-date-object/locales/gregorian_en";
import gregorian_fa from "react-date-object/locales/gregorian_fa";
import persian_en from "react-date-object/locales/persian_en";
import persian_fa from "react-date-object/locales/persian_fa";
import { FaCalendarAlt } from "react-icons/fa";
import DatePicker, { DateObject } from "react-multi-date-picker";

import { Input } from "./Input";

const digitsEn = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
const digitsFa = ["۰", "١", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

interface Props
  extends Omit<
    React.ComponentPropsWithoutRef<typeof DatePicker>,
    "calendar" | "locale" | "digits" | "lang" | "onChange"
  > {
  calendarType?: "gregorian" | "persian";
  lang?: "en" | "fa";
  onChange:
    | ((
        selectedDates: string | DateObject | DateObject[] | null,
      ) => void | false) &
        ((
          selectedDates: string | DateObject | DateObject[] | null,
          validatedValue: string | Array<string>,
          input: HTMLElement,
          isTyping: boolean,
        ) => void | false);
}

const CalendarInput = forwardRef<HTMLInputElement, Props>(
  (
    {
      calendarType = "persian",
      lang = "fa",
      value,
      onChange,
      onOpenPickNewDate = false,
      ...props
    },
    ref,
  ) => {
    const calendarRef = useRef<any>(null);

    const calendarConfig = {
      type: calendarType === "persian" ? persian : undefined,
      locale:
        calendarType === "persian"
          ? lang === "fa"
            ? persian_fa
            : persian_en
          : lang === "fa"
          ? gregorian_fa
          : gregorian_en,
    };

    return (
      <>
        <DatePicker
          ref={calendarRef}
          calendar={calendarConfig.type}
          digits={digitsEn}
          locale={calendarConfig.locale}
          onOpenPickNewDate={onOpenPickNewDate}
          value={value}
          onChange={(value) => {
            const d = (value as DateObject) ?? null;
            const v = d?.isValid ? d.format() : "";
            onChange?.(v);
          }}
          render={(_value, openCalendar, _onValueChange) => (
            <div className="group relative" aria-disabled={props.disabled}>
              <div
                className="absolute flex w-[2.5rem] start-0 top-0 bottom-0 border-e border-gray-200 items-center justify-center cursor-pointer group-aria-disabled:bg-gray-50 group-aria-disabled:cursor-not-allowed"
                onClick={openCalendar}
              >
                <FaCalendarAlt />
              </div>
              <Input
                ref={ref}
                className="ps-12"
                disabled={props.disabled}
                value={value?.toString() ?? ""}
                onChange={(e) => onChange?.(e.target.value)}
              />
            </div>
          )}
          {...props}
        />
      </>
    );
  },
);
CalendarInput.displayName = "CalendarInput";

export { CalendarInput };
