import { ReactElement } from "react";

import { Task } from "./Task";

type TaskDetailsReturn<T = any> = {
  schema: any;
  render: ReactElement;
  isCanceling?: (values: { task: Task; data: T }) => boolean;
};

export type { TaskDetailsReturn };
