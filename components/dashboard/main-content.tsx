"use client";

import { useEffect, useState } from "react";
import DateSelector from "./date-selector";
import TimeSlotBuilder from "./time-slot-builder";
import UserInfoModal from "./user-info-modal";
import { useSession } from "next-auth/react";
import type { TrackedLocation } from "./location-tracker";

const getDisplayFirstName = (name?: string | null) => {
  const firstName = name?.trim().split(/\s+/)[0] ?? "";

  if (!firstName) return "";

  return `${firstName.charAt(0).toUpperCase()}${firstName.slice(1).toLowerCase()}`;
};

const formatDateForApi = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

interface MainContentProps {
  latestLocation: TrackedLocation | null;
}

export default function MainContent({ latestLocation }: MainContentProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isUserInfoOpen, setIsUserInfoOpen] = useState(false);
  const [isCheckingExistingTimeLog, setIsCheckingExistingTimeLog] = useState(false);
  const [hasExistingTimeLog, setHasExistingTimeLog] = useState(false);
  const { data: session } = useSession();
  const userId = session?.user?.id ? Number(session.user.id) : null;
  const displayName = getDisplayFirstName(session?.user?.name);

  useEffect(() => {
    let ignoreResult = false;

    if (!userId) {
      setHasExistingTimeLog(false);
      setIsCheckingExistingTimeLog(false);
      return;
    }

    const selectedDateKey = formatDateForApi(selectedDate);

    async function checkExistingTimeLog() {
      try {
        setIsCheckingExistingTimeLog(true);
        setHasExistingTimeLog(false);

        const response = await fetch(`/api/timelog/user/${userId}`);
        if (!response.ok) {
          throw new Error("Failed to check existing time logs");
        }

        const timeLogs = await response.json() as Array<{ logDate: string }>;
        const exists = timeLogs.some((timeLog) => timeLog.logDate.slice(0, 10) === selectedDateKey);

        if (!ignoreResult) {
          setHasExistingTimeLog(exists);
        }
      } catch (error) {
        console.error("Existing time log check failed:", error);

        if (!ignoreResult) {
          setHasExistingTimeLog(false);
        }
      } finally {
        if (!ignoreResult) {
          setIsCheckingExistingTimeLog(false);
        }
      }
    }

    void checkExistingTimeLog();

    return () => {
      ignoreResult = true;
    };
  }, [selectedDate, userId]);

  return (
    <div className="h-full bg-neutral-950 overflow-y-auto p-2 text-slate-100 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="mb-1 font-heading leading-tight text-3xl md:text-5xl font-bold tracking-tight">
            {displayName ? (
              <>
                <span className="text-slate-400 font-light">Welcome, </span>
                <button
                  type="button"
                  onClick={() => setIsUserInfoOpen(true)}
                  className="rounded-md bg-gradient-to-r from-cyan-300 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent drop-shadow-[0_0_18px_rgba(192,132,252,0.35)] transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/60"
                >
                  {displayName}
                </button>
              </>
            ) : (
              <span className="bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
                Time Log Builder
              </span>
            )}
          </h1>
          <p className="text-slate-500 text-xs md:text-sm tracking-wide mt-3">
            Create and submit your time intervals for the selected date
          </p>
        </div>

        <div className="space-y-3">
          <DateSelector selectedDate={selectedDate} onDateChange={setSelectedDate} />
          {hasExistingTimeLog && (
            <p role="alert" className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-200">
              Time slots for the current date already exist.
            </p>
          )}
        </div>
        <TimeSlotBuilder
          selectedDate={selectedDate}
          userId={userId}
          latestLocation={latestLocation}
          isDateLocked={hasExistingTimeLog}
          isCheckingDate={isCheckingExistingTimeLog}
          onTimeLogSubmitted={() => setHasExistingTimeLog(true)}
        />
      </div>
      {session?.user && (
        <UserInfoModal
          isOpen={isUserInfoOpen}
          onClose={() => setIsUserInfoOpen(false)}
          user={session.user}
        />
      )}
    </div>
  );
}
