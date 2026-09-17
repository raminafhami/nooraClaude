import { memo } from "react";

interface Props {
  date: Date | undefined;
}

export const ApplicationItemDate = memo(function ApplicationItemDate({
  date,
}: Props) {
  if (!date) {
    return "-";
  }

  return (
    <div className="text-xs space-y-2">
      <div>
        {date.toLocaleTimeString("fa-IR-u-nu-latn", {
          calendar: "persian",
          hour: "2-digit",
          minute: "2-digit",
        })}
        {"، "}
        {date.toLocaleDateString("fa-IR-u-nu-latn", {
          calendar: "persian",
          weekday: "long",
        })}
      </div>
      <div>
        {date.toLocaleDateString("fa-IR-u-nu-latn", {
          calendar: "persian",
          dateStyle: "long",
        })}
      </div>
    </div>
  );
});
