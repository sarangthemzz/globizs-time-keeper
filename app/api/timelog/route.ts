import { NextResponse } from "next/server";
import { createManyTimeLogs, createManyTimeLogsSchema } from "@/lib/db";
import { ZodError } from "zod";

function getValidationMessage(error: unknown, fallback: string) {
  if (error instanceof ZodError) {
    return error.issues.map((issue) => issue.message).join(" ");
  }

  return error instanceof Error ? error.message : fallback;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const timelog = await createManyTimeLogs(createManyTimeLogsSchema.parse(body));

    return NextResponse.json(timelog, { status: 201 });
  } catch (error) {
    const message = getValidationMessage(error, "Failed to create time logs");
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const timelog = await createManyTimeLogs(createManyTimeLogsSchema.parse(body));

    return NextResponse.json(timelog);
  } catch (error) {
    const message = getValidationMessage(error, "Failed to update time logs");
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
