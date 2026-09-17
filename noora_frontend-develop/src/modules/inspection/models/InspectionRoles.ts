enum InspectionRole {
  TechnicalExpert = "technical-expert",
  SeniorExpert = "senior-expert",
  TechnicalManager = "technical-manager",
}

const inspectionRole: { [key in InspectionRole]: string } = {
  [InspectionRole.TechnicalExpert]: "کارشناس فنی",
  [InspectionRole.SeniorExpert]: "کارشناس ارشد",
  [InspectionRole.TechnicalManager]: "مدیر فنی",
};

const inspectionRoleOptions: { label: string; value: InspectionRole }[] = (
  Object.keys(inspectionRole) as InspectionRole[]
).map((k) => {
  return { label: inspectionRole[k], value: k };
});

export { InspectionRole, inspectionRole, inspectionRoleOptions };
