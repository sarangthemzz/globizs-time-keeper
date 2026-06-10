"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { LogoText } from "@/components/logo";
import { Button } from "@/components/ui/button";

import { Menu } from "lucide-react";
import Sidebar from "./sidebar";
import MainContent from "./main-content";
import HistoryModal from "./history-modal";
import LocationTracker, { type TrackedLocation } from "./location-tracker";

export default function DashboardLayout() {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [latestLocation, setLatestLocation] = useState<TrackedLocation | null>(null);

  const handleSignOut = async () => {
    await signOut({ redirect: true, redirectTo: "/" });
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-slate-100">
      <LocationTracker onLocationChange={setLatestLocation} />
      {/* Backdrop Overlay with stronger blur and gray slate color */}
      <div
        className={`fixed inset-0 bg-neutral-950/75 backdrop-blur-md z-50 transition-opacity duration-300 ${
          isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMenuOpen(false)}
      />

      {/* Slide panel from right, taking 80% width */}
      <div
        className={`fixed right-0 top-0 bottom-0 w-[80%] min-w-[240px] bg-neutral-900 border-l border-neutral-800 z-50 p-6 flex flex-col gap-6 shadow-2xl transition-transform duration-300 ease-in-out ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Close Button Header */}
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-400 hover:text-white hover:bg-neutral-800 rounded-lg"
            onClick={() => setIsMenuOpen(false)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>

        {/* Menu items list */}
        <div className="flex flex-col gap-1">
          {/* View History Button */}
          <Button
            variant="ghost"
            className="w-full justify-start border border-slate-400 text-slate-400 hover:bg-neutral-800 hover:text-slate-100 py-1.5 px-4 rounded-lg text-base font-medium transition-all"
            onClick={() => {
              setIsHistoryOpen(true);
              setIsMenuOpen(false);
            }}
          >
            View History
          </Button>

          {/* Horizontal off-white line */}
          <div className="h-px bg-slate-200/20 my-0.5" />

          {/* Sign Out Button directly below */}
          <Button
            variant="ghost"
            className="w-full justify-start text-slate-200 hover:bg-neutral-800 hover:text-emerald-400 py-1.5 px-4 rounded-lg text-base font-medium transition-all"
            onClick={() => {
              setIsMenuOpen(false);
              handleSignOut();
            }}
          >
            Sign Out
          </Button>
        </div>
      </div>

      {/* Header */}
      <header className="border-b border-neutral-800 bg-neutral-900/95 backdrop-blur sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <LogoText />
          <div className="flex items-center gap-2">
            <div className="md:hidden">
              <button
                className="w-10 h-10 rounded-lg bg-gradient-to-r from-emerald-600 via-green-500 to-lime-400 p-[1.5px] transition-all hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                aria-label="Open options menu"
                onClick={() => setIsMenuOpen(true)}
              >
                  <div className="w-full h-full rounded-[7px] bg-neutral-900 hover:bg-neutral-800/80 flex items-center justify-center text-slate-100 hover:text-emerald-400 transition-colors">
                  <Menu className="h-5 w-5" />
                </div>
              </button>
            </div>

            <div className="hidden md:block">
              <button
                onClick={handleSignOut}
                className="rounded-lg border border-slate-400 bg-transparent transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-slate-400/40"
              >
                <span className="flex items-center px-4 py-1.5 rounded-[7px] bg-transparent text-sm font-extrabold text-slate-400 transition-all duration-200 hover:bg-neutral-800 hover:text-slate-100">
                  Sign Out
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-73px)]">
        {/* Left Panel - 30% */}
        <div className="hidden md:block md:w-[30%] border-r border-neutral-800 overflow-hidden bg-neutral-900">
          <Sidebar onOpenHistory={() => setIsHistoryOpen(true)} />
        </div>

        {/* Right Panel - 70% */}
        <div className="flex-1 overflow-hidden bg-neutral-950">
          <MainContent latestLocation={latestLocation} />
        </div>
      </div>

      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />
    </div>
  );
}
