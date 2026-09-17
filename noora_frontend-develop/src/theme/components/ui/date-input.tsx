"use client";

import {
	ComponentPropsWithoutRef,
	ComponentType,
	forwardRef,
	useEffect,
	useRef,
	useState,
} from "react";
import persian from "react-date-object/calendars/persian";
import gregorian_en from "react-date-object/locales/gregorian_en";
import persian_fa from "react-date-object/locales/persian_fa";
import { FaCalendarAlt } from "react-icons/fa";
import { FaX } from "react-icons/fa6";
import DatePicker, { Calendar } from "react-multi-date-picker";

import { cn } from "@/lib/utils";
import { toEnglishNum } from "@/utils/string/toEnglishNum";

import { Input } from "./input";

const digitsEn = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

interface DateInputProps
	extends Omit<
		React.ComponentPropsWithoutRef<typeof DatePicker>,
		"calendar" | "locale" | "digits" | "lang" | "onChange"
	> {
	calendarType?: "gregorian" | "persian";
	openOnSelect?: boolean;
	slotProps?: Partial<{
		input: Omit<
			ComponentPropsWithoutRef<"input">,
			"disabled" | "value" | "onChange" | "onFocus"
		>;
	}>;
	onChange?: (value: string | string[]) => void;
}

const DateInput = forwardRef<HTMLInputElement, DateInputProps>(
	(
		{
			calendarType = "persian",
			openOnSelect = false,
			slotProps,
			value,
			onBlur,
			onChange,
			onOpenPickNewDate = false,
			...props
		},
		ref,
	) => {
		const { className: inputClassName, ...inputProps } = slotProps?.input ?? {};

		const [isClose, setIsClose] = useState<boolean>(!openOnSelect);

		const calendarRef = useRef<ComponentType<typeof Calendar>>(null);
		const pickerRef = useRef<HTMLDivElement>(null);

		const calendarConfig = {
			type: calendarType === "persian" ? persian : undefined,
			locale: calendarType === "persian" ? persian_fa : gregorian_en,
		};

		const handleClickOutside = (event: MouseEvent) => {
			if (
				pickerRef.current &&
				!pickerRef.current.contains(event.target as Node)
			) {
				setIsClose(true);
			}
		};

		useEffect(() => {
			if (openOnSelect && !isClose) {
				document.addEventListener("mousedown", handleClickOutside);

				return () => {
					document.removeEventListener("mousedown", handleClickOutside);
				};
			}
		}, [isClose, openOnSelect]);

		return (
			<div ref={pickerRef}>
				<DatePicker
					ref={calendarRef}
					calendar={calendarConfig.type}
					digits={digitsEn}
					locale={calendarConfig.locale}
					onOpenPickNewDate={onOpenPickNewDate}
					value={value}
					onChange={(value) => {
						onChange?.(
							(() => {
								if (!value) {
									return props.multiple ? [] : "";
								}

								if (Array.isArray(value)) {
									return value
										.filter((d) => d.isValid)
										.map((x) => toEnglishNum(x.format()) ?? "");
								}

								return value.isValid
									? (toEnglishNum(value.format()) ?? "")
									: "";
							})(),
						);
					}}
					onOpen={() => {
						if (openOnSelect) {
							setIsClose(false);
						}
					}}
					onClose={() => isClose}
					render={(renderValue, openCalendar, onValueChange) => {
						return (
							<div aria-disabled={props.disabled} className="group relative">
								<div
									className="absolute bottom-0 start-0 top-0 flex w-[2.5rem] cursor-pointer items-center justify-center border-e border-gray-200 group-aria-disabled:cursor-not-allowed group-aria-disabled:opacity-50"
									onClick={openCalendar}
								>
									<FaCalendarAlt />
								</div>

								<Input
									ref={ref}
									className={cn(
										"cursor-default pe-12 ps-10 rtl:text-right",
										inputClassName,
									)}
									dir="ltr"
									disabled={props.disabled}
									readOnly
									value={renderValue}
									onChange={(event) => {
										onValueChange(
											/^[0-9\s\/-]*$/.test(event.target.value)
												? event
												: {
														...event,
														target: { ...event.target, value: renderValue },
													},
										);
									}}
									onFocus={openCalendar}
									{...inputProps}
								/>

								{value && (
									<div className="absolute bottom-0 end-[13px] top-0">
										<div
											className="flex h-full w-4 cursor-pointer items-center justify-center text-2xs text-muted-foreground"
											onClick={() =>
												onValueChange({ target: { value: "" } } as any)
											}
										>
											<FaX />
										</div>
									</div>
								)}
							</div>
						);
					}}
					{...props}
				/>
			</div>
		);
	},
);
DateInput.displayName = "DateInput";

export { DateInput };
