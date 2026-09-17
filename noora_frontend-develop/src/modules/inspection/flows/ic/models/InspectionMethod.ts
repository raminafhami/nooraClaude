enum InspectionMethod {
  Source = "source",
  Destination = "destination",
}

const inspectionMethod: { [key in InspectionMethod]: string } = {
  source: "مبدأ",
  destination: "مقصد",
};

const inspectionMethodOptions = Object.entries(inspectionMethod).map(
  ([key, value]) => ({ label: value, value: key })
);

export { InspectionMethod, inspectionMethod, inspectionMethodOptions };
