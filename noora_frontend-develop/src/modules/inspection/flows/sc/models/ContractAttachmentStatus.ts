export enum ContractAttachmentStatus {
  Yes = "yes",
  No = "no",
}

export const contractAttachmentStatus: {
  [key in ContractAttachmentStatus]: string;
} = {
  [ContractAttachmentStatus.Yes]: "دارد",
  [ContractAttachmentStatus.No]: "ندارد",
};

export const contractAttachmentStatuses: {
  label: string;
  value: ContractAttachmentStatus;
}[] = Object.keys(contractAttachmentStatus).map((k) => {
  const key = k as ContractAttachmentStatus;
  return { label: contractAttachmentStatus[key], value: key };
});
