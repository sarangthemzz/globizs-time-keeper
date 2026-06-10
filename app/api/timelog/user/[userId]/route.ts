import { NextResponse } from "next/server";
import { getUserTimeLogs, userIdSchema } from "@/lib/db";

type RouteContext = {
  params: Promise<{
    userId: string;
  }>;
};

export async function GET(_req: Request, { params }: RouteContext) {
  try {
    const { userId } = await params;
    const timeLogs = await getUserTimeLogs(userIdSchema.parse(userId));
    return NextResponse.json(timeLogs);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch time logs";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
