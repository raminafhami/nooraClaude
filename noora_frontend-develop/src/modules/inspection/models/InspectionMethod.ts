enum InspectionMethod {
  Destination = "destination",
  Source = "source",
  DocumentInspection = "document-inspection",
  TechnicalSpec = "technical-spec",
  VOC = "voc",
  VOC2 = "voc2",
}

const inspectionMethod: { [key in InspectionMethod]: string } = {
  [InspectionMethod.Source]: "مبدا",
  [InspectionMethod.Destination]: "مقصد",
  [InspectionMethod.DocumentInspection]: "بازرسی اسنادی",
  [InspectionMethod.TechnicalSpec]: "مشخصات فنی",
  [InspectionMethod.VOC]: "VOC",
  [InspectionMethod.VOC2]: "VOC2",
};

const inspectionMethodOptions: { label: string; value: InspectionMethod }[] = (
  Object.keys(inspectionMethod) as InspectionMethod[]
).map((k) => {
  return { label: inspectionMethod[k], value: k };
});

export { InspectionMethod, inspectionMethod, inspectionMethodOptions };
