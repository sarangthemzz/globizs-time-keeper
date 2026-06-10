"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { formatDate } from "@/lib/time-utils";
import { format } from "date-fns";

interface DateSelectorProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export default function DateSelector({
  selectedDate,
  onDateChange,
}: DateSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-300">
        Select Date
      </label>

      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start text-left font-normal gap-2 border-neutral-700 bg-neutral-800 text-slate-100 hover:bg-neutral-700 hover:text-white"
          >
            <CalendarIcon className="h-4 w-4" />
            {formatDate(selectedDate)}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 border-neutral-700 bg-neutral-900 text-slate-100" align="start">
          <Calendar
            className="rounded-md bg-neutral-900 text-slate-100"
            classNames={{
              caption_label: "text-sm font-medium text-slate-100",
              head_cell: "text-slate-400 rounded-md w-9 font-normal text-[0.8rem]",
              nav_button: "h-7 w-7 border-neutral-700 bg-neutral-800 p-0 text-slate-300 opacity-80 hover:bg-neutral-700 hover:text-white hover:opacity-100",
              cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-neutral-800 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
              day: "h-9 w-9 p-0 font-normal text-slate-200 hover:bg-neutral-800 hover:text-white aria-selected:opacity-100",
              day_selected: "bg-green-700 text-white hover:bg-green-800 hover:text-white focus:bg-green-700 focus:text-white",
              day_today: "bg-neutral-800 text-slate-50",
              day_outside: "day-outside text-slate-500 opacity-50 aria-selected:bg-neutral-800 aria-selected:text-slate-400 aria-selected:opacity-30",
              day_disabled: "text-slate-600 opacity-50",
            }}
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
              if (date) {
                onDateChange(date);
                setIsOpen(false);
              }
            }}
            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      <p className="text-xs text-slate-400">
        Currently viewing: <span className="font-semibold">{format(selectedDate, "EEEE, MMMM d, yyyy")}</span>
      </p>
    </div>
  );
}
