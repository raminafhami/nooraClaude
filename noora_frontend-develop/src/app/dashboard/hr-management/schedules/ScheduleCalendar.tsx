"use client";
import "./customCalendar.css";

import moment from "moment-jalaali";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { Calendar, DateObject } from "react-multi-date-picker";

import { convertPersianNumbersToEnglish } from "@/hrm/schedules/utils/convertPersianNumbersToEnglish";
import { getDatesIngregorian } from "@/hrm/schedules/utils/getDatesIngregorian";

import { InitialWorkShifts } from "./editingOnePersonnelSchedule/EditingOnePersonnelSchedule";
import { PersonnelSelectionType, Query } from "./SchedulesWidget";

export interface CalValue {
  date: DateObject | DateObject[];
  workShiftId: string;
}
export function ScheduleCalendar({
  initialValue,
  emptyCal,
  disabled,
  setDate,
  colorAndId,
  currentWorkingRegulationId,
  setEmptyCal,
  setColorAndId,
  onUpdatingForm,
  mode,
}: {
  initialValue?: InitialWorkShifts[];
  setEmptyCal?: Dispatch<SetStateAction<boolean>>;
  emptyCal?: boolean;
  disabled: boolean;
  setDate: Query["setFormData"];
  colorAndId: Query["colorsAndWorkShift"];
  currentWorkingRegulationId: string;
  setColorAndId: Query["setColorAndWorkShiftId"];
  onUpdatingForm?: React.Dispatch<React.SetStateAction<Query["formData"]>>;
  mode: PersonnelSelectionType;
}) {
  // const pholiday = require("pholiday");
  const [values, setValue] = useState<CalValue[]>([]);

  useEffect(() => {
    if (emptyCal && setEmptyCal) {
      setValue([]);
      setEmptyCal(false);
    }
  }, [emptyCal, setEmptyCal]);

  // if there is initialValue then assign it to value
  useEffect(() => {
    if (initialValue) setValue(initialValue);
  }, [initialValue]);

  const transformValues = (
    value: CalValue[]
  ): { [k: string]: string[] } | {} | undefined => {
    const dateGroups: Query["formData"]["datesAndWorkShift"] = {};
    if (Array.isArray(value)) {
      value.forEach((item) => {
        const { date, workShiftId } = item;
        if (!dateGroups[workShiftId]) {
          dateGroups[workShiftId] = [];
        }
        dateGroups[workShiftId].push(date?.toString());
      });

      // transform dates to gregorian
      const transformedDatesAndWorkShiftGroups = Object.fromEntries(
        Object.entries(dateGroups).map(([id, objArray]) => [
          id,
          getDatesIngregorian(objArray),
        ])
      );
      if (Object.keys(dateGroups).length) {
        return transformedDatesAndWorkShiftGroups;
      } else return {};
    }
  };

  // mapping over values and separate each workingShiftId with its own dates
  useEffect(() => {
    const transformed = transformValues(values);
    if (transformed) {
      setDate((prev) => ({
        ...prev,
        datesAndWorkShift: transformed,
      }));
    }
    if (initialValue && onUpdatingForm) {
      const differences = findDifferences(values, initialValue);
      const transformedUpdatedData = transformValues(differences);
      if (transformedUpdatedData) {
        onUpdatingForm((prev) => ({
          ...prev,
          datesAndWorkShift: transformedUpdatedData,
        }));
      }
    }
  }, [values, initialValue]);

  // className and color in the calendar
  const checkColorAndReturnClassName = (date: string): string => {
    let className = "";
    if (Array.isArray(values)) {
      // Find the item in the 'values' array that matches the provided 'date'.
      const matchingItem = values.find((item) => {
        return (
          convertPersianNumbersToEnglish(item.date?.toString()) ===
          convertPersianNumbersToEnglish(date)
        );
      });
      // Find the corresponding color code for the 'workingRegulationId' of the matching item.
      if (matchingItem) {
        if (!matchingItem.workShiftId) {
          className = "";
        } else {
          const matchingColor = colorAndId.find(
            (colorItem) => colorItem.workShiftId === matchingItem.workShiftId
          );
          if (matchingColor) {
            className = `highlight highlight-${matchingColor.name}`;
          } else {
            const emptyIndex = colorAndId.findIndex(
              (item) => item.workShiftId === ""
            );
            if (emptyIndex !== -1) {
              const updatedArray = [...colorAndId];
              updatedArray[emptyIndex] = {
                ...updatedArray[emptyIndex],
                workShiftId: matchingItem.workShiftId,
              };
              setColorAndId(updatedArray);
              className = `highlight highlight-${updatedArray[emptyIndex].name}`;
            }
          }
        }
      } else {
        className = "highlight no-color";
      }
    }

    // const isHoliday = pholiday(
    //   convertPersianNumbersToEnglish(date),
    //   "jYYYY/jMM/jDD"
    // ).isHoliday();
    // return `${className} ${isHoliday ? "holiday" : ""}`;
    return `${className}`;
  };

  const focusedChangeHandler = (
    focusedDate: DateObject | undefined,
    selectedDate: DateObject | undefined
  ): void => {
    if (selectedDate) {
      const matchedDate = values.find((value) => {
        return selectedDate.toString() === value.date.toString();
      });
      if (matchedDate) {
        if (currentWorkingRegulationId === "null") {
          setValue((prev) => {
            return prev.filter((i) => {
              return i.date.toString() !== matchedDate.date.toString();
            });
          });
        } else {
          setValue((prev) => {
            return prev.filter((i) => {
              return i.date.toString() !== matchedDate.date.toString();
            });
          });
          if (mode === PersonnelSelectionType["onePersonnel"])
            setValue((prev) => [
              ...prev,
              {
                date: selectedDate,
                workShiftId: currentWorkingRegulationId,
              },
            ]);
        }
      }
      if (!matchedDate) {
        if (currentWorkingRegulationId === "null") {
          return;
        } else {
          setValue((prev) => [
            ...prev,
            {
              date: selectedDate,
              workShiftId: currentWorkingRegulationId,
            },
          ]);
        }
      }
    }
  };

  function findDifferences(
    value: CalValue[],
    initialValue: InitialWorkShifts[]
  ): CalValue[] {
    const removedFromInitialValue: CalValue[] = initialValue
      ?.filter(
        (obj2) =>
          !value.some(
            (obj1) =>
              obj1.date.toString() === obj2.date.toString() &&
              obj1.workShiftId === obj2.workShiftId
          )
      )
      .map((i) => ({ ...i, workShiftId: "null" }));
    const missingObjects: CalValue[] = value?.filter(
      (obj1) =>
        !initialValue?.find(
          (obj2) =>
            obj1.date.toString() === obj2.date.toString() &&
            obj1.workShiftId === obj2.workShiftId
        )
    );
    const combinedArray: CalValue[] = [
      ...missingObjects,
      ...removedFromInitialValue,
    ];
    const uniqueArray: CalValue[] = [];
    const uniqueDates: Set<string> = new Set();

    for (const obj of combinedArray) {
      const dateString = obj.date.toString();

      if (!uniqueDates.has(dateString)) {
        uniqueDates.add(dateString);
        uniqueArray.push(obj);
      }
    }
    return uniqueArray;
  }

  return (
    <div className="w-full">
      <Calendar
        value={values.flatMap((data) => data?.date)}
        multiple
        calendar={persian}
        locale={persian_fa}
        format={"YYYY/MM/DD"}
        disabled={disabled}
        className="custom-calendar"
        weekDays={[
          "شنبه",
          "یکشبنه",
          "دوشنبه",
          "سه‌شنبه",
          "چهارشنبه",
          "پنجشنبه",
          "جمعه",
        ]}
        highlightToday={false}
        shadow={false}
        mapDays={({ date }) => {
          let className;
          const strDate = date.format();
          className = checkColorAndReturnClassName(strDate);
          if (className) return { className };
        }}
        onFocusedDateChange={focusedChangeHandler}
      />
    </div>
  );
}
