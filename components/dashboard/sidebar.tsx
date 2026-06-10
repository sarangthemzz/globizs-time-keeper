"use client";

import { Button } from "@/components/ui/button";
import { History } from "lucide-react";

interface SidebarProps {
  onOpenHistory: () => void;
}

export default function Sidebar({ onOpenHistory }: SidebarProps) {
  return (
    <div className="h-full bg-neutral-900 p-6 flex flex-col">
      <div className="space-y-4">
        <Button
          onClick={onOpenHistory}
          variant="outline"
          className="w-full gap-2 border-neutral-700 bg-neutral-800 text-slate-100 hover:bg-neutral-700 hover:text-white"
        >
          <History className="h-4 w-4" />
          View History
        </Button>
      </div>

      <div className="text-sm text-slate-400 space-y-2 mt-auto border-t border-neutral-800/60 pt-4">
        <p className="font-semibold text-slate-300 text-xs tracking-wider uppercase">About</p>
        <p className="leading-relaxed">
          Create and save your schedules with ease. View your submission
          history and track all submitted time slots.
        </p>
      </div>
    </div>
  );
}
