import { NextResponse } from "next/server";
import {
  deleteTimeLog,
  timeLogIdSchema,
  updateTimeLog,
  updateTimeLogSchema,
} from "@/lib/db";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PUT(req: Request, { params }: RouteContext) {
  try {
    const body = await req.json();
    const { id } = await params;
    const timeLog = await updateTimeLog(timeLogIdSchema.parse(id), updateTimeLogSchema.parse(body));

    return NextResponse.json(timeLog);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update time log";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_req: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    const timeLog = await deleteTimeLog(timeLogIdSchema.parse(id));
    return NextResponse.json(timeLog);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete time log";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
