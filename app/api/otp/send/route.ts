import { NextResponse } from "next/server";
import { createOTP, sendOtpSchema } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phone } = sendOtpSchema.parse(body);
    const otp = await createOTP({ phone });

    return NextResponse.json(
      {
        message: "OTP generated successfully",
        otp,
      },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to generate OTP";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
