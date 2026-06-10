"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, X } from "lucide-react";
import { formatTime24HourIST, parseTime } from "@/lib/time-utils";
import type { TrackedLocation } from "./location-tracker";

interface TimeSlot {
  id: string;
  startTime: Date;
  endTime: Date | null;
  endTimeInput: string;
  endTimePeriod: "AM" | "PM";
  workType: string;
}

interface TimeSlotBuilderProps {
  selectedDate: Date;
  userId: number | null;
  latestLocation: TrackedLocation | null;
}

const DEFAULT_START_TIME = "09:00";

const formatTimeForApi = (date: Date) => formatTime24HourIST(date);
const getTimePeriod = (date: Date): "AM" | "PM" => date.getHours() >= 12 ? "PM" : "AM";
const formatStartTimeForDisplay = (date: Date) => {
  const hours = date.getHours() % 12 || 12;
  const minutes = date.getMinutes();

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

const formatDateForApi = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const getDefaultStartTime = (date: Date) => {
  const [hours, minutes] = DEFAULT_START_TIME.split(":").map(Number);

  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    hours,
    minutes,
    0,
    0
  );
};

const createSlot = (id: string, startTime: Date): TimeSlot => ({
  id,
  startTime,
  endTime: null,
  endTimeInput: "",
  endTimePeriod: getTimePeriod(startTime),
  workType: "",
});

const nextSlotId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const setTimePeriod = (date: Date, period: "AM" | "PM") => {
  const updatedDate = new Date(date);
  const hours = updatedDate.getHours();

  if (period === "AM" && hours >= 12) {
    updatedDate.setHours(hours - 12);
  }

  if (period === "PM" && hours < 12) {
    updatedDate.setHours(hours + 12);
  }

  return updatedDate;
};

const isMidnight = (date: Date) => date.getHours() === 0 && date.getMinutes() === 0;
const exceedsMidnight = (startTime: Date, endTime: Date) => {
  if (isMidnight(startTime)) {
    return true;
  }

  return getTimePeriod(startTime) === "PM" && getTimePeriod(endTime) === "AM" && !isMidnight(endTime);
};

const formatEndTimeInput = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 4);

  if (digits.length <= 2) {
    return digits;
  }

  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
};

const hasInvalidMinuteInput = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  const minuteDigits = digits.slice(2);

  if (minuteDigits.length === 0) {
    return false;
  }

  if (minuteDigits.length === 1) {
    return Number(minuteDigits) > 5;
  }

  return Number(minuteDigits) >= 60;
};

