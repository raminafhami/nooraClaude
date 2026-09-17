export enum PersonnelRequestType {
  hourlyLeave = "hourlyLeave",
  dailyLeave = "dailyLeave",
  dailyMission = "dailyMission",
  hourlyMission = "hourlyMission",
  extra = "extra",
}

export const personnelRequestType: { [key in PersonnelRequestType]: string } = {
  [PersonnelRequestType.extra]: "اضافه کاری",
  [PersonnelRequestType.hourlyLeave]: "مرخصی ساعتی",
  [PersonnelRequestType.dailyLeave]: "مرخصی روزانه",
  [PersonnelRequestType.hourlyMission]: "مأموریت ساعتی",
  [PersonnelRequestType.dailyMission]: "مأموریت روزانه",
};
