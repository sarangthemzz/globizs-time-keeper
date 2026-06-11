"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard/layout";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // If no session, navigate to sign‑in page on the client side
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/");
    }
  }, [status, router]);

  if (status === "loading") {
    return null;
  }

  if (!session) {
    return null; // Avoid rendering layout while redirecting
  }

  return <DashboardLayout />;
}