export default function TimeSlotBuilder({ selectedDate, userId, latestLocation }: TimeSlotBuilderProps) {
  const [slots, setSlots] = useState<TimeSlot[]>([
    createSlot("1", getDefaultStartTime(selectedDate)),
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusSlotId, setFocusSlotId] = useState<string | null>(null);
  const endTimeInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const hasStartedEnteringTime = slots.some((slot) => slot.endTimeInput.trim() || slot.endTime || slot.workType) || slots.length > 1;

  useEffect(() => {
    setSlots([createSlot("1", getDefaultStartTime(selectedDate))]);
    setFocusSlotId("1");
  }, [selectedDate]);

  useEffect(() => {
    if (!focusSlotId) return;

    const input = endTimeInputRefs.current[focusSlotId];
    if (input) {
      input.focus();
    }

    setFocusSlotId(null);
  }, [focusSlotId, slots]);

  const updateSlotEndTime = useCallback(
    (slotId: string, timeString: string) => {
      if (hasInvalidMinuteInput(timeString)) {
        toast.error("Invalid time entry. Minutes must be between 00 and 59");
        return;
      }

      const formattedTimeString = formatEndTimeInput(timeString);

      if (!formattedTimeString) {
        setSlots((prevSlots) =>
          prevSlots.map((s) =>
            s.id === slotId
              ? { ...s, endTime: null, endTimeInput: "", endTimePeriod: getTimePeriod(s.startTime) }
              : s
          )
        );
        return;
      }

      const parsedTime = parseTime(formattedTimeString);
      if (!parsedTime) {
        setSlots((prevSlots) =>
          prevSlots.map((s) =>
            s.id === slotId
              ? { ...s, endTime: null, endTimeInput: formattedTimeString }
              : s
          )
        );
        return;
      }

      setSlots((prevSlots) => {
        const slotIndex = prevSlots.findIndex((s) => s.id === slotId);
        if (slotIndex === -1) return prevSlots;

        const updatedEndTime = new Date(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          selectedDate.getDate(),
          parsedTime.getHours(),
          parsedTime.getMinutes()
        );
        const periodAdjustedEndTime = setTimePeriod(
          updatedEndTime,
          prevSlots[slotIndex].endTimePeriod
        );

        if (exceedsMidnight(prevSlots[slotIndex].startTime, periodAdjustedEndTime)) {
          toast.error("Time cannot exceed midnight");

          return prevSlots.map((s, idx) =>
            idx === slotIndex
              ? {
                ...s,
                endTime: null,
                endTimeInput: formatStartTimeForDisplay(periodAdjustedEndTime),
                endTimePeriod: getTimePeriod(periodAdjustedEndTime),
              }
              : s
          );
        }

        // Preserve all existing slots and insert the updated slot
        const updatedSlots = prevSlots.map((s, idx) =>
          idx === slotIndex
            ? {
              ...s,
              endTime: periodAdjustedEndTime,
              endTimeInput: formatStartTimeForDisplay(periodAdjustedEndTime),
              endTimePeriod: getTimePeriod(periodAdjustedEndTime),
            }
            : s
        );

        const generatedSlotId = nextSlotId();
        // Append a new slot after the updated one to allow unlimited entries
        updatedSlots.push(createSlot(generatedSlotId, periodAdjustedEndTime));
        setFocusSlotId(generatedSlotId);

        return updatedSlots;
      });
    },
    [selectedDate]
  );

  const validateSlotEndTime = useCallback((slot: TimeSlot) => {
    if (!slot.endTimeInput.trim()) return;

    const parsedTime = parseTime(slot.endTimeInput);
    if (!parsedTime) {
      toast.error("Invalid time format. Use HH:MM");
      return;
    }

  }, []);

  const clearSlotEndTime = useCallback((slotId: string) => {
    setSlots((prevSlots) =>
      prevSlots.map((slot) =>
        slot.id === slotId
          ? { ...slot, endTime: null, endTimeInput: "", endTimePeriod: getTimePeriod(slot.startTime) }
          : slot
      )
    );
    setFocusSlotId(null);
  }, []);

  const clearSlot = useCallback((slotId: string) => {
    let nextFocusSlotId: string | null = null;

    setSlots((prevSlots) => {
      const slotIndex = prevSlots.findIndex((slot) => slot.id === slotId);
      if (slotIndex === -1) return prevSlots;

      if (slotIndex === 0) {
        return prevSlots.map((slot) =>
          slot.id === slotId
            ? { ...slot, endTime: null, endTimeInput: "", endTimePeriod: getTimePeriod(slot.startTime) }
            : slot
        );
      }

      nextFocusSlotId = prevSlots[slotIndex + 1]?.id ?? prevSlots[slotIndex - 1]?.id ?? null;

      return prevSlots.filter((slot) => slot.id !== slotId);
    });

    setFocusSlotId(nextFocusSlotId);
  }, []);

  const resetSlots = useCallback(() => {
    setSlots([createSlot("1", getDefaultStartTime(selectedDate))]);
    setFocusSlotId("1");
  }, [selectedDate]);

  const updateSlotWorkType = useCallback((slotId: string, workType: string) => {
    setSlots((prevSlots) =>
      prevSlots.map((slot) =>
        slot.id === slotId
          ? { ...slot, workType }
          : slot
      )
    );
  }, []);

  const updateSlotStartPeriod = useCallback((slotId: string, period: "AM" | "PM") => {
    setSlots((prevSlots) =>
      prevSlots.map((slot) => {
        const slotIndex = prevSlots.findIndex((item) => item.id === slotId);
        if (slotIndex === -1) return slot;
        const currentIndex = prevSlots.findIndex((item) => item.id === slot.id);
        if (currentIndex < slotIndex) return slot;

        return {
          ...slot,
          startTime: setTimePeriod(slot.startTime, period),
          endTime: slot.endTime ? setTimePeriod(slot.endTime, period) : slot.endTime,
          endTimePeriod: period,
        };
      })
    );
  }, []);

  const updateSlotEndPeriod = useCallback((slotId: string, period: "AM" | "PM") => {
    setSlots((prevSlots) =>
      prevSlots.map((slot) => {
        const slotIndex = prevSlots.findIndex((item) => item.id === slotId);
        if (slotIndex === -1) return slot;
        const currentIndex = prevSlots.findIndex((item) => item.id === slot.id);
        if (currentIndex < slotIndex) return slot;

        if (
          currentIndex === slotIndex &&
          slot.endTime &&
          exceedsMidnight(slot.startTime, setTimePeriod(slot.endTime, period))
        ) {
          toast.error("Time cannot exceed midnight");

          return {
            ...slot,
            endTime: null,
            endTimePeriod: period,
          };
        }

        return {
          ...slot,
          startTime: currentIndex > slotIndex ? setTimePeriod(slot.startTime, period) : slot.startTime,
          endTime: slot.endTime ? setTimePeriod(slot.endTime, period) : slot.endTime,
          endTimePeriod: period,
        };
      })
    );
  }, []);

  const handleSubmit = async () => {
    const completedSlots = slots.filter((slot) => slot.endTime);

    if (completedSlots.length === 0) {
      toast.error("Please fill at least one time slot before submitting");
      return;
    }

    if (slots.some((slot) => slot.endTimeInput.trim() && !slot.endTime)) {
      toast.error("Please fix any invalid time slots before submitting");
      return;
    }

    if (!userId) {
      toast.error("You must be signed in to submit time logs");
      return;
    }

    setIsSubmitting(true);

    try {
      const entries = completedSlots
        .slice()
        .sort((left, right) => left.startTime.getTime() - right.startTime.getTime())
        .map((slot) => ({
          startTime: formatTimeForApi(slot.startTime),
          endTime: slot.endTime ? formatTimeForApi(slot.endTime) : slot.endTimeInput.trim(),
          work: slot.workType.trim(),
        }));

      const response = await fetch("/api/timelog", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          logDate: formatDateForApi(selectedDate),
          entries,
          location: latestLocation,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || "Failed to submit time log");
      }

      toast.success("Time log submitted successfully!");

      // Reset form
      setSlots([
        createSlot("1", getDefaultStartTime(selectedDate)),
      ]);
      setFocusSlotId(null);
    } catch (error) {
      console.error("Error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to submit time log. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 bg-neutral-900 rounded-lg border border-neutral-800 p-1 text-slate-100 sm:p-3">
      {isSubmitting && (
        <div
          role="status"
          aria-live="polite"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-neutral-950/70 backdrop-blur-sm"
        >
          <div className="flex items-center gap-3 rounded-md border border-neutral-700 bg-neutral-900 px-5 py-3 text-sm font-medium text-slate-100 shadow-2xl">
            <Loader2 className="h-5 w-5 animate-spin text-green-400" aria-hidden="true" />
            <span>Submitting time...</span>
          </div>
        </div>
      )}
      <div>
        <div className="space-y-4">
          {slots.map((slot, slotIndex) => (
            <div
              key={slot.id}
              className="grid gap-2 grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] bg-neutral-950 p-3 rounded-lg border border-neutral-800 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(7rem,0.9fr)_3rem] sm:p-4"
            >
              {/* Start Time */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-300">
                  Start Time
                </label>
                <div className="h-10 flex items-center justify-between gap-2 px-2.5 bg-neutral-800 rounded-md font-mono text-sm text-slate-50 sm:gap-3 sm:px-4">
                  <span>{formatStartTimeForDisplay(slot.startTime)}</span>
                  <span className="flex shrink-0 items-center gap-[0.28rem] text-sm font-semibold tracking-normal sm:gap-[0.5rem] sm:tracking-wide">
                    {slotIndex === 0 ? (
                      <span className="text-slate-100">AM</span>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => updateSlotStartPeriod(slot.id, "AM")}
                          aria-pressed={getTimePeriod(slot.startTime) === "AM"}
                          className={getTimePeriod(slot.startTime) === "AM" ? "text-slate-100" : "text-slate-500 hover:text-slate-300"}
                        >
                          AM
                        </button>
                        <button
                          type="button"
                          onClick={() => updateSlotStartPeriod(slot.id, "PM")}
                          aria-pressed={getTimePeriod(slot.startTime) === "PM"}
                          className={getTimePeriod(slot.startTime) === "PM" ? "text-slate-100" : "text-slate-500 hover:text-slate-300"}
                        >
                          PM
                        </button>
                      </>
                    )}
                  </span>
                </div>
              </div>

              {/* End Time */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-300">
                  End Time
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    inputMode="numeric"
                    maxLength={5}
                    placeholder="10:00"
                    value={slot.endTimeInput}
                    ref={(el) => {
                      endTimeInputRefs.current[slot.id] = el;
                    }}
                    onChange={(e) => updateSlotEndTime(slot.id, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key !== "Enter") return;

                      const digits = e.currentTarget.value.replace(/\D/g, "");
                      if (digits.length !== 3) return;

                      e.preventDefault();
                      updateSlotEndTime(slot.id, `0${digits}`);
                    }}
                    onBlur={() => validateSlotEndTime(slot)}
                    className="font-mono bg-neutral-800 border-neutral-700 text-slate-50 placeholder:text-slate-500 h-10 pl-2.5 pr-[3.65rem] sm:pl-4 sm:pr-24"
                  />
                  <span className="absolute right-1.5 top-1/2 flex -translate-y-1/2 items-center gap-[0.28rem] font-mono text-sm font-semibold tracking-normal sm:right-3 sm:gap-[0.5rem] sm:tracking-wide">
                    <button
                      type="button"
                      onClick={() => updateSlotEndPeriod(slot.id, "AM")}
                      aria-pressed={slot.endTimePeriod === "AM"}
                      className={slot.endTimePeriod === "AM" ? "text-slate-100" : "text-slate-500 hover:text-slate-300"}
                    >
                      AM
                    </button>
                    <button
                      type="button"
                      onClick={() => updateSlotEndPeriod(slot.id, "PM")}
                      aria-pressed={slot.endTimePeriod === "PM"}
                      className={slot.endTimePeriod === "PM" ? "text-slate-100" : "text-slate-500 hover:text-slate-300"}
                    >
                      PM
                    </button>
                  </span>
                </div>
              </div>

              {/* Clear button — 10% column, minimal padding */}
              {/* Work */}
              <div className="col-span-2 col-start-1 space-y-2 sm:col-span-1 sm:col-start-auto">
                <label className="text-xs font-medium text-slate-300">
                  Work
                </label>
                <Input
                  type="text"
                  value={slot.workType}
                  onChange={(e) => updateSlotWorkType(slot.id, e.target.value)}
                  placeholder="Work"
                  className="h-10 bg-neutral-800 px-2 text-sm text-slate-50 placeholder:text-slate-500 border-neutral-700 sm:px-3"
                />
              </div>

              <div className="col-start-3 flex w-fit items-end justify-self-end pb-0 sm:col-auto sm:col-start-auto">
                <Button
                  type="button"
                  aria-label={slotIndex === 0 ? "Clear end time" : "Clear time slot"}
                  onClick={() =>
                    slotIndex === 0
                      ? clearSlotEndTime(slot.id)
                      : clearSlot(slot.id)
                  }
                  variant="ghost"
                  size="icon"
                  className={`shrink-0 w-8 px-1 hover:bg-neutral-800 sm:w-full ${slot.endTimeInput || slot.endTime
                    ? "text-red-400 hover:text-red-300"
                    : "text-red-800/70 hover:text-red-500"
                    }`}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-slate-400 mt-4">
          Format: 12-hour time in IST (e.g., 09:30 AM, 02:45 PM)
        </p>
      </div>

      <div className="flex gap-3 justify-end">
        {hasStartedEnteringTime && (
          <Button
            type="button"
            onClick={resetSlots}
            disabled={isSubmitting}
            variant="outline"
            className="border-neutral-700 bg-neutral-950 text-slate-100 hover:bg-neutral-800 hover:text-white"
          >
            RESET
          </Button>
        )}
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || slots.every((s) => !s.endTime)}
          className={`gap-2 font-semibold ${!isSubmitting && !slots.every((s) => !s.endTime) ? "bg-green-700 text-white hover:bg-green-800" : "bg-gray-600 text-white/80 hover:bg-gray-700"}`}
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          {isSubmitting ? "SUBMITTING..." : "SUBMIT"}
        </Button>
      </div>
    </div>
  );
}
