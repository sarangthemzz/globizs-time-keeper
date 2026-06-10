"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-2">
          Something went wrong!
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          {error.message || "An unexpected error occurred."}
        </p>
        <Button onClick={reset} className="gap-2">
          Try again
        </Button>
      </div>
    </div>
  );
}
