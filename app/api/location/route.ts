import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const locationSchema = z.object({
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

    const location = locationSchema.parse(await req.json());

    const savedLocation = await prisma.userLocation.create({
      data: {
        userId,
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
      },
    });

    console.log("[LOCATION TRACKING]", {
      userId,
      latitude: savedLocation.latitude,
      longitude: savedLocation.longitude,
      accuracy: savedLocation.accuracy,
      recordedAt: savedLocation.recordedAt.toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Location tracking error:", error);
    const message = error instanceof Error ? error.message : "Failed to save location";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
