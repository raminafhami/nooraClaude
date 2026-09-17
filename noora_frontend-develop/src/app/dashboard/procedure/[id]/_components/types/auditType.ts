import { User } from "@/identity/users/models/User";

export type FileObject = {
  title: string;
  id: string;
};

export type AssesstType = {
  description: null | string;
  conflict: null | string;
  files: string[];
  questionDescription: string;
  paraNumber: string;
  state: boolean;
  parent: null | string;
  auditId: string;
  children: string[];
  ancestors: string[];
  createdAt: string;
  updatedAt: string;
  id: string;
};

export type AuditType = {
  title: string;
  category: string;
  reviewNumber: string;
  auditNo: string;
  state: boolean;
  producerId: string;
  seconderId: string;
  approverId: string;
  date: string;
  createdAt: string;
  approver: null | string | any;
  seconder: null | string | any;
  producer: null | string | any;
  id: string;
  changeDescription: string;
  users: User[];
  userGroups: string[];
};

export type ConflictModalType = {
  conflict: string;
  description: string;
};
