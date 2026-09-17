"use client";

import { createContext, useCallback, useEffect, useRef, useState } from "react";

import { getTimeString } from "@/time/getTimeString";
import { getTimeStringInNum } from "@/time/getTimeStringInNum";
import { subtractTimeString } from "@/time/subtractTimeString";
import { sumTimeString } from "@/time/sumTimeString";

import { AttendanceEntry } from "../models/AttendanceEntry";
import { AttendanceEntryType } from "../models/AttendanceEntryType";
import { Workshift } from "../models/Workshift";
import { createAttendanceEntry } from "../services/createAttendanceEntry";
import { getAttendanceByDate } from "../services/getAttendanceByDate";
import { getOppositeAttendanceEntryType } from "../utils/getOppositeAttendanceEntryType";
import { toAttendanceDateString } from "../utils/toAttendanceDateString";

export type AttendanceContextType = {
  isLoading: boolean;
  error: string | null;
  state: AttendanceEntryType | null;
  entries: AttendanceEntry[];
  workshift: Workshift | null;
  extraTime: number;
  missTime: number;
  totalTime: number;
  addEntry: () => void;
};

export const AttendanceContext = createContext<AttendanceContextType | null>(
  null
);

export function AttendanceProvider({
  children,
}: {
  children?: React.ReactNode;
}): React.ReactNode {
  const [isLoading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<AttendanceEntryType | null>(null);
  const [entries, setEntries] = useState<AttendanceEntry[]>([]);
  const [workshift, setWorkshift] = useState<Workshift | null>(null);

  const [extraTime, setExtraTime] = useState<number>(0);
  const [missTime, setMissTime] = useState<number>(0);
  const [totalTime, setTotalTime] = useState<number>(0);

  const totalTimeTick = useRef<NodeJS.Timeout>();

  const handleAddEntry = useCallback(async (): Promise<void> => {
    const time = getTimeString(new Date());

    const addedEntry = await createAttendanceEntry({
      time,
    });

    if (!addedEntry) {
      return;
    }

    const newState = getOppositeAttendanceEntryType(state);
    setState(newState);
    setEntries((prev) => [...prev, { time, type: newState }]);
  }, [state, entries.length]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const attendance = await getAttendanceByDate(
          toAttendanceDateString(new Date())
        );

        if (!attendance) {
          return;
        }

        if (attendance.workshift) {
          setWorkshift(attendance.workshift);
        }

        if (attendance.entries.length > 0) {
          setState(attendance.entries.at(-1)!.type);
          setEntries(attendance.entries);
        }

        const totalTime = (([hours, minutes, seconds]): number => {
          let duration = (hours * 3600 + minutes * 60 + seconds) * 1000;

          const lastEntry = attendance.entries.at(-1);
          if (lastEntry?.type === AttendanceEntryType.ClockIn) {
            duration +=
              new Date().getTime() -
              Date.parse(`${attendance.date}T${lastEntry.time}`);
          }

          return duration;
        })(attendance.totalTime.split(":").map((x: string) => +x));

        // Todo: incomplete extra time calculation
        // let extraTime = ((): number => {
        //   if (!workshift || !totalTime) {
        //     return 0;
        //   }

        //   const workshiftDuration = subtractTimeString(
        //     workshift.exitTime,
        //     workshift.entryTime
        //   );

        //   let extraStartDate: Date;

        //   const workshiftEndTime = getTimeStringInNum(
        //     sumTimeString(workshift.entryTime, workshift.flexible)
        //   );
        //   const personshiftEndTime = 0;
        //   // const extraEntries = attendance.entries.filter(entry => )

        //   return 0;
        // })();

        setTotalTime(totalTime);
      } catch (err: any) {
        console.log(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!state || state === AttendanceEntryType.ClockOut) {
      clearInterval(totalTimeTick.current);
    } else {
      totalTimeTick.current = setInterval(() => {
        setTotalTime((prev) => prev + 1000);
      }, 1000);
    }
  }, [state]);

  useEffect(() => {
    (async () => {
      if (state === AttendanceEntryType.ClockOut) {
        const attendance = await getAttendanceByDate(
          toAttendanceDateString(new Date())
        );
        if (!attendance) return;
        setExtraTime(getTimeStringInNum(attendance.extraTime));
        setMissTime(getTimeStringInNum(attendance.missTime));
      }
    })();
  }, [state]);

  return (
    <AttendanceContext.Provider
      value={{
        isLoading,
        error,
        state,
        entries,
        extraTime,
        missTime,
        totalTime,
        workshift,
        addEntry: handleAddEntry,
      }}
    >
      {children}
    </AttendanceContext.Provider>
  );
}
