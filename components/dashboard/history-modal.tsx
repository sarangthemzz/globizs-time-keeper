"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { formatDate, formatTime } from "@/lib/time-utils";
import { Search, Calendar, Loader2 } from "lucide-react";

interface TimeLog {
  id: number;
  userId: number;
  logDate: string;
  createdAt: string;
  startTime: string;
  endTime: string;
  work: string;
}

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HistoryModal({ isOpen, onClose }: HistoryModalProps) {
  const { data: session } = useSession();
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [groupedTimeLogs, setGroupedTimeLogs] = useState<Record<string, TimeLog[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchDate, setSearchDate] = useState("");

  const filterSchedules = useCallback(() => {
    if (!searchDate.trim()) {
      const groups = timeLogs.reduce<Record<string, TimeLog[]>>((accumulator, timeLog) => {
        const key = timeLog.logDate;
        if (!accumulator[key]) {
          accumulator[key] = [];
        }

        accumulator[key].push(timeLog);
        return accumulator;
      }, {});

      setGroupedTimeLogs(groups);
      return;
    }

    const filtered = timeLogs.filter((timeLog) =>
      formatDate(timeLog.logDate).toLowerCase().includes(searchDate.toLowerCase())
    );
    const groups = filtered.reduce<Record<string, TimeLog[]>>((accumulator, timeLog) => {
      const key = timeLog.logDate;
      if (!accumulator[key]) {
        accumulator[key] = [];
      }

      accumulator[key].push(timeLog);
      return accumulator;
    }, {});

    setGroupedTimeLogs(groups);
  }, [searchDate, timeLogs]);

  useEffect(() => {
    if (isOpen) {
      fetchTimeLogs();
    }
  }, [isOpen]);

  useEffect(() => {
    filterSchedules();
  }, [filterSchedules]);

  const fetchTimeLogs = async () => {
    if (!session?.user?.id) {
      setTimeLogs([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`/api/timelog/user/${session.user.id}`);
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setTimeLogs(data);
    } catch (error) {
      console.error("Error fetching time logs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        onOpenAutoFocus={(event) => event.preventDefault()}
        className="max-w-2xl max-h-[80vh] flex flex-col border-neutral-800 bg-neutral-950 text-slate-100"
      >
        <DialogHeader>
          <DialogTitle>Time Log History</DialogTitle>
          <DialogDescription>
            View all your submitted time intervals and daily submissions
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by date..."
              value={searchDate}
              onChange={(e) => setSearchDate(e.target.value)}
              className="pl-10 border-neutral-700 bg-neutral-900 text-slate-100 placeholder:text-slate-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3">
          {isLoading ? (
            <div
              role="status"
              aria-live="polite"
              className="flex h-40 flex-col items-center justify-center gap-3 text-slate-400"
            >
              <Loader2 className="h-8 w-8 animate-spin text-slate-300" aria-hidden="true" />
              <p className="text-sm">Loading history...</p>
            </div>
          ) : Object.keys(groupedTimeLogs).length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-slate-400">
              <Calendar className="h-8 w-8 mb-2 opacity-50" />
              <p>No time logs found</p>
            </div>
          ) : (
            Object.entries(groupedTimeLogs)
              .sort(([leftDate], [rightDate]) => rightDate.localeCompare(leftDate))
              .map(([logDate, entries]) => (
              <div
                key={logDate}
                className="border border-neutral-700 rounded-lg p-4 space-y-2 bg-neutral-900 hover:bg-neutral-800 transition"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-50">
                      {formatDate(logDate)}
                    </p>
                    <p className="text-xs text-slate-400">
                      Submitted: {formatDate(entries[0]?.createdAt ?? logDate)} {formatTime(entries[0]?.createdAt ?? logDate)}
                    </p>
                  </div>
                </div>

                <div className="bg-neutral-950 rounded p-2 space-y-1 border border-neutral-800">
                  <p className="text-xs font-medium text-slate-300 mb-2">
                    Time Intervals:
                  </p>
                  {entries
                    .slice()
                    .sort((left, right) => left.startTime.localeCompare(right.startTime))
                    .map((slot) => (
                    <div
                      key={slot.id}
                      className="text-sm text-slate-200 font-mono"
                    >
                      {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                      {slot.work && (
                        <span className="ml-2 text-xs text-green-300">
                          {slot.work}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
