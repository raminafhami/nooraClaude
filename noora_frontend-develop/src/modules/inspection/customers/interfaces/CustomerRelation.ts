export interface CustomerRelation {
  coordinator: string | { id: string; name: string } | null;
  marketer: string | { id: string; name: string } | null;
  createAt: Date;
  deactiveAt: Date | null;
  status: CustomerRelationStatus;
}

export enum CustomerRelationStatus {
  Active = "active",
  Deactive = "deactive",
}
