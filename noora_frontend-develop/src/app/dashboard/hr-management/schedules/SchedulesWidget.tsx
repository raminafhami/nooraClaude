import { Dispatch, SetStateAction, useEffect, useState } from "react";

import { PersonnelScheduleCreateModel } from "@/hrm/schedules/models/personnelScheduleCreateModel";
import { createPersonnelSchedule } from "@/hrm/schedules/services/createPersonnelSchedule";

import { AddingNewSchedule } from "./addingNewSchedule/AddingNewSchedule";
import AddLimitations from "./addLimitations/AddLimitations";
import EditingOnePersonnelSchedule from "./editingOnePersonnelSchedule/EditingOnePersonnelSchedule";
import { WidgetMode } from "./Schedules";

export interface ColorsAndWorkShifts {
  name: string;
  colorCode: string;
  workShiftId: string;
}
export interface InitialFormObj {
  datesAndWorkShift: { [key: string | "null"]: string[] };
  userId: string[];
}

export enum PersonnelSelectionType {
  onePersonnel = "onePersonnel",
  multiPersonnel = "multiPersonnel",
}

enum WidgetStep {
  Personnel = 1,
  Workshift = 2,
  Calendar = 3,
}

export interface Query {
  changeStep: (number: number) => void;
  colorsAndWorkShift: ColorsAndWorkShifts[];
  setColorAndWorkShiftId: Dispatch<SetStateAction<ColorsAndWorkShifts[]>>;
  current: string;
  setCurrent: Dispatch<SetStateAction<string>>;
  formData: InitialFormObj;
  setFormData: Dispatch<SetStateAction<InitialFormObj>>;
  setCalDisabled: Dispatch<SetStateAction<boolean>>;
  isCalDisabled: boolean;
  onFormSubmit: (a: any) => Promise<void>;
  submit: {
    submitted: boolean;
    error: boolean;
    message: string;
  };
  setSubmit: Dispatch<
    SetStateAction<{
      submitted: boolean;
      error: boolean;
      message: string;
    }>
  >;
  step: WidgetStep;
  isSubmittingFrom: boolean;
  setLastSubmittedPersonnel: Dispatch<SetStateAction<string[]>>;
  lastSubmittedPersonnel: string[];
}

function SchedulesWidget({ mode }: { mode: WidgetMode }) {
  const [current, setCurrent] = useState<string>("");

  const [isCalDisabled, setCalDisabled] = useState(true);

  const [formData, setFormData] = useState<Query["formData"]>({
    userId: [],
    datesAndWorkShift: {},
  });

  const [colorsAndWorkShiftId, setColorsAndWorkShiftId] = useState<
    ColorsAndWorkShifts[]
  >([
    { name: "blue", colorCode: "#b0d7e6", workShiftId: "" },
    { name: "green", colorCode: "#92eba8", workShiftId: "" },
    { name: "pink", colorCode: "#fe96df", workShiftId: "" },
    { name: "yellow", colorCode: "#efe074", workShiftId: "" },
    { name: "cyan", colorCode: "#d9c9c4", workShiftId: "" },
    { name: "purple", colorCode: "#b1a9fe", workShiftId: "" },
    { name: "red", colorCode: "#a3b1d6", workShiftId: "" },
    { name: "lime", colorCode: "#caf28c", workShiftId: "" },
    { name: "orange", colorCode: "#f8c06d", workShiftId: "" },
    { name: "Fuchsia", colorCode: "#ecc2ed", workShiftId: "" },
  ]);

  // converting dates and workingRegulationId in correct form :
  function transformObject(
    data: Query["formData"] = formData
  ): PersonnelScheduleCreateModel[] {
    const transformedObjects: PersonnelScheduleCreateModel[] = [];

    for (const workingTimeRegulationId in data.datesAndWorkShift) {
      const transformedObject: PersonnelScheduleCreateModel = {
        dates: data.datesAndWorkShift[workingTimeRegulationId],
        userIds: data.userId,
        workingTimeRegulationId:
          workingTimeRegulationId === "null" ? null : workingTimeRegulationId,
      };
      transformedObjects.push(transformedObject);
    }
    return transformedObjects;
  }

  const [submit, setSubmit] = useState({
    submitted: false,
    error: false,
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const postSchedule = async (array: PersonnelScheduleCreateModel[]) => {
    try {
      setIsSubmitting(true);
      const requests = array.map((item) => createPersonnelSchedule(item));
      const responses = await Promise.all(requests);
      if (requests.length == responses.length)
        setSubmit({ submitted: true, error: false, message: "" });
    } catch (error) {
      setSubmit({
        submitted: true,
        error: true,
        message: "مشکلی پیش آمده‌است",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitHandler = async (data?: Query["formData"]) => {
    const allRequests = transformObject(data);
    postSchedule(allRequests);
  };

  useEffect(() => {
    setSubmit({ submitted: false, error: false, message: "" });
    setCurrent("");
    setColorsAndWorkShiftId([
      { name: "blue", colorCode: "#b0d7e6", workShiftId: "" },
      { name: "green", colorCode: "#92eba8", workShiftId: "" },
      { name: "pink", colorCode: "#fe96df", workShiftId: "" },
      { name: "yellow", colorCode: "#efe074", workShiftId: "" },
      { name: "cyan", colorCode: "#d9c9c4", workShiftId: "" },
      { name: "purple", colorCode: "#b1a9fe", workShiftId: "" },
      { name: "red", colorCode: "#a3b1d6", workShiftId: "" },
      { name: "lime", colorCode: "#caf28c", workShiftId: "" },
      { name: "orange", colorCode: "#f8c06d", workShiftId: "" },
      { name: "Fuchsia", colorCode: "#ecc2ed", workShiftId: "" },
    ]);
    setCalDisabled(true);
    setFormData({
      userId: [],
      datesAndWorkShift: {},
    });
    setStep(1);
    setLastSubmittedPersonnel([]);
  }, [mode]);

  const [step, setStep] = useState<WidgetStep>(WidgetStep.Personnel);

  const changeStepHandler = (number: number): void => {
    setStep((prev) => prev + number);
  };
  const [lastSubmittedPersonnel, setLastSubmittedPersonnel] = useState<
    string[]
  >([]);

  const query: Query = {
    lastSubmittedPersonnel,
    setLastSubmittedPersonnel,
    isSubmittingFrom: isSubmitting,
    step,
    changeStep: changeStepHandler,
    onFormSubmit: submitHandler,
    colorsAndWorkShift: colorsAndWorkShiftId,
    setColorAndWorkShiftId: setColorsAndWorkShiftId,
    current,
    setCurrent,
    formData,
    setFormData,
    setCalDisabled,
    isCalDisabled,
    submit,
    setSubmit,
  };

  return mode === PersonnelSelectionType.multiPersonnel ? (
    <AddingNewSchedule query={query} />
  ) : mode === PersonnelSelectionType.onePersonnel ? (
    <EditingOnePersonnelSchedule query={query} />
  ) : mode === "changeLimitations" ? (
    <AddLimitations />
  ) : (
    <></>
  );
}

export default SchedulesWidget;
