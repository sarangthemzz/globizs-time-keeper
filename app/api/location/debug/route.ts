import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { z } from "zod";

const debugLocationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().nonnegative().optional(),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    const userId = Number(session?.user?.id);

    if (!Number.isInteger(userId) || userId <= 0) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const location = debugLocationSchema.parse(await req.json());

    console.log("[LOCATION DEBUG]", {
      userId,
      latitude: location.latitude,
      longitude: location.longitude,
      accuracy: location.accuracy,
      capturedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Location debug error:", error);
    const message = error instanceof Error ? error.message : "Failed to log location";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
