"use client";

import "./DateInput.css";

import { forwardRef, Ref, useRef } from "react";
import persian from "react-date-object/calendars/persian";
import gregorian_en from "react-date-object/locales/gregorian_en";
import gregorian_fa from "react-date-object/locales/gregorian_fa";
import persian_en from "react-date-object/locales/persian_en";
import persian_fa from "react-date-object/locales/persian_fa";
import { FaCalendarAlt } from "react-icons/fa";
import DatePicker, { DateObject } from "react-multi-date-picker";

const digitsEn = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
const digitsFa = ["۰", "١", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

export const dateInputDigitsEn = digitsEn;

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  calendarType?: "gregorian" | "persian";
  digits?: "en" | "fa";
  lang?: "en" | "fa";
  onOpenPickNewDate?: boolean;
  value?: string;
  minDate?: string;
  maxDate?: string | number | Date | DateObject | undefined;
  onLeave?: () => void;
  onMutate?: (value: string) => void;
  getDateFormat?: (value: any) => void;
}

export const DateInput = forwardRef<HTMLInputElement, Props>(function DateInput(
  {
    calendarType = "persian",
    digits,
    disabled,
    lang = "fa",
    onOpenPickNewDate = false,
    value,
    onBlur,
    onChange,
    onLeave,
    onMutate,
    minDate,
    maxDate,
    getDateFormat,
    ...props
  }: Props,
  ref: Ref<HTMLInputElement>,
) {
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
        calendar={calendarConfig.type}
        digits={digitsEn}
        locale={calendarConfig.locale}
        onOpenPickNewDate={onOpenPickNewDate}
        ref={calendarRef}
        value={value}
        minDate={minDate}
        maxDate={maxDate}
        onChange={(value) => {
          const d = (value as DateObject) ?? null;
          const v = d?.isValid ? d.format() : "";
          onMutate?.(v);
        }}
        onFocusedDateChange={(dateFocused, dateClicked) =>
          getDateFormat && dateClicked && getDateFormat(dateClicked?.toDate())
        }
        render={(value, openCalendar, onValueChange) => (
          <div
            className="group flex border border-gray-200 rounded-xl bg-white"
            aria-disabled={disabled}
          >
            <div
              className="flex basis-10 border-e border-gray-200 rounded-s-xl items-center justify-center shrink-0 cursor-pointer group-aria-disabled:bg-gray-50 group-aria-disabled:cursor-not-allowed"
              onClick={openCalendar}
            >
              <FaCalendarAlt />
            </div>
            <input
              className="w-full h-10 leading-4 px-3 border-none rounded-e-xl text-start focus:ring-0 focus:ring-offset-0 focus:outline-none disabled:bg-gray-50 group-aria-disabled:cursor-not-allowed"
              disabled={disabled}
              ref={ref}
              value={value}
              onBlur={(e) => {
                const d = e.target.value
                  ? new DateObject(e.target.value)
                  : null;
                const v = d?.isValid ? d.format("YYYY/MM/DD") : "";

                if (value !== v) {
                  onMutate?.(v);
                }
                onLeave?.();

                if (e.relatedTarget) {
                  calendarRef.current.closeCalendar();
                }
              }}
              onChange={onValueChange}
              onFocus={openCalendar}
              {...props}
            />
          </div>
        )}
      />
    </>
  );
});
