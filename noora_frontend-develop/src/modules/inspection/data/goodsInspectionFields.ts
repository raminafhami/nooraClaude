import goodsInspectionFields from "../goodsInspectionFields/data/goodsInspectionFields";

const goodsInspectionFieldOptions: {
  value: string;
  label: string;
  visible?: boolean;
}[] = [
  ...goodsInspectionFields.map((x) => ({
    value: x.id,
    label: x.title,
    visible: !Boolean(x.isDeleted),
  })),
];

export { goodsInspectionFieldOptions };
