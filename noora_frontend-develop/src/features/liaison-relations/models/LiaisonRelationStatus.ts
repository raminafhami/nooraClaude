export enum LiaisonRelationStatus {
  Active = "active",
  Deactive = "deactive",
}

export const liaisonRelationStatus: { [key in LiaisonRelationStatus]: string } =
  {
    [LiaisonRelationStatus.Active]: "فعال",
    [LiaisonRelationStatus.Deactive]: "غیرفعال",
  };
