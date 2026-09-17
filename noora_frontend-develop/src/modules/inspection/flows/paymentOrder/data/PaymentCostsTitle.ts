import { SelectItem } from "@/entities";

export enum PaymentCostsTitleProps {
  stakeHolder = "610011",
  coiInspection = "611401",
  coiMarketing = "611402",
  coiStandard = "611403",
  coiOthers = "611406",
  icInspection = "611501",
  icMarketing = "611502",
  icOthres = "611504",
  actionInspection = "611601",
  actionMarketing = "611602",
  actionShip = "611603",
  actionOthers = "611605",
  rialBank = "111005",
}

export const PaymentCostsTitle: SelectItem<PaymentCostsTitleProps>[] = [
  // {
  //   label: "موجودی بانکهای ریالی",
  //   value: PaymentCostsTitleProps.rialBank,
  // },
  {
    label: "بازاریابی داخلی و پورسانت و مزایای متفرقه",
    value: PaymentCostsTitleProps.stakeHolder,
  },
  {
    label: "COI هزینه بازرسی",
    value: PaymentCostsTitleProps.coiInspection,
  },
  {
    label: "COI هزینه بازاریابی",
    value: PaymentCostsTitleProps.coiMarketing,
  },
  {
    label: "COI هزینه استاندارد",
    value: PaymentCostsTitleProps.coiStandard,
  },
  {
    label: "COI هزینه های متفرقه",
    value: PaymentCostsTitleProps.coiOthers,
  },
  {
    label: "IC هزینه بازرسی",
    value: PaymentCostsTitleProps.icInspection,
  },
  {
    label: "IC هزینه بازاریابی",
    value: PaymentCostsTitleProps.icMarketing,
  },
  {
    label: "IC هزینه های متفرقه",
    value: PaymentCostsTitleProps.icOthres,
  },
  {
    label: "عملیاتی2/ هزینه بازرسی",
    value: PaymentCostsTitleProps.actionInspection,
  },
  {
    label: "عملیاتی2/ هزینه بازاریابی",
    value: PaymentCostsTitleProps.actionMarketing,
  },
  {
    label: "عملیاتی2/ تجهیزات بازرسی کشتی",
    value: PaymentCostsTitleProps.actionShip,
  },
  {
    label: "عملیاتی2/ هزینه های متفرقه",
    value: PaymentCostsTitleProps.actionOthers,
  },
];
