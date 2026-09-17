import { memo, useCallback, useState } from "react";

import { Attendance } from "@/hrm/attendance/models/Attendance";
import { getAttendances } from "@/hrm/attendance/services/getAttendances";
import { User } from "@/identity/users/models/User";
import { Head } from "@/ui/Head";
import { Seperator } from "@/ui/Seperator";

import { AttendanceManualDataView } from "./DataView";
import { AttendanceManualInitialForm } from "./InitialForm";
import { AttendanceManualResetForm } from "./ResetForm";

interface WidgetData {
  mode: WidgetMode;
  user?: User;
  date?: string;
  attendance?: Attendance;
}

type WidgetMode = "initial" | "data";

export const AttendanceManualWidget = memo(function AttendanceManualWidget() {
  const [data, setData] = useState<WidgetData>({ mode: "initial" });

  const handleInitialFormSubmit = useCallback(
    async (user: User, date: string) => {
      if (data.mode !== "initial") {
        return;
      }

      const attendances = await getAttendances({
        filters: {
          userId: user.id,
          date,
        },
        populate: ["workingTimeRegulation"],
      });

      const attendance = attendances.at(0);

      if (!attendance) {
        throw new Error(
          "در روز مورد نظر، شیفت کاری و یا ورود و خروجی برای کاربر ثبت نشده است."
        );
      }

      setData({
        mode: "data",
        user,
        date,
        attendance,
      });
    },
    [data.mode]
  );

  const handleWidgetReset = useCallback(() => {
    setData({
      mode: "initial",
    });
  }, []);

  return (
    <div className="grid grid-cols-4 gap-x-12">
      <div className="col-span-1 space-y-8">
        <Head.Root>
          <Head.Title>ثبت ورود و خروج دستی</Head.Title>
        </Head.Root>

        <div className="space-y-6">
          <AttendanceManualInitialForm
            disabled={data.mode !== "initial"}
            onSubmit={handleInitialFormSubmit}
          />
          {data.mode === "data" && (
            <>
              <Seperator />
              <AttendanceManualResetForm
                userId={data.user!.id}
                date={data.date!}
                onReset={handleWidgetReset}
              />
            </>
          )}
        </div>
      </div>

      <div className="col-span-3 space-y-8">
        {data.mode === "data" && (
          <>
            <Head.Root>
              <Head.Title>اطلاعات روز کاری کاربر</Head.Title>
            </Head.Root>

            <AttendanceManualDataView attendance={data.attendance} />
          </>
        )}
      </div>
    </div>
  );
});
