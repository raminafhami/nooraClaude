import { Task } from "@/felo/tasks/models/Task";

interface ApplicationTask {
  task: Task;
  assigneeName?: string;
  userNames: string[];
  groupNames: string[];
}

export type { ApplicationTask };
