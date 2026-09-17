export interface UserTaskSearchBody {
  id: string;
  processDefinitionId: string;
  processDefinitionKey: string;
  processDefinitionName: string;
  processInstanceId: string;
  caseNo: string;
  rootProcessInstanceId: string;
  taskId: string;
  key: string;
  summary: string;
  description: string;
  assignee: string;
  expStartDate: number;
  expEndDate: number;
  dueDate: number;
  timeStarted: number;
  timeCompleted: number;
  status: string;
  createdBy: string;
  completedBy: string;
  updatedBy: string;
  history: {
    timeActivated: number;
    timeStarted: number;
    timeCompleted: number;
  };
  referredBy: string;
  readAt: string;
  createdAt: string;
  year: number;
  month: number;
  dayOfYear: number;
}
