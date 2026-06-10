import { NextResponse } from "next/server";
import { getTimeLogsByDate } from "@/lib/db";

type RouteContext = {
  params: Promise<{
    date: string;
  }>;
};

export async function GET(_req: Request, { params }: RouteContext) {
  try {
    const { date } = await params;
    const timeLogs = await getTimeLogsByDate(date);
    return NextResponse.json(timeLogs);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch time logs";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
