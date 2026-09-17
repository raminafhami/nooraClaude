import {
  ControlProps,
  CSSObjectWithLabel,
  GroupBase,
  StylesConfig,
} from "react-select";

export const ReactSelectStyle: any = {
  control: (base: CSSObjectWithLabel) => ({
    ...base,
    borderRadius: "12px",
    boxShadow: "none !important",
    borderColor: "E5E7EB",
    ":hover": {
      borderColor: "#E5E7EB",
    },

    ":focus-within": {
      borderColor: "#cccccc",
    },
  }),
  indicatorSeparator: () => ({
    display: "none",
  }),
  option: (base: CSSObjectWithLabel) => ({
    ...base,
    backgroundColor: "transparent",
    color: "#000",
    ":hover": {
      backgroundColor: "#20418C1F",
      color: "#20418e",
    },
    ":active": {
      ...base[":active"],
      backgroundColor: "transparent",
    },
  }),
  menu: (base: CSSObjectWithLabel) => ({
    ...base,
    borderRadius: "12px",
  }),
  multiValue: (base: CSSObjectWithLabel) => ({
    ...base,
    borderRadius: "6px",
    padding: "2px",
  }),
  multiValueLabel: (base: CSSObjectWithLabel) => ({
    ...base,
    fontWeight: "bold",
  }),
  multiValueRemove: (base: CSSObjectWithLabel) => ({
    ...base,
    color: "#900000",
    fontWeight: "bold",
    ":hover": {
      backgroundColor: "#800000",
      color: "white",
    },
  }),
};
