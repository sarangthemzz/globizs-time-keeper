import { NextResponse } from "next/server";
import { verifyOTP, verifyOtpSchema } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await verifyOTP(verifyOtpSchema.parse(body));

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to verify OTP";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
