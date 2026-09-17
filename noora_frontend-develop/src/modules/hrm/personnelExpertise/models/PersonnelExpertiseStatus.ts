export enum PersonnelExpertiseStatus {
  Unqualified = "unqualified",
  Learning = "learning",
  Qualified = "qualified",
}

export const personnelExpertiseStatus: {
  [key in PersonnelExpertiseStatus]: string;
} = {
  [PersonnelExpertiseStatus.Unqualified]: "ندارد",
  [PersonnelExpertiseStatus.Learning]: "در حال یادگیری",
  [PersonnelExpertiseStatus.Qualified]: "دارد",
};

export const personnelExpertiseStatuses: {
  label: string;
  value: PersonnelExpertiseStatus;
}[] = Object.keys(personnelExpertiseStatus).map((k) => {
  const key = k as PersonnelExpertiseStatus;
  return { label: personnelExpertiseStatus[key], value: key };
});
