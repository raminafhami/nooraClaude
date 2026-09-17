import { SelectItem } from "@/entities";

export enum ExpertStatesProps {
  manager = "manager",
  requestMaker = "requestMaker",
  nextStep = "nextStep",
}

export const ExpertStates: SelectItem<ExpertStatesProps>[] = [
  {
    label: "ادامه",
    value: ExpertStatesProps.nextStep,
  },
  {
    label: "برگشت به مدیر",
    value: ExpertStatesProps.manager,
  },
  {
    label: "برگشت به درخواست دهنده",
    value: ExpertStatesProps.requestMaker,
  },
];
