export enum InspectionMethod {
  Destination = "destination",
  Source = "source",
  DocumentInspection = "document-inspection",
  TechnicalSpec = "technical-spec",
  VOC = "voc",
  VOC2 = "voc2",
  // CoopOperation = "cooperation-agreement",
  // Export = "export",
}

export const inspectionMethod: { [key in InspectionMethod]: string } = {
  [InspectionMethod.Source]: "مبدا",
  [InspectionMethod.Destination]: "مقصد",
  [InspectionMethod.DocumentInspection]: "بازرسی اسنادی",
  [InspectionMethod.TechnicalSpec]: "مشخصات فنی",
  [InspectionMethod.VOC]: "VOC",
  [InspectionMethod.VOC2]: "VOC2",
  // [InspectionMethod.CoopOperation]: "قرارداد همکاری",
  // [InspectionMethod.Export]: "صادرات",
};

export const inspectionMethods: { label: string; value: InspectionMethod }[] =
  Object.keys(inspectionMethod).map((k) => {
    const key = k as InspectionMethod;
    return { label: inspectionMethod[key], value: key };
  });
