export enum PersonnelRequestStatusType {
  // pendingForManager = "pendingForManager",
  // pendingForSubstitute = "pendingForSubstitute",
  counted = "counted",
  rejected = "rejected",
  canceled = "canceled",
  waitingConfirmation = "waitingConfirmation",
}

export const personnelRequestStatusType: {
  [key in PersonnelRequestStatusType]: string;
} = {
  [PersonnelRequestStatusType.canceled]: "لغو شده",
  [PersonnelRequestStatusType.rejected]: "رد شده",
  [PersonnelRequestStatusType.counted]: "تایید شده",
  // [PersonnelRequestStatueType.pendingForSubstitute]: "در انتظار تایید جانشین",
  // [PersonnelRequestStatueType.pendingForManager]: "در انتظار تایید مدیر",
  [PersonnelRequestStatusType.waitingConfirmation]: "در انتظار تایید",
};
