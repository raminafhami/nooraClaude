import { memo, useMemo } from "react";
import { FaAngleLeft } from "react-icons/fa6";

import { ApplicationTask } from "./models/ApplicationTask";

interface Props {
  tasks: ApplicationTask[];
}

export const ApplicationItemTasks = memo(function ApplicationItemTasks({
  tasks,
}: Props) {
  const todoTasks = useMemo(
    () => tasks.filter((x) => x.task.status === "todo"),
    [tasks]
  );

  if (!todoTasks.length) {
    return "-";
  }

  return (
    <div className="space-y-1">
      {todoTasks.map(({ task, assigneeName, userNames, groupNames }) => (
        <div key={task.id} className="flex gap-1 items-center">
          <span>{task.name}</span>
          <FaAngleLeft className="text-[10px] text-gray-500" />
          <span className="text-gray-500">
            {assigneeName || [...userNames, ...groupNames].join("، ") || "؟"}
          </span>
        </div>
      ))}
    </div>
  );
});
