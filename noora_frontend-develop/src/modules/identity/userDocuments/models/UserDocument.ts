export interface UserDocument {
  id: string;
  userId: string;
  title: string;
  key: string | null;
  status: string;
  createBy: string;
  modifyBy: string | null;
  modifyAt: string | null;
  createAt: string;
}
