export interface PersonnelScheduleCreateModel {
  userIds: string[];
  dates: string[];
  workingTimeRegulationId: string | null;
}
