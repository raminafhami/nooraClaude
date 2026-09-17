import { memo, useMemo } from "react";

interface Props {
  date: string | undefined;
}

export const TaskItemDate = memo(function TaskItemDate({ date }: Props) {
  const actualDate = useMemo<Date | null>(() => {
    return date ? new Date(date) : null;
  }, [date]);

  if (!actualDate) {
    return "-";
  }

  return (
    <div className="text-xs space-y-2">
      <div>
        {actualDate.toLocaleTimeString("fa-IR-u-nu-latn", {
          calendar: "persian",
          hour: "2-digit",
          minute: "2-digit",
        })}
        {"، "}
        {actualDate.toLocaleDateString("fa-IR-u-nu-latn", {
          calendar: "persian",
          weekday: "long",
        })}
      </div>
      <div>
        {actualDate.toLocaleDateString("fa-IR-u-nu-latn", {
          calendar: "persian",
          dateStyle: "long",
        })}
      </div>
    </div>
  );
});
